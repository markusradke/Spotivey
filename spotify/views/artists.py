"""Artist retrieval views (top artists and followed artists)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import Participant, TopArtist, FollowedArtist
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.field_extractors import extract_artist_fields
from spotify.utils.retrieval_helpers import get_participant_from_session, sample_items
from spotify.utils.spotify_api import execute_spotify_api_request


def _build_and_create_artists(items, model_class, participant, max_sample=50):
    """
    Build artist model instances and bulk create them.
    
    Args:
        items: List of artist items from Spotify API
        model_class: TopArtist or FollowedArtist
        participant: Participant instance
        max_sample: Maximum number of artists to sample
    
    Returns:
        List of artist dictionaries for response
    """
    sampled_items = sample_items(items, max_sample)
    
    artists_to_create = []
    for artist_item in sampled_items:
        fields = extract_artist_fields(artist_item)
        fields['participant'] = participant
        fields['confirmed'] = False
        artists_to_create.append(model_class(**fields))
    
    bulk_create_with_retry(model_class, artists_to_create)
    return [artist.to_dict() for artist in artists_to_create]


class TopArtists(APIView):
    """Get user's top artists from Spotify."""

    def post(self, request, format=None):
        participant, error_response = get_participant_from_session(request)
        if error_response:
            return error_response

        limit = request.GET.get('limit', 50)
        time_range = request.GET.get('timeRange', 'medium_term')
        endpoint = f"me/top/artists?time_range={time_range}&limit={limit}"

        response = execute_spotify_api_request(request.session.session_key, endpoint)
        
        if 'error' in response or 'items' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        items = response.get('items')
        response_data = _build_and_create_artists(
            items, 
            TopArtist, 
            participant,
            max_sample=50
        )

        return Response(response_data, status=status.HTTP_200_OK)


class GetFollowedArtistsSpotify(APIView):
    """Get artists followed by the user."""

    def post(self, request, format=None):
        participant, error_response = get_participant_from_session(request)
        if error_response:
            return error_response

        limit = request.GET.get('limit', 50)
        endpoint = f"me/following?type=artist&limit={limit}"

        response = execute_spotify_api_request(request.session.session_key, endpoint)
        
        if 'error' in response or 'artists' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        items = response.get('artists', {}).get('items', [])
        response_data = _build_and_create_artists(
            items, 
            FollowedArtist, 
            participant,
            max_sample=50
        )

        return Response(response_data, status=status.HTTP_200_OK)
