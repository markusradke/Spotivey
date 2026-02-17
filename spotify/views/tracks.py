"""Track retrieval views (saved, top, and recently played tracks)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import TopTrack, SavedTrack, RecentTrack
from spotify.utils.batch_operations import batch_fetch_albums, batch_fetch_artists
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import execute_spotify_api_request
from spotify.utils.field_extractors import extract_base_track_fields


def _collect_caches(session_key, items, track_extractor):
    album_ids = set()
    artist_ids = set()
    for item in items:
        t = track_extractor(item)
        album_ids.add(t['album']['id'])
        for artist in t['artists']:
            artist_ids.add(artist['id'])
    albums_cache = batch_fetch_albums(session_key, album_ids)
    artists_cache = batch_fetch_artists(session_key, artist_ids)
    return albums_cache, artists_cache


def _build_and_create_tracks(session_key, items, track_extractor, model_class,
                                                         participant, extra_fields_fn=None):
    albums_cache, artists_cache = _collect_caches(
        session_key, items, track_extractor
    )

    tracks_to_create = []
    for item in items:
        track_obj = track_extractor(item)
        fields = extract_base_track_fields(track_obj, albums_cache, artists_cache)
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
        time_range = request.GET.get('timeRange', 'medium_term')
        endpoint = f"me/top/tracks?time_range={time_range}&limit={limit}"

        response = execute_spotify_api_request(request.session.session_key, endpoint)
        if 'error' in response:
            return Response({'error': response},
                                            status=status.HTTP_204_NO_CONTENT)

        items = response.get("items")
        response_data = _build_and_create_tracks(
            request.session.session_key,
            items,
            lambda item: item,
            TopTrack,
            participant
        )

        return Response(response_data, status=status.HTTP_200_OK)


class GetSavedTracksSpotify(APIView):
    """Get user's saved (liked) tracks from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit')
        response = execute_spotify_api_request(request.session.session_key,
                                                f"me/tracks?limit={limit}")
        if 'error' in response:
            return Response({'error': response},
                                            status=status.HTTP_204_NO_CONTENT)
        items = response.get("items")

        response_data = _build_and_create_tracks(
            request.session.session_key,
            items,
            lambda item: item['track'],
            SavedTrack,
            participant,
            extra_fields_fn=lambda item: {
                'added_at': item.get('added_at', None)
            }
        )

        return Response(response_data, status=status.HTTP_201_CREATED)


class GetRecentlyPlayedTracksSpotify(APIView):
    """Get user's recently played tracks from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit')
        response = execute_spotify_api_request(
            request.session.session_key,
            f"me/player/recently-played?limit={limit}"
        )
        if 'error' in response:
            return Response({'error': response},
                                            status=status.HTTP_204_NO_CONTENT)
        items = response.get("items")

        def _recent_extra(item):
            extra = {'played_at': item.get('played_at', None)}
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

        return Response(response_data, status=status.HTTP_201_CREATED)