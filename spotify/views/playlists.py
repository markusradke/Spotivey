"""Playlist retrieval view."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import random

from spotify.models import CurrentPlaylist
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import execute_spotify_api_request


def _extract_playlist_fields(playlist_item, current_user_id):
    """Extract playlist fields from Spotify API response."""
    owner_id = playlist_item.get('owner', {}).get('id', '')
    images = playlist_item.get('images', [])
    
    return {
        'playlist_id': playlist_item.get('id', ''),
        'playlist_name': playlist_item.get('name', ''),
        'playlist_cover': images[0].get('url', '') if images else '',
        'is_collaborative': playlist_item.get('collaborative', False),
        'is_public': playlist_item.get('public', False),
        'is_self_owned': owner_id == current_user_id,
        'n_tracks': playlist_item.get('tracks', {}).get('total', 0),
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

        public_filter = None
        if public_check is not None:
            # will check for public playlists if public_check is 'true', otherwise will not filter by public status
            public_filter = public_check.lower() == 'false' 
        print(f"Public filter for playlists: {public_filter}")
        
        endpoint = f"me/playlists?offset=0&limit={limit}"
        response = execute_spotify_api_request(
            request.session.session_key, 
            endpoint
        )

        if 'error' in response or 'items' not in response:
            return Response({'error': response}, 
                          status=status.HTTP_204_NO_CONTENT)

        items = response.get('items', [])
        
        response_data = _build_and_create_playlists(
            request.session.session_key,
            items,
            participant,
            public_filter=public_filter
        )

        return Response(response_data, status=status.HTTP_200_OK)