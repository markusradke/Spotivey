"""Track retrieval views (saved, top, and recently played tracks)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, SavedTrack, RecentTrack
from spotify.utils.batch_operations import batch_fetch_albums, batch_fetch_artists
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import execute_spotify_api_request, retrieve_spotify_data
from spotify.utils.field_extractors import extract_base_track_fields


def _collect_artist_cache(session_key, items, track_extractor):
    artist_ids = set()
    for item in items:
        t = track_extractor(item)
        for artist in t['artists']:
            artist_ids.add(artist['id'])
    artists_cache = batch_fetch_artists(session_key, artist_ids)
    return artists_cache


def _build_and_create_tracks(session_key, items, track_extractor, model_class,
                                                         participant, extra_fields_fn=None):
    current_settings = participant.settings
    if current_settings.collect_track_artistgenres:
        artists_cache = _collect_artist_cache(
            session_key, items, track_extractor
        )
    else:
        artists_cache = {}

    tracks_to_create = []
    for item in items:
        track_obj = track_extractor(item)
        fields = extract_base_track_fields(track_obj, artists_cache)
        if extra_fields_fn is not None:
            fields.update(extra_fields_fn(item))
        fields['participant'] = participant
        fields['confirmed'] = False
        tracks_to_create.append(model_class(**fields))

    bulk_create_with_retry(model_class, tracks_to_create)
    return [t.to_dict() for t in tracks_to_create]


class GetTopTracks(APIView):
    def post(self, request, format=None):
        participant, error = get_participant_from_session(request)
        if error:
            return error

        limit = request.GET.get('limit', 50)
        time_range = request.GET.get('timeRange', '')
        endpoint = f"me/top/tracks?time_range={time_range}"

        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, participant, datatype='top_tracks')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        total = response.get("total", 0)
        if time_range == 'short_term':
            participant.total_top_tracks_shortterm = total
        elif time_range == 'medium_term':
            participant.total_top_tracks_mediumterm = total
        elif time_range == 'long_term':
            participant.total_top_tracks_longterm = total
        participant.save()  

        items = response.get("items")
        response_data = _build_and_create_tracks(
            request.session.session_key,
            items,
            lambda item: item,
            self.model_class,
            participant
        )

        return Response(response_data, status=status.HTTP_200_OK)
    

class GetTopTracksShortTerm(GetTopTracks):
    """Get user's top tracks in the short term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopTrackShortTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'short_term'
        return super().post(request, format)
    
class GetTopTracksMediumTerm(GetTopTracks):
    """Get user's top tracks in the medium term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopTrackMediumTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'medium_term'
        return super().post(request, format)
    
class GetTopTracksLongTerm(GetTopTracks):
    """Get user's top tracks in the long term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopTrackLongTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'long_term'
        return super().post(request, format)

class GetSavedTracksSpotify(APIView):
    """Get user's saved (liked) tracks from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        endpoint = "me/tracks"
        limit = request.GET.get('limit')
        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, participant, datatype='saved_tracks')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        
        total = response.get("total", 0)
        participant.total_saved_tracks = total
        participant.save()
        
        items = response.get("items")
        response_data = _build_and_create_tracks(
            request.session.session_key,
            items,
            lambda item: item['track'],
            SavedTrack,
            participant,
            extra_fields_fn=lambda item: {
                'added_at': item.get('added_at', None),
                'position': item.get('position', None)
            }
        )

        return Response(response_data, status=status.HTTP_200_OK)


class GetRecentlyPlayedTracksSpotify(APIView):
    """Get user's recently played tracks from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit')
        endpoint = "me/player/recently-played"
        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, participant, datatype='recently_played')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        
        items = response.get("items")

        def _recent_extra(item):
            extra = {'played_at': item.get('played_at', None), 'position': item.get('position', None)}
            ctx = item.get('context')
            if ctx is not None:
                extra['context_type'] = ctx.get('type', '')
                extra['context_uri'] = ctx.get('uri', '')
            else:
                extra['context_type'] = ''
                extra['context_uri'] = ''
            return extra

        response_data = _build_and_create_tracks(
            request.session.session_key,
            items,
            lambda item: item['track'],
            RecentTrack,
            participant,
            extra_fields_fn=_recent_extra
        )

        return Response(response_data, status=status.HTTP_200_OK)