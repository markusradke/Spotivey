"""Track retrieval views (saved, top, and recently played tracks)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import numpy as np
import random
import json

from spotify.models import Participant, TopTrack, SavedTrack, RecentTrack
from spotify.utils.batch_operations import batch_fetch_audio_features, batch_fetch_albums, batch_fetch_artists
from spotify.utils.bulk_db import bulk_create_with_retry, bulk_update_fields
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import execute_spotify_api_request, getAudioFeatures
from spotify.utils.field_extractors import extract_base_track_fields


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
            return Response({'error': response}, status=status.HTTP_204_NO_CONTENT)
        
        items = response.get("items")
        track_ids = [item['id'] for item in items]
        album_ids = set([item['album']['id'] for item in items])
        artist_ids = set()
        for item in items:
            for artist in item["artists"]:
                artist_ids.add(artist["id"])
        
        albums_cache = batch_fetch_albums(request.session.session_key, album_ids)
        artists_cache = batch_fetch_artists(request.session.session_key, artist_ids)
        # audio_features_cache = batch_fetch_audio_features(request.session.session_key, track_ids)
        
        tracks_to_create = []
        for item in items:
            fields = extract_base_track_fields(item, albums_cache, artists_cache)
            fields['participant'] = participant
            fields['confirmed'] = False
            tracks_to_create.append(TopTrack(**fields))
        
        created_tracks = bulk_create_with_retry(TopTrack, tracks_to_create)
        
        return Response([track.to_dict() for track in tracks_to_create], 
                        status=status.HTTP_200_OK)


class GetSavedTracksSpotify(APIView):
    """Get user's saved (liked) tracks from Spotify."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit')
        response = execute_spotify_api_request(request.session.session_key, f"me/tracks?limit={limit}")
        items = response.get("items")
        
        track_ids = [item["track"]["id"] for item in items]
        album_ids = set(item["track"]["album"]["id"] for item in items)
        artist_ids = set()
        for item in items:
            for artist in item["track"]["artists"]:
                artist_ids.add(artist["id"])
        
        albums_cache = batch_fetch_albums(request.session.session_key, album_ids)
        artists_cache = batch_fetch_artists(request.session.session_key, artist_ids)
        # audio_features_cache = batch_fetch_audio_features(request.session.session_key, track_ids)

        tracks_to_create = []
        for item in items:
            fields = extract_base_track_fields(item['track'], albums_cache, artists_cache)
            fields['added_at'] = item.get('added_at', None)
            fields['participant'] = participant
            fields['confirmed'] = False
            tracks_to_create.append(SavedTrack(**fields))

        bulk_create_with_retry(SavedTrack, tracks_to_create)
        response_data = [track.to_dict() for track in tracks_to_create]
        return Response(response_data, status=status.HTTP_201_CREATED)


class GetRecentlyPlayedTracksSpotify(APIView):
    """Get user's recently played tracks from Spotify."""
    
    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response

        limit = request.GET.get('limit')
        response = execute_spotify_api_request(request.session.session_key, f"me/player/recently-played?limit={limit}")
        items = response.get("items")
        
        track_ids = [item["track"]["id"] for item in items]
        album_ids = set(item["track"]["album"]["id"] for item in items)
        artist_ids = set()
        for item in items:
            for artist in item["track"]["artists"]:
                artist_ids.add(artist["id"])
        
        albums_cache = batch_fetch_albums(request.session.session_key, album_ids)
        artists_cache = batch_fetch_artists(request.session.session_key, artist_ids)
        # audio_features_cache = batch_fetch_audio_features(request.session.session_key, track_ids)

        tracks_to_create = []
        for item in items:
            fields = extract_base_track_fields(item['track'], albums_cache, artists_cache)
            fields['played_at'] = item.get('played_at', None)
            if item.get('context') is not None:
                fields['context_type'] = item.get('context').get('type', '')
                fields['context_uri'] = item.get('context').get('uri', '')
            else:
                fields['context_type'] = ''
                fields['context_uri'] = ''
            fields['participant'] = participant
            fields['confirmed'] = False
            tracks_to_create.append(RecentTrack(**fields))

        bulk_create_with_retry(RecentTrack, tracks_to_create)
        response_data = [track.to_dict() for track in tracks_to_create]
        return Response(response_data, status=status.HTTP_201_CREATED)