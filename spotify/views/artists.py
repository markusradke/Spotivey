"""Artist retrieval views (top artists and followed artists)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import numpy as np
import random

from spotify.models import Participant, TopArtist, FollowedArtist
from spotify.utils.spotify_api import execute_spotify_api_request


class TopArtists(APIView):
    """Get user's top artists from Spotify."""
    
    lookup_url_kwarg_limit = "limit"
    lookup_url_kwarg_timeRange = "timeRange"

    def post(self, request, format=None):
        confirm = False if request.data.get("confirm") else True

        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant session not found'}, status=status.HTTP_404_NOT_FOUND)

        limit = request.GET.get(self.lookup_url_kwarg_limit)
        timeRange = request.GET.get(self.lookup_url_kwarg_timeRange)
        endpoint = "me/top/artists?time_range=" + timeRange + "&limit=" + limit

        host = self.request.session.session_key
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "items" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")

        anzahl_artists = 50

        if int(limit) < anzahl_artists:
            anzahl_artists = int(limit)

        random_10 = random.sample(range(int(limit)), anzahl_artists)
        artists_infos = []

        item = np.array(item)
        item_top = list(item[random_10])

        for j in range(anzahl_artists):
            item_top_j = item_top[j]
            artists_name = item_top_j.get("name")
            artists_type = item_top_j.get("type")
            artists_popularity = item_top_j.get("popularity")
            artists_followers = item_top_j.get("followers").get("total")
            artists_cover_item = item_top_j.get("images")
            if len(artists_cover_item) > 0:
                artists_cover = artists_cover_item[0].get("url")
            else:
                artists_cover = ""

            artists_genre_helper = item_top_j.get("genres")
            artists_genre = ""
            for zaehlerGenre in range(len(artists_genre_helper)):
                if zaehlerGenre > 0:
                    artists_genre += ", "
                artists_genre += artists_genre_helper[zaehlerGenre]

            artists_id = item_top_j.get("id")

            artistsInfoData = {
                "artist": artists_name.replace('"', "'"),
                "type": artists_type,
                "popularity": artists_popularity,
                "followers": artists_followers,
                "image_url": artists_cover,
                "genre_string": artists_genre,
                "id": artists_id,
            }

            topArtistsSpotify = TopArtist(
                data=artistsInfoData,
                confirm=confirm,
                participant=participant,
            )
            topArtistsSpotify.save()

            artists_infos.append(artistsInfoData)

        return Response(artists_infos, status=status.HTTP_200_OK)


class GetFollowedArtistsSpotify(APIView):
    """Get artists followed by the user."""
    
    lookup_url_kwarg_limit = "limit"

    def post(self, request, format=None):
        host = self.request.session.session_key
        limit = request.GET.get(self.lookup_url_kwarg_limit)

        confirm = False if request.data.get("confirm") else True

        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant session not found'}, status=status.HTTP_404_NOT_FOUND)

        endpoint = "me/following?type=artist&limit=" + limit

        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "artists" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("artists").get("items")

        anzahl_artists = 50

        if int(limit) < anzahl_artists:
            anzahl_artists = int(limit)

        random_10 = random.sample(range(int(limit)), anzahl_artists)
        artists_infos = []

        item = np.array(item)
        item_top = list(item[random_10])

        for j in range(anzahl_artists):
            item_top_j = item_top[j]
            artists_name = item_top_j.get("name")
            artists_type = item_top_j.get("type")
            artists_popularity = item_top_j.get("popularity")
            artists_followers = item_top_j.get("followers").get("total")
            artists_cover_item = item_top_j.get("images")
            if len(artists_cover_item) > 0:
                artists_cover = artists_cover_item[0].get("url")
            else:
                artists_cover = ""
            artists_genre_helper = item_top_j.get("genres")
            artists_genre = ""
            for zaehlerGenre in range(len(artists_genre_helper)):
                if zaehlerGenre > 0:
                    artists_genre += ", "
                artists_genre += artists_genre_helper[zaehlerGenre]
            artists_id = item_top_j.get("id")

            artistsInfoData = {
                "artist": artists_name.replace('"', "'"),
                "type": artists_type,
                "popularity": artists_popularity,
                "followers": artists_followers,
                "image_url": artists_cover,
                "genre_string": artists_genre,
                "id": artists_id,
            }

            followedArtistsSpotify = FollowedArtist(
                data=artistsInfoData,
                confirm=confirm,
                participant=participant,
            )
            followedArtistsSpotify.save()

            artists_infos.append(artistsInfoData)

        return Response(artists_infos, status=status.HTTP_200_OK)