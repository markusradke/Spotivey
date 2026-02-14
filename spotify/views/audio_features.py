"""Audio features retrieval from Spotify API."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import numpy as np

from api.models import RetrievalSetting
from ..models import SavedTrack, TopTrack, RecentTrack, AudioFeatures
from ..utils.spotify_api import execute_spotify_api_request


class GetAudioFeaturesSpotify(APIView):
    """
    Get audio features for tracks.
    Batches requests to Spotify's audio-features endpoint.
    """
    lookup_url_kwarg_ID = "surveyID"
    lookup_url_kwarg_dataString = "dataString"

    def get(self, request, format=None):
        surveyID = request.GET.get(self.lookup_url_kwarg_ID)
        if surveyID is not None:
            if not self.request.session.exists(self.request.session.session_key):
                self.request.session.create()

            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)

            dataString = request.GET.get(self.lookup_url_kwarg_dataString)

            id_list = []
            participant_list = []
            participant_id_list = []
            
            if dataString == "savedTracksData":
                searchSpotifyList = SavedTrack.objects.filter(
                    participant__settings__in=settings
                ).values_list(dataString, "participant")
            elif dataString == "topTracksData":
                searchSpotifyList = TopTrack.objects.filter(
                    participant__settings__in=settings
                ).values_list(dataString, "participant")
            elif dataString == "recentlyTracksData":
                searchSpotifyList = RecentTrack.objects.filter(
                    participant__settings__in=settings
                ).values_list(dataString, "participant")
            else:
                return Response(
                    {"Bad Request": "dataString parameter not found in request"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if len(searchSpotifyList) > 0:
                for zaehler in range(len(searchSpotifyList)):
                    trackListResult = list(
                        filter(lambda d: d["participant"] == searchSpotifyList[zaehler][1], searchSpotifyList)
                    )
                    participant_list.append(trackListResult[0].get("participant"))
                    participant_id_list.append(trackListResult[0].get("participant"))
                    id_list.append(trackListResult[0].get("spotify_id"))

            maxResponse = 100
            von = 0
            bis = 99
            responseList = []
            acousticness_array = []
            danceability_array = []
            energy_array = []
            key_array = []
            loudness_array = []
            speechiness_array = []
            instrumentalness_array = []
            liveness_array = []
            valence_array = []
            tempo_array = []
            duration_ms_array = []

            while von < len(id_list):
                id_list_search_string = ",".join(id_list[von : bis + 1])

                endpoint = "audio-features?ids=" + id_list_search_string

                response = execute_spotify_api_request(
                    self.request.session.session_key, endpoint
                )

                responseList.append(response)

                for i, data in enumerate(response.get("audio_features")):
                    acousticness_array.append(data.get("acousticness"))
                    danceability_array.append(data.get("danceability"))
                    energy_array.append(data.get("energy"))
                    key_array.append(data.get("key"))
                    loudness_array.append(data.get("loudness"))
                    speechiness_array.append(data.get("speechiness"))
                    instrumentalness_array.append(data.get("instrumentalness"))
                    liveness_array.append(data.get("liveness"))
                    valence_array.append(data.get("valence"))
                    tempo_array.append(data.get("tempo"))
                    duration_ms_array.append(data.get("duration_ms"))

                    dataAudioFeatures = {
                        "acousticness": data.get("acousticness"),
                        "danceability": data.get("danceability"),
                        "energy": data.get("energy"),
                        "key": data.get("key"),
                        "loudness": data.get("loudness"),
                        "speechiness": data.get("speechiness"),
                        "instrumentalness": data.get("instrumentalness"),
                        "liveness": data.get("liveness"),
                        "valence": data.get("valence"),
                        "tempo": data.get("tempo"),
                        "duration_ms": data.get("duration_ms"),
                        "spotify_id": id_list[von + i],
                        "participant": participant_id_list[von + i],
                    }

                    filterAF = AudioFeatures.objects.filter(
                        participant=participant_list[von + i],
                        dataString=dataString,
                        data__spotify_id=id_list[von + i],
                    )

                    if not filterAF.exists():
                        af = AudioFeatures(
                            dataString=dataString,
                            data=dataAudioFeatures,
                            participant=participant_list[von + i],
                        )
                        af.save()

                von = von + maxResponse
                bis = bis + maxResponse

            hist_acousticness_y, hist_x = np.histogram(
                np.array(acousticness_array), bins=20, range=(0, 1)
            )
            hist_danceability_y, x = np.histogram(
                np.array(danceability_array), bins=20, range=(0, 1)
            )
            hist_energy_y, x = np.histogram(
                np.array(energy_array), bins=20, range=(0, 1)
            )
            hist_key_y, x = np.histogram(np.array(key_array), bins=20, range=(0, 1))
            hist_loudness_y, loudness_x = np.histogram(
                np.array(loudness_array), bins=20, range=(-60, 0)
            )
            hist_speechiness_y, x = np.histogram(
                np.array(speechiness_array), bins=20, range=(0, 1)
            )
            hist_instrumentalness_y, x = np.histogram(
                np.array(instrumentalness_array), bins=20, range=(0, 1)
            )
            hist_liveness_y, x = np.histogram(
                np.array(liveness_array), bins=20, range=(0, 1)
            )
            hist_valence_y, x = np.histogram(
                np.array(valence_array), bins=20, range=(0, 1)
            )
            hist_tempo_y, x = np.histogram(np.array(tempo_array), bins=20, range=(0, 1))
            hist_duration_ms_y, x = np.histogram(
                np.array(duration_ms_array), bins=20, range=(0, 1)
            )

            finalList = []
            for d in responseList:
                for i in d.get("audio_features"):
                    finalList.append(i)

            return Response(
                {
                    "data": finalList,
                    "hist_x": np.round(hist_x, 3),
                    "hist_acousticness": hist_acousticness_y,
                    "hist_danceability": hist_danceability_y,
                    "hist_energy": hist_energy_y,
                    "hist_key": hist_key_y,
                    "hist_loudness": hist_loudness_y,
                    "hist_speechiness": hist_speechiness_y,
                    "hist_instrumentalness": hist_instrumentalness_y,
                    "hist_liveness": hist_liveness_y,
                    "hist_valence": hist_valence_y,
                    "hist_tempo": hist_tempo_y,
                    "hist_duration_ms": hist_duration_ms_y,
                    "loudness_x": np.round(loudness_x, 3),
                    "id_list": id_list,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"Bad Request": "Code parameter not found in request"},
                status=status.HTTP_400_BAD_REQUEST,
            )