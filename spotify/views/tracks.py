"""Track retrieval views (saved, top, and recently played tracks)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import numpy as np
import random

from ..models import Participant, TopTrack, SavedTrack, RecentTrack
from ..utils.spotify_api import execute_spotify_api_request, getAudioFeatures


class TopTracks(APIView):
    """Get user's top tracks from Spotify."""
    
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
        endpoint = "me/top/tracks?time_range=" + timeRange + "&limit=" + limit

        host = self.request.session.session_key
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "items" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")

        anzahl_tracks = 50

        if int(limit) < anzahl_tracks:
            anzahl_tracks = int(limit)

        random_10 = random.sample(range(int(limit)), anzahl_tracks)
        track_infos = []
        item = np.array(item)
        item_top = list(item[random_10])
        
        for j in range(anzahl_tracks):
            item_top_j = item_top[j]
            duration_ms = item_top_j.get("duration_ms")
            explicit = item_top_j.get("explicit")
            isrc = item_top_j.get("external_ids").get("isrc")
            name = item_top_j.get("name")
            track_uri = item_top_j.get("uri")
            track_id = item_top_j.get("id")

            dataAudioFeatures = getAudioFeatures(host, track_id)
            popularity = item_top_j.get("popularity")
            item_topj_album = item_top_j.get("album")
            endpoint = f"albums/{item_topj_album.get('id')}"
            response2 = execute_spotify_api_request(host, endpoint)

            if "error" in response2:
                return Response(response2, status=status.HTTP_204_NO_CONTENT)

            albumLabel = response2.get("label")
            albumName = response2.get("name")
            releaseDate = response2.get("release_date")

            tracks_cover = item_topj_album.get("images")[0].get("url")
            album_type = item_topj_album.get("album_type")

            artists_string = []
            id_string = []
            artists_string_mit_komma = []

            for i, artist in enumerate(item_top_j.get("artists")):
                name_artist = artist.get("name")
                artists_string.append(name_artist)
                if i > 0:
                    artists_string_mit_komma += ", "
                name_artist = artist.get("name")
                artists_string_mit_komma += name_artist
                id_string.append(artist.get("id"))

            spotify_artist_genre = []
            for k in range(len(id_string)):
                artist_endpoint = "artists/" + id_string[k]
                resonse_artist = execute_spotify_api_request(host, artist_endpoint)
                if "genres" in resonse_artist:
                    spotify_artist_genre.append(resonse_artist["genres"])
                else:
                    spotify_artist_genre.append("")

            tracksInfoData = {
                "track_name": name.replace('"', "'"),
                "album_type": album_type,
                "duration_ms": duration_ms,
                "image_url": tracks_cover,
                "explicit": explicit,
                "isrc": isrc,
                "spotify_id": track_id,
                "popularity": popularity,
                "spotify_artist_string": artists_string_mit_komma,
                "spotify_artist_string_ohne_komma": artists_string,
                "spotify_artist_id": id_string,
                "track_uri": track_uri,
                "albumLabel": albumLabel,
                "albumName": albumName.replace('"', "'"),
                "releaseDate": releaseDate,
                "spotify_artist_genre": spotify_artist_genre,
                "dataAudioFeatures": dataAudioFeatures,
            }

            topTracksSpotify = TopTrack(
                data=tracksInfoData,
                confirm=confirm,
                participant=participant,
            )
            topTracksSpotify.save()

            track_infos.append(tracksInfoData)

        return Response(track_infos, status=status.HTTP_200_OK)


