"""Artist retrieval views (top artists and followed artists)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import Participant, TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, FollowedArtist
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.field_extractors import extract_artist_fields
from spotify.utils.retrieval_helpers import get_participant_from_session, sample_items
from spotify.utils.spotify_api import execute_spotify_api_request, retrieve_spotify_data, retrieve_spotify_followed_artists


def _build_and_create_artists(items, model_class, participant):
    """
    Build artist model instances and bulk create them.
    
    Args:
        items: List of artist items from Spotify API
        model_class: TopArtist or FollowedArtist
        participant: Participant instance
    
    Returns:
        List of artist dictionaries for response
    """
    
    artists_to_create = []
    for artist_item in items:
        fields = extract_artist_fields(artist_item)
        fields['participant'] = participant
        fields['confirmed'] = False
        artists_to_create.append(model_class(**fields))
    
    bulk_create_with_retry(model_class, artists_to_create)
    return [artist.to_dict() for artist in artists_to_create]


class GetTopArtists(APIView):
    """Get user's top artists from Spotify."""

    def post(self, request, format=None):
        participant, error_response = get_participant_from_session(request)
        if error_response:
            return error_response

        limit = request.GET.get('limit', 50)
        time_range = request.GET.get('timeRange', '')
        endpoint = f"me/top/artists?time_range={time_range}"

        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, datatype='top_artists')
        
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        total = response.get('total', 0)
        if time_range == 'short_term':
            participant.total_top_artists_shortterm = total
        elif time_range == 'medium_term':
            participant.total_top_artists_mediumterm = total
        elif time_range == 'long_term':
            participant.total_top_artists_longterm = total
        participant.save()

        items = response.get('items')
        response_data = _build_and_create_artists(
            items, 
            self.model_class, 
            participant,
        )

        return Response(response_data, status=status.HTTP_200_OK)

class GetTopArtistsShortTerm(GetTopArtists):
    """Get user's top artists in the short term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopArtistShortTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'short_term'
        return super().post(request, format)
    
class GetTopArtistsMediumTerm(GetTopArtists):
    """Get user's top artists in the medium term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopArtistMediumTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'medium_term'
        return super().post(request, format)
    
class GetTopArtistsLongTerm(GetTopArtists):
    """Get user's top artists in the long term from Spotify."""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_class = TopArtistLongTerm

    def post(self, request, format=None):
        request.GET = request.GET.copy()
        request.GET['timeRange'] = 'long_term'
        return super().post(request, format)


class GetFollowedArtistsSpotify(APIView):
    """Get artists followed by the user."""

    def post(self, request, format=None):
        participant, error_response = get_participant_from_session(request)
        if error_response:
            return error_response

        limit = request.GET.get('limit', 50)
        response = retrieve_spotify_followed_artists(request.session.session_key, limit)

        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        
        total = response.get('total', 0)
        participant.total_followed_artists = total
        participant.save()

        items = response.get('items', [])
        response_data = _build_and_create_artists(
            items, 
            FollowedArtist, 
            participant,
        )

        return Response(response_data, status=status.HTTP_200_OK)
