"""User profile retrieval view."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import Participant
from spotify.utils.spotify_api import execute_spotify_api_request
from spotify.utils.retrieval_helpers import get_participant_from_session


class GetUsersProfileSpotify(APIView):
    """Get user's Spotify profile information."""

    def post(self, request):
        participant, fail_response = get_participant_from_session(request)
        if participant is None:
            return fail_response
        
        endpoint = "me"
        response = execute_spotify_api_request(request.session.session_key, endpoint, participant=participant, type='profile')
        if "error" in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        country = response.get("country")
        followers = response.get("followers").get("total")
        product = response.get("product")

        participant.country = country
        participant.followers = followers
        participant.product = product
        participant.save()

        return Response(participant.to_dict(), status=status.HTTP_200_OK)