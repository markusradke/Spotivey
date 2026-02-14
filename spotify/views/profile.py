"""User profile retrieval view."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from ..models import Participant, ParticipantProfile
from ..utils.spotify_api import execute_spotify_api_request


class GetUsersProfileSpotify(APIView):
    """Get user's Spotify profile information."""

    def post(self, request):
        host = self.request.session.session_key
        endpoint = "me"

        response = execute_spotify_api_request(host, endpoint)

        if "error" in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        country = response.get("country")
        followers = response.get("followers").get("total")
        product = response.get("product")

        users_info = {
            "country": country,
            "followers": followers,
            "product": product,
        }

        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant session not found'}, status=status.HTTP_404_NOT_FOUND)

        usersProfileSpotify = ParticipantProfile(
            data=users_info,
            confirm=False,
            participant=participant,
        )
        usersProfileSpotify.save()

        return Response(users_info, status=status.HTTP_200_OK)