"""Playlist retrieval view."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import numpy as np
import random

from ..models import Participant, CurrentPlaylist
from ..utils.spotify_api import execute_spotify_api_request


class GetPlaylistsSpotify(APIView):
    """Get user's playlists from Spotify."""
    
    lookup_url_kwarg_limit = "limit"
    lookup_url_kwarg_public = "public"

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
        publicCheck = request.GET.get(self.lookup_url_kwarg_public)
        endpoint = "me/playlists??offset=0&limit=" + limit

        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "items" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")

        anzahl_playlists = 50

        if int(limit) < anzahl_playlists or len(item) < anzahl_playlists:
            anzahl_playlists = int(limit)
            if len(item) < anzahl_playlists:
                anzahl_playlists = len(item)

        random_10 = random.sample(range(int(anzahl_playlists)), anzahl_playlists)
        playlists_infos = []

        item = np.array(item)
        item_top = list(item[random_10])

        for j in range(anzahl_playlists):
            item_top_j = item_top[j]

            collaborative = item_top_j.get("collaborative")
            name = item_top_j.get("name")
            owner = item_top_j.get("owner").get("id")
            playlists_cover_item = item_top_j.get("images")
            if len(playlists_cover_item) > 0:
                playlists_cover = playlists_cover_item[0].get("url")
            else:
                playlists_cover = ""
            public = item_top_j.get("public")
            tracks_total = item_top_j.get("tracks").get("total")
            playlist_id = item_top_j.get("id")

            if eval(str(publicCheck).title()) != eval(str(public).title()) or eval(
                str(publicCheck).title()
            ):
                endpoint = f"playlists/{playlist_id}/tracks?limit=50"

                response2 = execute_spotify_api_request(host, endpoint)

                playlistsTracksRow = []

                if not "Error" in response2 or "items" in response:
                    playlistsTracks = response2.get("items")
                    playlistsTracksRow = []

                    for zaehlerPlaylist in range(len(playlistsTracks)):
                        trackItem = playlistsTracks[zaehlerPlaylist].get("track")
                        artists_string_mit_komma = ""
                        for i, artist in enumerate(trackItem.get("artists")):
                            name_artist = artist.get("name")
                            if i > 0:
                                artists_string_mit_komma += ", "
                            name_artist = artist.get("name")
                            artists_string_mit_komma += name_artist

                        if len(trackItem.get("album").get("images")) > 0:
                            coverTracks = trackItem.get("album").get("images")[0]
                        else:
                            coverTracks = ""

                        playlistsTracksRow.append(
                            {
                                "id": trackItem.get("id"),
                                "name": trackItem.get("name").replace('"', "'"),
                                "artistName": artists_string_mit_komma,
                                "type": trackItem.get("type"),
                                "cover": coverTracks,
                                "release_date": trackItem.get("album").get(
                                    "release_date"
                                ),
                                "duration_ms": trackItem.get("duration_ms"),
                                "isrc": trackItem.get("external_ids").get("isrc"),
                                "albumName": trackItem.get("album")
                                .get("name")
                                .replace('"', "'"),
                            }
                        )

                playlistsInfoData = {
                    "collaborative": collaborative,
                    "name": name.replace('"', "'"),
                    "owner": owner,
                    "playlists_cover": playlists_cover,
                    "public": public,
                    "tracks_total": tracks_total,
                    "id": playlist_id,
                    "playlistsTracksRow": playlistsTracksRow,
                    "tracksCheck": [],
                }

                currentPlaylistsSpotify = CurrentPlaylist(
                    data=playlistsInfoData,
                    confirm=confirm,
                    participant=participant,
                )
                currentPlaylistsSpotify.save()

                playlists_infos.append(playlistsInfoData)

        return Response(playlists_infos, status=status.HTTP_200_OK)