class GetSavedTracksSpotify(APIView):
    """Get user's saved (liked) tracks from Spotify."""
    
    lookup_url_kwarg_limit = "limit"
    lookup_url_kwarg_market = "market"

    def post(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        confirm = False if request.data.get("confirm") else True

        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant session not found'}, status=status.HTTP_404_NOT_FOUND)

        limit = request.GET.get(self.lookup_url_kwarg_limit)
        market = request.GET.get(self.lookup_url_kwarg_market)

        if market != "":
            endpoint = "me/tracks?market=" + market + "&limit=" + limit
        else:
            endpoint = "me/tracks?limit=" + limit

        host = self.request.session.session_key
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "items" not in response:
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")

        anzahl_tracks = 50
        if int(limit) < anzahl_tracks:
            anzahl_tracks = int(limit)

        random_10 = random.sample(range(int(limit)), anzahl_tracks)
        track_infos = []
        item = np.array(item)
        item_top = list(item[random_10])
        
        for j in range(anzahl_tracks):
            item_top_j = item_top[j]
            duration_ms = item_top_j.get("track").get("duration_ms")
            added_at = item_top_j.get("added_at")
            explicit = item_top_j.get("explicit")
            isrc = item_top_j.get("track").get("external_ids").get("isrc")
            name = item_top_j.get("track").get("name")
            track_uri = item_top_j.get("track").get("uri")
            track_id = item_top_j.get("track").get("id")

            dataAudioFeatures = getAudioFeatures(host, track_id)
            popularity = item_top_j.get("track").get("popularity")
            item_topj_album = item_top_j.get("track").get("album")
            endpoint = f"albums/{item_topj_album.get('id')}"
            response2 = execute_spotify_api_request(host, endpoint)

            if "error" in response2:
                return Response(response2, status=status.HTTP_204_NO_CONTENT)

            albumLabel = response2.get("label")
            albumName = response2.get("name")
            releaseDate = response2.get("release_date")

            tracks_cover = item_topj_album.get("images")[0].get("url")
            album_type = item_topj_album.get("album_type")

            artists_string = []
            id_string = []
            artists_string_mit_komma = []

            for i, artist in enumerate(item_top_j.get("track").get("artists")):
                name_artist = artist.get("name")
                artists_string.append(name_artist)
                if i > 0:
                    artists_string_mit_komma += ", "
                name_artist = artist.get("name")
                artists_string_mit_komma += name_artist
                id_string.append(artist.get("id"))

            spotify_artist_genre = []
            for k in range(len(id_string)):
                artist_endpoint = "artists/" + id_string[k]
                resonse_artist = execute_spotify_api_request(host, artist_endpoint)
                if "genres" in resonse_artist:
                    spotify_artist_genre.append(resonse_artist["genres"])
                else:
                    spotify_artist_genre.append("")

            tracksInfoData = {
                "albumLabel": albumLabel,
                "albumName": albumName.replace('"', "'"),
                "releaseDate": releaseDate,
                "track_name": name.replace('"', "'"),
                "album_type": album_type,
                "duration_ms": duration_ms,
                "image_url": tracks_cover,
                "added_at": added_at,
                "explicit": explicit,
                "isrc": isrc,
                "spotify_id": track_id,
                "popularity": popularity,
                "spotify_artist_string": artists_string_mit_komma,
                "spotify_artist_string_ohne_komma": artists_string,
                "spotify_artist_id": id_string,
                "track_uri": track_uri,
                "spotify_artist_genre": spotify_artist_genre,
                "dataAudioFeatures": dataAudioFeatures,
            }

            savedTracksSpotify = SavedTrack(
                data=tracksInfoData,
                confirm=confirm,
                participant=participant,
            )
            savedTracksSpotify.save()

            track_infos.append(tracksInfoData)

        return Response(track_infos, status=status.HTTP_200_OK)


class GetRecentlyPlayedTracksSpotify(APIView):
    """Get user's recently played tracks from Spotify."""
    
    lookup_url_kwarg_limit = "limit"

    def post(self, request, format=None):
        host = self.request.session.session_key
        confirm = False if request.data.get("confirm") else True

        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant session not found'}, status=status.HTTP_404_NOT_FOUND)

        limit = request.GET.get(self.lookup_url_kwarg_limit)
        endpoint = "me/player/recently-played?limit=" + limit

        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "items" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")

        anzahl_tracks = 50
        if int(limit) < anzahl_tracks:
            anzahl_tracks = int(limit)

        random_10 = random.sample(range(int(limit)), anzahl_tracks)
        track_infos = []
        item = np.array(item)
        item_top = list(item[random_10])

        for j in range(anzahl_tracks):
            item_top_j = item_top[j]
            item_top_j_track = item_top_j.get("track")
            duration_ms = item_top_j_track.get("duration_ms")
            playedAt = item_top_j.get("played_at")
            contextType = ""
            contextUri = ""
            if item_top_j.get("context") != None:
                contextType = item_top_j.get("context").get("type")
                contextUri = item_top_j.get("context").get("uri")

            explicit = item_top_j_track.get("explicit")
            isrc = item_top_j_track.get("external_ids").get("isrc")
            name = item_top_j_track.get("name")
            track_uri = item_top_j_track.get("uri")
            track_id = item_top_j_track.get("id")

            dataAudioFeatures = getAudioFeatures(host, track_id)
            popularity = item_top_j_track.get("popularity")

            item_topj_album = item_top_j_track.get("album")
            endpoint = f"albums/{item_topj_album.get('id')}"
            response2 = execute_spotify_api_request(host, endpoint)

            if "error" in response2:
                return Response(response2, status=status.HTTP_204_NO_CONTENT)

            albumLabel = response2.get("label")
            albumName = response2.get("name")
            releaseDate = response2.get("release_date")

            tracks_cover = item_topj_album.get("images")[0].get("url")
            album_type = item_topj_album.get("album_type")

            artists_string = []
            id_string = []
            artists_string_mit_komma = []

            for i, artist in enumerate(item_top_j_track.get("artists")):
                name_artist = artist.get("name")
                artists_string.append(name_artist)
                if i > 0:
                    artists_string_mit_komma += ", "
                name_artist = artist.get("name")
                artists_string_mit_komma += name_artist
                id_string.append(artist.get("id"))

            spotify_artist_genre = []
            for k in range(len(id_string)):
                artist_endpoint = "artists/" + id_string[k]
                resonse_artist = execute_spotify_api_request(host, artist_endpoint)
                if "genres" in resonse_artist:
                    spotify_artist_genre.append(resonse_artist["genres"])
                else:
                    spotify_artist_genre.append("")

            tracksInfoData = {
                "albumLabel": albumLabel,
                "albumName": albumName.replace('"', "'"),
                "releaseDate": releaseDate,
                "track_name": name.replace('"', "'"),
                "album_type": album_type,
                "duration_ms": duration_ms,
                "image_url": tracks_cover,
                "playedAt": playedAt,
                "contextType": contextType,
                "contextUri": contextUri,
                "explicit": explicit,
                "isrc": isrc,
                "spotify_id": track_id,
                "popularity": popularity,
                "spotify_artist_string": artists_string_mit_komma,
                "spotify_artist_string_ohne_komma": artists_string,
                "spotify_artist_id": id_string,
                "track_uri": track_uri,
                "spotify_artist_genre": spotify_artist_genre,
                "dataAudioFeatures": dataAudioFeatures,
            }

            recentlyTracksSpotify = RecentTrack(
                data=tracksInfoData,
                confirm=confirm,
                participant=participant,
            )
            recentlyTracksSpotify.save()

            track_infos.append(tracksInfoData)

        return Response(track_infos, status=status.HTTP_200_OK)