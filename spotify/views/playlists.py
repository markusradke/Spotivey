"""Playlist retrieval view."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import random

from spotify.models import CurrentPlaylist, PrivatePlaylistTrack
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import execute_spotify_api_request, retrieve_spotify_data


def _extract_playlist_fields(playlist_item, current_user_id):
    """Extract playlist fields from Spotify API response."""
    owner_id = playlist_item.get('owner', {}).get('id', '')
    images = playlist_item.get('images', [])
    
    return {
        'spotify_id': playlist_item.get('id', ''),
        'position': playlist_item.get('position', None),
        'playlist_name': playlist_item.get('name', ''),
        'image_url': images[0].get('url', '') if images else '',
        'is_collaborative': playlist_item.get('collaborative', False),
        'is_public': playlist_item.get('public', False),
        'is_self_owned': owner_id == current_user_id,
        'n_tracks': playlist_item.get('tracks', {}).get('total', 0),
    }


def _extract_private_playlist_track_fields(track_item, playlist):
    """Extract track fields from Spotify API response for private playlists."""
    track = track_item.get('track', {})
    if track.get('track', False):
        return {
            'playlist': playlist,
            'position': track_item.get('position', None),
            'added_at': track_item.get('added_at', None),
            'spotify_id': track.get('id', ''),
            'isrc': track.get('external_ids', {}).get('isrc', ''),
            'track_uri': track.get('uri', ''),
            'track_name': track.get('name', ''),
            'duration_ms': track.get('duration_ms', None),
            'explicit': track.get('explicit', None),
            'popularity': track.get('popularity', None),
            'album_id': track.get('album', {}).get('id', ''),
            'album_name': track.get('album', {}).get('name', ''),
            'album_label': 'NOT RETRIEVED (PRIVATE PLAYLIST)', # Spotify API does not return label for tracks in playlists, would require additional API call per track
            'album_type': track.get('album', {}).get('album_type', ''),
            'release_date': track.get('album', {}).get('release_date', ''),
            'image_url': track.get('album', {}).get('images', [{}])[0].get('url', '') if track.get('album', {}).get('images') else '',
            'artist_names': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
            'artist_ids': ', '.join([artist.get('id', '') for artist in track.get('artists', [])]),
        }
    else : # For Episodes stored in Playlists
        return {
            'playlist': playlist,
            'position': track_item.get('position', None),
            'added_at': track_item.get('added_at', None),
            'spotify_id': track.get('id', ''),
            'track_name': 'UKNOWN EPISODE (PRIVATE PLAYLIST)', 
        }

def _build_and_create_playlists(session_key, playlists, participant, 
                                  public_filter=None):
    """Build and bulk create playlist objects."""
    user_response = execute_spotify_api_request(session_key, 'me')
    current_user_id = user_response.get('id', '')
    
    filtered_playlists = []
    for playlist in playlists:
        is_public = playlist.get('public', False)
        if public_filter is not None and public_filter:
            if is_public:
                filtered_playlists.append(playlist)
        else:
            filtered_playlists.append(playlist)
    
    playlists_to_create = []
    for playlist_item in filtered_playlists:
        fields = _extract_playlist_fields(playlist_item, current_user_id)
        fields['participant'] = participant
        fields['confirmed'] = False
        playlists_to_create.append(CurrentPlaylist(**fields))
    
    bulk_create_with_retry(CurrentPlaylist, playlists_to_create)
    return [p.to_dict() for p in playlists_to_create]


class GetPlaylistsSpotify(APIView):
    """Get user's playlists from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit', 50)
        public_check = request.GET.get('public')
        get_private_check = request.GET.get('privatetracks')

        public_filter = None
        if public_check is not None:
            # will check for public playlists if public_check is 'true', otherwise will not filter by public status
            public_filter = public_check.lower() == 'false' 
        print(f"Public filter for playlists: {public_filter}")
        
        endpoint = f"me/playlists"
        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, datatype='playlists')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)


        total = response.get('total', 0)
        participant.total_current_playlists = total
        participant.save()

        items = response.get('items', [])
        
        response_data = _build_and_create_playlists(
            request.session.session_key,
            items,
            participant,
            public_filter=public_filter
        )

        if get_private_check is not None: 
            if get_private_check.lower() == 'true':
                # get all playlists for parcitipant from database and filter for privat ones
                participant_playlists = CurrentPlaylist.objects.filter(participant=participant)
                private_playlists = participant_playlists.filter(is_public=False)
                fetch_private_playlists(participant, private_playlists, request.session.session_key)

        return Response(response_data, status=status.HTTP_200_OK)
    
def fetch_private_playlists(participant, playlists, session_key):
    """Fetch private playlist tracks by their Spotify IDs."""
    for playlist in playlists:
        playlist_id = playlist.spotify_id
        n_tracks = playlist.n_tracks
        n_calls = (n_tracks // 50) + 1
        limit = 50
        offset = 0
        result = []
        for _call in range(n_calls):
            endpoint = f"playlists/{playlist_id}/items?offset={offset}&limit={limit}"
            response = execute_spotify_api_request(session_key, endpoint)
            for i, track_item in enumerate(response.get('items', [])):
                parsed = _extract_private_playlist_track_fields(track_item, playlist)
                parsed['position'] = n_calls * offset + i + 1
                result.append(parsed)
            offset += limit
        
        bulk_create_with_retry(PrivatePlaylistTrack, [
            PrivatePlaylistTrack(
                participant=participant,
                **track_data
            ) for track_data in result
        ])

        if 'error' in response:
            print(f"Error fetching playlist {playlist_id}: {response['error']}")
            continue
