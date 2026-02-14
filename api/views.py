
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth.models import User
from .util import *
from django.contrib.auth import authenticate
import numpy as np
import uuid
from spotify.models import *


class saveToCSVFileView(APIView):
    # Generates a csv file structure that is downloaded via the frontend
    # The structure contains column names of the later csv file
    # Data are determined by means of "surveyID" and assigned to the individual participant. 
    # To do this, the number of entries each respondent has is determined and a loop is run through.
    # There are n series per participant (n = entries per participant).
    # Finally, all unnecessary columns are deleted.

    lookup_url_kwarg = 'surveyID'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            rowsParticipant = []
            rowsParticipantNo = []
            rowsGesamt = []

            tracksISRC = [[], [], []]
            tracksSpotifyArtist = [[], [], []]
            tracksSpotifyName = [[], [], []]
            tracksSpotifyID = [[], [], []]
            tracksCover = [[], [], []]
            tracksAlbumLabel = [[], [], []]
            tracksAlbumName = [[], [], []]
            tracksReleaseDate = [[], [], []]
            tracksAlbumType = [[], [], []]
            tracksDuration_ms = [[], [], []]
            tracksAddedAt = [[], [], []]
            tracksPopularity = [[], [], []]
            tracksAcousticness = [[], [], []]
            tracksDanceability = [[], [], []]
            tracksEnergy = [[], [], []]
            tracksKey = [[], [], []]
            tracksLoudness = [[], [], []]
            tracksSpeechiness = [[], [], []]
            tracksInstrumentalness = [[], [], []]
            tracksLiveness = [[], [], []]
            tracksValence = [[], [], []]
            tracksTempo = [[], [], []]

            artistsType = [[], []]
            artistsPopularity = [[], []]
            artistsFollowers = [[], []]
            artistsGenre = [[], []]
            artistsCover = [[], []]
            artistsName = [[], []]
            artistsSpotifyID = [[], []]

            playlistsID = []
            playlistsCollaborative = []
            playlistsName = []
            playlistsOwner = []
            playlistsPublic = []
            playlistsTracksTotal = []
            playlistsCover = []

            userCountry = []
            userFollowers = []
            userProduct = []

            tracksPlayedAt = []
            tracksContextType = []
            tracksContextUri = []

            settingsObject = RetrievalSetting.objects.filter(umfrageID=surveyID)

            savedTracks = SavedTrack.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            topTracks = TopTrack.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            recentlyTracks = RecentTrack.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            topArtists = TopArtist.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            followedArtists = FollowedArtist.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            currentPlaylists = CurrentPlaylist.objects.filter(participant__settings__in=settingsObject, confirm=True).values_list(
                'data', 'participant').order_by('participant__participant').values()
            usersProfile = ParticipantProfile.objects.filter(participant__settings__in=settingsObject).values_list(
                'data', 'participant').order_by('participant__participant').values()
            allDataArray = [savedTracks, topTracks, recentlyTracks, topArtists, 
                followedArtists, currentPlaylists, usersProfile]

            settings = RetrievalSetting.objects.get(umfrageID=surveyID)
            howManyPartArray = [
                SavedTrack.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                TopTrack.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                RecentTrack.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                TopArtist.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                FollowedArtist.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                CurrentPlaylist.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count(),
                ParticipantProfile.objects.filter(participant__settings=settings, confirm=True).values('participant').distinct().count()
            ]

            maxParticipantCount = max(howManyPartArray)

            countDataParticipant = [[], [], [], [], [], [], []]
            
            for index, data in enumerate(allDataArray):
                if len(data) != 0:
                    countCheck = 0
                    for j in range(len(data)):
                        if index == 0:
                            if countCheck == j:
                                countCheck+=int(SavedTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(SavedTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        elif index == 1:
                            if countCheck == j:
                                countCheck+=int(TopTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(TopTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        elif index == 2:
                            if countCheck == j:
                                countCheck+=int(RecentTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(RecentTrack.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        elif index == 3:
                            if countCheck == j:
                                countCheck+=int(TopArtist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(TopArtist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        elif index == 4:
                            if countCheck == j:
                                countCheck+=int(FollowedArtist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(FollowedArtist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        elif index == 5:
                            if countCheck == j:
                                countCheck+=int(CurrentPlaylist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(CurrentPlaylist.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                        else:
                            if countCheck == j:
                                countCheck+=int(ParticipantProfile.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                                countDataParticipant[index].append(ParticipantProfile.objects.filter(participant__settings=settings, confirm=True,participant__participant=Participant.objects.filter(id=data[j].get('participant_id')).values_list('participant')[0][0]).count())
                else:
                    countDataParticipant[index] = [0] * maxParticipantCount
                    
            countDataParticipantTranspose = np.transpose(countDataParticipant)

            laenge = []
            laengeIndexMax = [] 

            for indexCount in range(len(countDataParticipantTranspose)):
                laenge.append(max(countDataParticipantTranspose[indexCount]))
                laengeIndexMax.append(list(countDataParticipantTranspose[indexCount]).index(max(countDataParticipantTranspose[indexCount])))

            count = [-1, -1, -1, -1, -1, -1, -1]
            for indexCount in range(len(countDataParticipantTranspose)):
                for indexPart in range(len(countDataParticipantTranspose[indexCount])):
                    index = 0
                    if howManyPartArray[indexPart] != 0:
                        for indexTemp in range(countDataParticipantTranspose[indexCount][indexPart]):
                            index = indexTemp + 1
                            count[indexPart] += 1
                            if len(allDataArray[indexPart]) > 0:
                                if indexPart == laengeIndexMax[indexCount]:
                                    rowsParticipant.append(Participant.objects.filter(id=allDataArray[indexPart][count[indexPart]].get('participant_id')).values_list('participant')[0][0])
                                    rowsParticipantNo.append(index)
                                if not count[indexPart] > len(allDataArray[indexPart]):
                                    if indexPart < 3:
                                        dataString = 'data'
                                        tracksISRC[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('isrc'))
                                        tracksSpotifyName[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('track_name'))
                                        tracksSpotifyID[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('spotify_id'))
                                        tracksSpotifyArtist[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('spotify_artist_string_ohne_komma'))
                                        tracksCover[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('image_url'))
                                        tracksAlbumLabel[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('albumLabel'))
                                        tracksAlbumName[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('albumName'))
                                        tracksReleaseDate[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('releaseDate'))
                                        tracksAlbumType[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('album_type'))
                                        tracksDuration_ms[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('duration_ms'))
                                        tracksAddedAt[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('added_at'))
                                        tracksPopularity[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('popularity'))

                                        if indexPart == 2:
                                            tracksPlayedAt.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('playedAt'))
                                            tracksContextType.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('contextType'))
                                            tracksContextUri.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('contextUri'))

                                        tracksAcousticness[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('acousticness'))
                                        tracksDanceability[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('danceability'))
                                        tracksEnergy[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('energy'))
                                        tracksKey[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('key'))
                                        tracksLoudness[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('loudness'))
                                        tracksSpeechiness[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('speechiness'))
                                        tracksInstrumentalness[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('instrumentalness'))
                                        tracksLiveness[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('liveness'))
                                        tracksValence[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('valence'))
                                        tracksTempo[indexPart].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('data', {}).get('tempo'))
                                    elif indexPart > 2 and indexPart < 5:
                                        dataString = 'data'
                                        artistsType[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('type'))
                                        artistsPopularity[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('popularity'))
                                        artistsFollowers[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('followers').get('total'))
                                        artistsGenre[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('genre_string'))
                                        artistsCover[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('image_url'))
                                        artistsName[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('artist'))
                                        artistsSpotifyID[indexPart-3].append(allDataArray[indexPart][count[indexPart]].get(dataString).get('id'))
                                    elif indexPart == 5:
                                        dataString='data'
                                        playlistsID.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('id'))
                                        playlistsCollaborative.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('collaborative'))
                                        playlistsName.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('name'))
                                        playlistsOwner.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('owner'))
                                        playlistsPublic.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('public'))
                                        playlistsTracksTotal.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('tracks_total'))
                                        playlistsCover.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('playlists_cover'))
                                    else:
                                        dataString = 'data'
                                        userCountry.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('country'))
                                        userFollowers.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('followers'))
                                        userProduct.append(allDataArray[indexPart][count[indexPart]].get(dataString).get('product'))
                    if indexPart < 3:
                        tracksISRC[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksSpotifyName[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksSpotifyID[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksSpotifyArtist[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksCover[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksAlbumLabel[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksAlbumName[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksReleaseDate[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksAlbumType[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksDuration_ms[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksAddedAt[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksPopularity[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksAcousticness[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksDanceability[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksEnergy[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksKey[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksLoudness[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksSpeechiness[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksInstrumentalness[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksLiveness[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksValence[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksTempo[indexPart] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        if indexPart < 2:
                            padding_count = countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]]
                            tracksPlayedAt += [''] * padding_count
                            tracksContextType += [''] * padding_count
                            tracksContextUri += [''] * padding_count
                    elif indexPart==2:
                        tracksPlayedAt += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksContextType += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        tracksContextUri += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                    elif indexPart > 2 and indexPart < 5:
                        artistsType[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsPopularity[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsFollowers[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsGenre[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsCover[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsName[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        artistsSpotifyID[indexPart-3] += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                    elif indexPart == 5:
                        playlistsID += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsCollaborative += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsName += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsOwner += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsPublic += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsTracksTotal += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        playlistsCover += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                    else:
                        userCountry += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        userFollowers += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))
                        userProduct += [''] * (countDataParticipantTranspose[indexCount][laengeIndexMax[indexCount]] - (index))

            for i in range(np.sum(np.array(laenge))):
                rowsGesamt.append({
                    "participant_id": rowsParticipant[i],
                    "entry_no": rowsParticipantNo[i],
                    "saved_tracks_isrc": tracksISRC[0][i],
                    'saved_tracks_title': tracksSpotifyName[0][i],
                    'saved_tracks_spotify_id': tracksSpotifyID[0][i],
                    'saved_tracks_artist': tracksSpotifyArtist[0][i],
                    'saved_tracks_cover': tracksCover[0][i],
                    'saved_tracks_label': tracksAlbumLabel[0][i],
                    'saved_tracks_album_name': tracksAlbumName[0][i],
                    'saved_tracks_release_date': tracksReleaseDate[0][i],
                    'saved_tracks_album_type': tracksAlbumType[0][i],
                    'saved_tracks_duration_ms': tracksDuration_ms[0][i],
                    'saved_tracks_added_at': tracksAddedAt[0][i],
                    'saved_tracks_popularity': tracksPopularity[0][i],
                    'saved_tracks_acousticness': tracksAcousticness[0][i],
                    'saved_tracks_danceability': tracksDanceability[0][i],
                    'saved_tracks_energy': tracksEnergy[0][i],
                    'saved_tracks_key': tracksKey[0][i],
                    'saved_tracks_loudness': tracksLoudness[0][i],
                    'saved_tracks_speechiness': tracksSpeechiness[0][i],
                    'saved_tracks_instrumentalness': tracksInstrumentalness[0][i],
                    'saved_tracks_liveness': tracksLiveness[0][i],
                    'saved_tracks_valence': tracksValence[0][i],
                    'saved_tracks_tempo': tracksTempo[0][i],
                    'top_tracks_isrc': tracksISRC[1][i],
                    'top_tracks_title': tracksSpotifyName[1][i],
                    'top_tracks_spotify_id': tracksSpotifyID[1][i],
                    'top_tracks_artist': tracksSpotifyArtist[1][i],
                    'top_tracks_cover': tracksCover[1][i],
                    'top_tracks_label': tracksAlbumLabel[1][i],
                    'top_tracks_album_name': tracksAlbumName[1][i],
                    'top_tracks_release_date': tracksReleaseDate[1][i],
                    'top_tracks_album_type': tracksAlbumType[1][i],
                    'top_tracks_duration_ms': tracksDuration_ms[1][i],
                    'top_tracks_popularity': tracksPopularity[1][i],
                    'top_tracks_acousticness': tracksAcousticness[1][i],
                    'top_tracks_danceability': tracksDanceability[1][i],
                    'top_tracks_energy': tracksEnergy[1][i],
                    'top_tracks_key': tracksKey[1][i],
                    'top_tracks_loudness': tracksLoudness[1][i],
                    'top_tracks_speechiness': tracksSpeechiness[1][i],
                    'top_tracks_instrumentalness': tracksInstrumentalness[1][i],
                    'top_tracks_liveness': tracksLiveness[1][i],
                    'top_tracks_valence': tracksValence[1][i],
                    'top_tracks_tempo': tracksTempo[1][i],
                    'last_tracks_isrc': tracksISRC[2][i],
                    'last_tracks_title': tracksSpotifyName[2][i],
                    'last_tracks_spotify_id': tracksSpotifyID[2][i],
                    'last_tracks_artist': tracksSpotifyArtist[2][i],
                    'last_tracks_cover': tracksCover[2][i],
                    'last_tracks_label': tracksAlbumLabel[2][i],
                    'last_tracks_album_name': tracksAlbumName[2][i],
                    'last_tracks_release_date': tracksReleaseDate[2][i],
                    'last_tracks_album_type': tracksAlbumType[2][i],
                    'last_tracks_duration_ms': tracksDuration_ms[2][i],
                    'last_tracks_popularity': tracksPopularity[2][i],
                    'last_tracks_acousticness': tracksAcousticness[2][i],
                    'last_tracks_danceability': tracksDanceability[2][i],
                    'last_tracks_energy': tracksEnergy[2][i],
                    'last_tracks_key': tracksKey[2][i],
                    'last_tracks_loudness': tracksLoudness[2][i],
                    'last_tracks_speechiness': tracksSpeechiness[2][i],
                    'last_tracks_instrumentalness': tracksInstrumentalness[2][i],
                    'last_tracks_liveness': tracksLiveness[2][i],
                    'last_tracks_valence': tracksValence[2][i],
                    'last_tracks_tempo': tracksTempo[2][i],
                    'last_tracks_played_at': tracksPlayedAt[i],
                    'last_tracks_context_type': tracksContextType[i],
                    'last_tracks_context_uri': tracksContextUri[i],
                    'top_artists_type': artistsType[0][i],
                    'top_artists_popularity': artistsPopularity[0][i],
                    'top_artists_followers': artistsFollowers[0][i],
                    'top_artists_genres': artistsGenre[0][i],
                    'top_artists_cover': artistsCover[0][i],
                    'top_artists_name': artistsName[0][i],
                    'top_artists_spotify_id': artistsSpotifyID[0][i],
                    'followed_artists_type': artistsType[1][i],
                    'followed_artists_popularity': artistsPopularity[1][i],
                    'followed_artists_followers': artistsFollowers[1][i],
                    'followed_artists_genres': artistsGenre[1][i],
                    'followed_artists_cover': artistsCover[1][i],
                    'followed_artists_name': artistsName[1][i],
                    'followed_artists_spotify_id': artistsSpotifyID[1][i],
                    'playlists_spotify_id': playlistsID[i],
                    'playlists_collaborative': playlistsCollaborative[i],
                    'playlists_name': playlistsName[i],
                    'playlists_owner': playlistsOwner[i],
                    'playlists_public': playlistsPublic[i],
                    'playlists_tracks_total': playlistsTracksTotal[i],
                    'playlists_cover': playlistsCover[i],
                    'users_profile_country': userCountry[i],
                    'users_profile_followers': userFollowers[i],
                    'users_profile_product': userProduct[i],
                })

            for index, data in enumerate(allDataArray):
                if len(data) == 0:
                    for i in range(np.sum(np.array(laenge))):
                        if index < 3:
                            if index == 0:
                                field = 'saved'
                                del rowsGesamt[i][field + "_tracks_added_at"]
                            elif index == 1:
                                field = 'top'
                            else:
                                field = 'last'
                            del rowsGesamt[i][field + "_tracks_isrc"]
                            del rowsGesamt[i][field + "_tracks_title"]
                            del rowsGesamt[i][field + "_tracks_spotify_id"]
                            del rowsGesamt[i][field + "_tracks_artist"]
                            del rowsGesamt[i][field + "_tracks_label"]
                            del rowsGesamt[i][field + "_tracks_cover"]
                            del rowsGesamt[i][field + "_tracks_album_name"]
                            del rowsGesamt[i][field + "_tracks_release_date"]
                            del rowsGesamt[i][field + "_tracks_album_type"]
                            del rowsGesamt[i][field + "_tracks_duration_ms"]
                            del rowsGesamt[i][field + "_tracks_popularity"]
                            del rowsGesamt[i][field + "_tracks_acousticness"]
                            del rowsGesamt[i][field + "_tracks_danceability"]
                            del rowsGesamt[i][field + "_tracks_energy"]
                            del rowsGesamt[i][field + "_tracks_key"]
                            del rowsGesamt[i][field + "_tracks_loudness"]
                            del rowsGesamt[i][field + "_tracks_speechiness"]
                            del rowsGesamt[i][field + "_tracks_instrumentalness"]
                            del rowsGesamt[i][field + "_tracks_liveness"]
                            del rowsGesamt[i][field + "_tracks_valence"]
                            del rowsGesamt[i][field + "_tracks_tempo"]
                        elif index > 2 and index < 5:
                            if index == 3:
                                field = 'top'
                            else:
                                field = 'followed'
                            del rowsGesamt[i][field + "_artists_type"]
                            del rowsGesamt[i][field + "_artists_popularity"]
                            del rowsGesamt[i][field + "_artists_followers"]
                            del rowsGesamt[i][field + "_artists_genres"]
                            del rowsGesamt[i][field + "_artists_cover"]
                            del rowsGesamt[i][field + "_artists_name"]
                            del rowsGesamt[i][field + "_artists_spotify_id"]
                        elif index == 5:
                            del rowsGesamt[i]["playlists_spotify_id"]
                            del rowsGesamt[i]["playlists_collaborative"]
                            del rowsGesamt[i]["playlists_name"]
                            del rowsGesamt[i]["playlists_owner"]
                            del rowsGesamt[i]["playlists_public"]
                            del rowsGesamt[i]["playlists_tracks_total"]
                            del rowsGesamt[i]["playlists_cover"]
                        else:
                            del rowsGesamt[i]["users_profile_country"]
                            del rowsGesamt[i]["users_profile_followers"]
                            del rowsGesamt[i]["users_profile_product"]

            return Response(rowsGesamt, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class InitParticipantSession(APIView):
    # Creates a participant session with surveyID, participant ID, and language.
    # If necessary, the language code and the subject ID are updated. The Spotify token that may exist is also deleted.

    def post(self, request, format=None):
        if self.request.session.exists(self.request.session.session_key):
            if request.data.get('participant') is not None and request.data.get('surveyID') is not None:
                if 'surveyID' in self.request.session.keys() and request.data.get('surveyID') is not None:
                    if self.request.session['surveyID'] != request.data.get('surveyID'):
                        self.request.session['surveyID'] = request.data.get('surveyID')
                        self.request.session['language'] = request.data.get('lang')
                        self.request.session['paramsObject'] = request.data.get('paramsObject')
                        self.request.session['welcome'] = None
                        token = SpotifyToken.objects.filter(user=self.request.session.session_key)
                        if token.exists():
                            token.delete()
                if 'participant' in self.request.session.keys() and request.data.get('participant') is not None:
                    if self.request.session['participant'] != request.data.get('participant'):
                        self.request.session['participant'] = request.data.get('participant')
                        self.request.session['language'] = request.data.get('lang')
                        self.request.session['paramsObject'] = request.data.get('paramsObject')
                        self.request.session['welcome'] = None
                        token = SpotifyToken.objects.filter(user=self.request.session.session_key)
                        if token.exists():
                            token.delete()
            else:
                return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        participant_id = request.data.get('participant')

        settings = RetrievalSetting.objects.filter(umfrageID=surveyID).first()
        if not settings: 
            return Response({'Error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        retrieval_session_key = str(uuid.uuid4())
        Participant.objects.create(
            participant=participant_id, 
            settings=settings,
            retrieval_session_key=retrieval_session_key,
            status='in_progress'
        )
        
        room_code = str(uuid.uuid4())[:8].upper()

        self.request.session['room_code'] = room_code
        self.request.session['surveyID'] = surveyID
        self.request.session['participant'] = participant_id
        self.request.session['retrieval_session_key'] = retrieval_session_key  
        self.request.session['language'] = request.data.get('lang')
        self.request.session['paramsObject'] = request.data.get('paramsObject')

        return Response({'code': room_code}, status=status.HTTP_200_OK)


class GetParticipantSession(APIView):
    """Get session data for survey participants"""

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        participant = self.request.session.get('participant')
        resultExist=False
        SavedTrack.objects.filter(participant=participant, confirm=False).delete()
        TopTrack.objects.filter(participant=participant, confirm=False).delete()
        RecentTrack.objects.filter(participant=participant, confirm=False).delete()
        TopArtist.objects.filter(participant=participant, confirm=False).delete()
        FollowedArtist.objects.filter(participant=participant, confirm=False).delete()
        CurrentPlaylist.objects.filter(participant=participant, confirm=False).delete()
        ParticipantProfile.objects.filter(participant=participant, confirm=False).delete()


        data = {
            'roomCode': self.request.session.get('room_code'),
            'surveyID': self.request.session.get('surveyID'),
            'participant': self.request.session.get('participant'),
            'welcome': self.request.session.get('welcome'),
            'language': self.request.session.get('language'),
            'paramsObject': self.request.session.get('paramsObject'),
            'resultExist': False  # Could enhance this check if needed
        }
        return JsonResponse(data, status=status.HTTP_200_OK)

class GetUserSession(APIView):
    """Get session data for users (researchers)"""
    
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        fullName = self.request.session.get('fullname', None)

        data = {
            'username': self.request.session.get('username'),
            'code': self.request.session.get('code'),
            'fullName': fullName,
        }
        return JsonResponse(data, status=status.HTTP_200_OK)

class LogoutUser(APIView):
    # Deletes user and all associated cookies

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        self.request.session.flush()
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class CreateSettingsUser(APIView):
    # Creates a user who can log in to Spotivey

    serializer_class = CreateSettingsUserSerializer
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        check = check_email(request.data.get('email').lower())

        if check == 1:
            msg = {
                'error': True,
                'msg': "Email-Adresse ist nicht gültig",
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        request_values = list(request.data.values())

        if '' in request_values:
            msg = {
                'error': True,
                'msg': "Bitte füllen Sie alle Felder aus",
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        username_request = request.data.get('username')
        queryset = User.objects.filter(username=username_request)
        if queryset.exists():
            msg = {
                'error': True,
                'msg': "'" + username_request + "'" + ' existiert schon, bitte einen anderen eingeben.',
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                password = serializer.data.get('password')
                email_address = request.data.get('email').lower()
                vorname = serializer.data.get('first_name')
                nachname = serializer.data.get('last_name')
                name = vorname + ' ' + nachname
                username = serializer.data.get('username')

                user = User(first_name=vorname, last_name=nachname, username=username,
                            email=email_address, password=password)
                user.save()
                user.set_password(user.password)
                user.save()

                host = self.request.session.session_key

                room = UserCode(host=host)
                room.save()
                self.request.session['room_code'] = room.code
                room.user.add(user)

                self.request.session['username'] = user.username
                self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()

                return Response(CreateSettingsUserSerializer(user).data, status=status.HTTP_201_CREATED)
            return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class LoginSettingsUser(APIView):
    # Check login entry, errors are returned if necessary
    # You can log in via email and username

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        check = check_email(request.data.get('email').lower())

        request_values = list(request.data.values())

        if '' in request_values:
            errorPW = request_values[1] == ''
            errorUsername = request_values[0] == ''
            msgPW = "Please enter your password" if errorPW else ""
            msgUsername = "Please enter your username" if errorUsername else ""
            msg = {
                'error': True,
                'errorPW': errorPW,
                'errorUsername':errorUsername,
                'msgPW': msgPW,
                'msgUsername': msgUsername,
                'msg': "Bitte füllen Sie alle Felder aus",
            }
            return Response(msg, status=status.HTTP_200_OK)

        password = request.data.get('password')
        email_address = request.data.get('email')

    
        if check == 0:
            user = User.objects.filter(email=email_address)
            username_list = list(user.values('username'))
            if len(username_list) > 1:
                return Response({
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "There are several users under this email address, please use your username",
                    'msg': "mehrere User mit der Mail",
                }, status=status.HTTP_200_OK)
            elif len(username_list) == 0:
                return Response({
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "No profile was found with this username, please check your entry.",
                    'msg': "no profile",
                }, status=status.HTTP_200_OK)
            else:
                user = authenticate(email=username_list[0], password=password)

                if user is None:
                   return Response({
                    'error': True,
                    'errorPW': True,
                    'errorUsername': False,
                    'msgPW': 'Incorrect password',
                    'msgUsername': "",
                    'msg': "no profile",
                }, status=status.HTTP_200_OK) 
                self.request.session['username'] = user.username
                self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()
        else:
            caseSensitiveUsername = email_address
            try:
                findUser = User._default_manager.get(username__iexact=email_address)
            except User.DoesNotExist:
                findUser = None
                msg = {
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "No profile was found with this username, please check your entry.",
                    'msg': "no profile",
                }
                return Response(msg, status=status.HTTP_200_OK)
            if findUser is not None:
                caseSensitiveUsername = findUser
            
            user = authenticate(username=caseSensitiveUsername, password=password)
            
        if user is not None:
            code = UserCode.objects.filter(user=user.id)

            self.request.session['username'] = user.username
            self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()
            self.request.session['code'] = list(code.values_list('code'))[0][0]

            msg = {
		        'username': user.username,
                'error': False,
                'errorPW': False,
                'errorUsername': False,
                'msgPW': '',
                'msgUsername': "",
                'msg': "",
            }
            return Response(msg, status=status.HTTP_200_OK)
        else:
            msg = {
                'error': True,
                'errorPW': True,
                'errorUsername': False,
                'msgPW': 'Incorrect password',
                'msgUsername': "",
                'msg': "no profile",
            }
            return Response(msg, status=status.HTTP_200_OK)


class CreateSettings(APIView):
    # Setting of a retrieval profile is stored in database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = request.data.get('data')
        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')
        umfrageURL = request.data.get('umfrageEndUrl')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            if RetrievalSetting.objects.filter(umfrageID=umfrageID).exists(): 
                return Response({
                    'msg': 'Survey ID already exists (possibly created by another user)', 
                    'error': 'duplicate_survey_ID',
                    'surveyID': umfrageID
                }, status=status.HTTP_400_BAD_REQUEST)  
            settings = RetrievalSetting(data=data, nameUmfrage=nameUmfrage, umfrageID=umfrageID,
                            umfrageURL=umfrageURL)
            settings.save()
            settings.user.add(user.values()[0].get('id'))

            return Response({'msg': 'Settings created'}, status=status.HTTP_200_OK)
        
class CheckSurveyIDExists(APIView): 
    # check if a survey ID already exists when creating new retrieval settings
    lookup_url_kwarg = 'surveyID'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            exists = RetrievalSetting.objects.filter(umfrageID=surveyID).exists()
            return Response({'exists': exists, 'surveyID': surveyID}, status=status.HTTP_200_OK)
        return Response({'error': 'No survey ID provided'}, status=status.HTTP_400_BAD_REQUEST)


class GetSettingsSecondSurvey(APIView):
    # The FollowUp settings are searched and returned by username.

    lookup_url_kwarg = 'username'
    def get(self, request):
        username = request.GET.get(self.lookup_url_kwarg)
        if username is not None:
            user = User.objects.filter(username=username)
            if len(user) > 0:
                rows = []
                id = list(User.objects.filter(username=username).values())[0].get('id')
                settings = RetrievalSetting.objects.filter(user=id)
                settingsIDSecond = np.transpose(np.array(FollowupSurvey.objects.filter(
                        settings__in=settings).values_list('settings')))
                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID'))
                settingslistData = np.array(settings.values_list('data'))
                
                if len(settingsIDSecond):
                    checkID = np.isin(np.array(settings.values_list('id')), settingsIDSecond[0])
                else:
                    checkID = [False]*len(settingslist)

                indexSecondSetting = 0
                for i in range (len(settingslist)):
                    settingslistsecond = np.array(FollowupSurvey.objects.filter(
                        settings__in=settings).values_list('settings','secondSurveyID', 'secondSurveyServer',
                        'secondSurveyLanguage', 'secondSurveyEndURL', 'passLang'))
                    if not checkID[i]:
                        umfrageIDTemp = ''
                        secondSurveyServer = ''
                        secondSurveyLanguage = ''
                        umfrageEndUrlTemp = ''
                        passLang = "False"
                    else:
                        umfrageIDTemp = settingslistsecond[indexSecondSetting][1]
                        secondSurveyServer = settingslistsecond[indexSecondSetting][2]
                        secondSurveyLanguage = settingslistsecond[indexSecondSetting][3]
                        umfrageEndUrlTemp = settingslistsecond[indexSecondSetting][4]
                        passLang = settingslistsecond[indexSecondSetting][5]
                        indexSecondSetting += 1

                    dataCheckProfile = [
                        settingslistData[i][0].get('dataCheck').get('0'), settingslistData[i][0].get('dataCheck').get('2'),
                        settingslistData[i][0].get('dataCheck').get('3'), settingslistData[i][0].get('dataCheck').get('4'), 
                        settingslistData[i][0].get('dataCheck').get('5'), settingslistData[i][0].get('dataCheck').get('6')
                    ]

                    rows.append({
                        'id': i+1,
                        'nameSettings' : settingslist[i][1],
                        'umfrageIDsecond': umfrageIDTemp,
                        'secondSurveyServer': secondSurveyServer,
                        'secondSurveyLanguage': secondSurveyLanguage,
                        'umfrageID': settingslist[i][2],
                        'endURL': umfrageEndUrlTemp,
                        'passLang': eval(passLang),
                        'onlyProfile': True not in dataCheckProfile  # if only get User's profile is checked in retrieval-settings
                    })

                return Response({'data': rows, 'json:': {}}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class getSettingsListView(APIView):
    # all retrieval settings are searched and returned by username.

    lookup_url_kwarg = 'username'

    def get(self, request):
        username = request.GET.get(self.lookup_url_kwarg)

        if username is not None:
            user = User.objects.filter(username=username)
            if len(user) > 0:
                rows = []
                id = list(User.objects.filter(username=username).values())[0].get('id')
                settings = RetrievalSetting.objects.filter(user=id)

                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID', 'umfrageURL'))
                confirmTextList = np.array(settings.values_list('confirmTextSTEng', 'confirmTextTTEng', 'confirmTextRTEng', 
                    'confirmTextTAEng', 'confirmTextFAEng', 'confirmTextCPEng', 'confirmTextSTDe', 'confirmTextTTDe', 
                    'confirmTextRTDe', 'confirmTextTADe', 'confirmTextFADe', 'confirmTextCPDe'))

                settingslistdata = np.array(settings.values_list('data'))
                
                for i in range (len(settingslist)):
                    tempCheckPublic = ''
                    tempCheck = [False, False, False, False, False, False, False]
                    tempConfirmCheck = [True, False, True, True, True, True, True]
                    tempLimit = [0, None, 0, 0, 0, 0, 0]
                    tempMarket = ['', None, None, None, None, None, None]
                    tempTimeRange = [None, None, '', '', None, None, None]
                    zaehler = -1
                    
                    for j in range(7):
                        if (settingslistdata[i][0].get('dataCheck').get(str(j))):
                            tempConfirmCheck[j] = settingslistdata[0][0].get('confirmCheck').get(str(j))
                            zaehler = zaehler + 1
                            tempCheck[j] = True
                            if j == 0:
                                tempMarket[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('market')
                                if tempMarket[j] != '':
                                    tempMarket[j]=tempMarket[j].get('Name')
                            if j != 1:
                                tempLimit[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('limit')
                            if j == 2 or j == 3:
                                tempTimeRange[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('time_range')
                                if tempTimeRange[j] != 'medium_term':
                                    tempTimeRange[j] = tempTimeRange[j].get('name')
                            if j == 5:
                                tempCheckPublic = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('public')

                    rows.append({
                        'id': i+1, 
                        'nameUmfrage': settingslist[i][1], 
                        'umfrageID': settingslist[i][2], 
                        'umfrageURL': settingslist[i][3],
                        'confirmText': [
                            [confirmTextList[0][6], confirmTextList[0][0]], [confirmTextList[0][7], confirmTextList[0][1]], 
                            [confirmTextList[0][8], confirmTextList[0][2]], [confirmTextList[0][9], confirmTextList[0][3]], 
                            [confirmTextList[0][10], confirmTextList[0][4]], [confirmTextList[0][11], confirmTextList[0][5]]
                        ],
                        'text1': {
                            'check': tempCheck[0],
                            'limit': tempLimit[0],
                            'market': tempMarket[0],
                            'confirmCheck': tempConfirmCheck[0],
                        },
                        'text2': {
                            'check': tempCheck[1],
                        },
                        'text3': {
                            'check': tempCheck[2],
                            'limit': tempLimit[2],
                            'timeRange': tempTimeRange[2],
                            'confirmCheck': tempConfirmCheck[2],
                        },
                        'text4': {
                            'check': tempCheck[3],
                            'limit': tempLimit[3],
                            'timeRange': tempTimeRange[3],
                            'confirmCheck': tempConfirmCheck[3],
                        },
                        'text5': {
                            'check': tempCheck[4],
                            'limit': tempLimit[4],
                            'confirmCheck': tempConfirmCheck[4],
                        },
                        'text6': {
                            'check': tempCheck[5],
                            'limit': tempLimit[5],
                            'confirmCheck': tempConfirmCheck[5],
                            'public': tempCheckPublic
                        },
                        'text7': {
                            'check': tempCheck[6],
                            'limit': tempLimit[6],
                            'confirmCheck': tempConfirmCheck[6],
                        },
                    })

                return Response({'data': rows, 'json:': settingslistdata}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class getSettingsFromIDView(APIView):
    # Retrieval Profile of a unique ID is returned

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)

        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if len(settings) > 0:
                settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
                settingsTwoDataEndURL = np.array(settingsTwo.values_list('secondSurveyEndURL'))
                settingsPassLang = np.array(settingsTwo.values_list('passLang'))
                settingsTwoData = np.array(settingsTwo.values_list('secondSurveyData'))
                if len(settingsTwoDataEndURL)==0 :
                    passLang = None
                    secondEndUrl = None
                    selectedOption = None
                    questionTypeCheck = None
                    dataFieldsCheck = None
                else:
                    passLang = settingsPassLang[0][0]
                    secondEndUrl = settingsTwoDataEndURL[0][0]
                    if settingsTwoData[0][0] is not None:
                        selectedOption = settingsTwoData[0][0].get('selectedOption')
                        questionTypeCheck = settingsTwoData[0][0].get('questionTypeCheck')
                        dataFieldsCheck = [
                            settingsTwoData[0][0].get('dataFieldsTracksCheck'),
                            settingsTwoData[0][0].get('dataFieldsArtistsCheck'),
                            settingsTwoData[0][0].get('dataFieldsPlaylistsCheck'),
                        ]
                    else:
                        selectedOption = None
                        questionTypeCheck = None
                        dataFieldsCheck = None

                settingslistdata = np.array(settings.values_list('data'))

                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID', 'umfrageURL'))
                confirmTextList = np.array(settings.values_list('confirmTextSTEng', 'confirmTextTTEng', 'confirmTextRTEng', 
                    'confirmTextTAEng', 'confirmTextFAEng', 'confirmTextCPEng', 'confirmTextSTDe', 'confirmTextTTDe', 
                    'confirmTextRTDe', 'confirmTextTADe', 'confirmTextFADe', 'confirmTextCPDe'))

                tempCheckPublic = ''

                tempCheck = [False, False, False, False, False, False, False]
                tempConfirmCheck = [True, False, True, True, True, True, True]
                tempLimit = [10, None, 20, 20, 20, 20, 20]
                tempMarket = ['', None, None, None, None, None, None]
                tempTimeRange = [None, None, '', '', None, None, None]
                tempText = []
                zaehler = -1
                marketCode = ''
                for j in range(7):
                    if (settingslistdata[0][0].get('dataCheck').get(str(j))):
                        tempConfirmCheck[j] = settingslistdata[0][0].get('confirmCheck').get(str(j))
                        zaehler = zaehler + 1
                        tempCheck[j] = True
                        tempText.append(settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('text'))
                        if j == 0:
                            tempMarket[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('market')
                            if tempMarket[j] != '':
                                marketCode=tempMarket[j].get('Code')
                                tempMarket[j]=tempMarket[j].get('Name')
                        if j != 1:
                            tempLimit[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('limit')
                        if j == 2 or j == 3:
                            tempTimeRange[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('time_range')
                            if tempTimeRange[j] != 'medium_term':
                                tempTimeRange[j] = tempTimeRange[j].get('name')
                        if j == 5:
                            tempCheckPublic = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('public')
                

                confirmTextAll = [
                            [confirmTextList[0][6], confirmTextList[0][0]], [confirmTextList[0][7], confirmTextList[0][1]], 
                            [confirmTextList[0][8], confirmTextList[0][2]], [confirmTextList[0][9], confirmTextList[0][3]], 
                            [confirmTextList[0][10], confirmTextList[0][4]], [confirmTextList[0][11], confirmTextList[0][5]]
                        ]

                checkArrayWithoutTwo = np.array([tempCheck[0], tempCheck[2], tempCheck[6], tempCheck[3], tempCheck[4], tempCheck[5]])

                rows = [{
                    'nameUmfrage': settingslist[0][1], 
                    'umfrageID': settingslist[0][2], 
                    'confirmText': confirmTextAll,
                    'confirmTextOnlyCheck': np.array(confirmTextAll)[checkArrayWithoutTwo],
                    'textAllg': tempText,
                    'text1': {
                        'check': tempCheck[0],
                        'limit': tempLimit[0],
                        'market': tempMarket[0],
                        'marketCode': marketCode,
                        'confirmCheck': tempConfirmCheck[0],
                    },
                    'text2': {
                        'check': tempCheck[1],
                    },
                    'text3': {
                        'check': tempCheck[2],
                        'limit': tempLimit[2],
                        'timeRange': tempTimeRange[2],
                        'confirmCheck': tempConfirmCheck[2],
                    },
                    'text4': {
                        'check': tempCheck[3],
                        'limit': tempLimit[3],
                        'timeRange': tempTimeRange[3],
                        'confirmCheck': tempConfirmCheck[3],
                    },
                    'text5': {
                        'check': tempCheck[4],
                        'limit': tempLimit[4],
                        'confirmCheck': tempConfirmCheck[4],
                    },
                    'text6': {
                        'check': tempCheck[5],
                        'limit': tempLimit[5],
                        'confirmCheck': tempConfirmCheck[5],
                        'public': tempCheckPublic
                    },
                    'text7': {
                        'check': tempCheck[6],
                        'limit': tempLimit[6],
                        'confirmCheck': tempConfirmCheck[6],
                    },
                    'secondEndUrl': secondEndUrl,
                    'selectedOption': selectedOption,
                    'questionTypeCheck': questionTypeCheck,
                    'dataFieldsCheck': dataFieldsCheck,
                    'passLang':passLang,
                }]

                return Response({'data': rows, 'json:': settingslistdata}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class getResultListView(APIView):
    # Results of a survey respectively a retrieval profile are returned

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = getResultDict(surveyID)
            return Response(settings, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class CreateSettingsSecondSurvey(APIView):
    # FollowUp settings are stored in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        secondSurveyID = request.data.get('secondSurveyID')
        secondSurveyServer = request.data.get('secondSurveyServer')
        endURL = request.data.get('endURL')
        secondSurveyLanguage = request.data.get('secondSurveyLanguage')
        passLang = request.data.get('passLang')
        data = request.data.get('data')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()
            settingsTwo = FollowupSurvey(settings=settingsOne, secondSurveyID=secondSurveyID,
                secondSurveyServer=secondSurveyServer, secondSurveyLanguage=secondSurveyLanguage, secondSurveyEndURL=endURL, passLang=passLang)
            settingsTwo.save()
            settingsTwo.user.add(user.values()[0].get('id'))

            return Response({'msg': 'Settings created'}, status=status.HTTP_200_OK)


class UpdateSettingsSecondSurvey(APIView):
    # FollowUp settings are updated in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        data = request.data.get('data')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()

            settingsTwo = FollowupSurvey.objects.filter(settings=settingsOne)

            settingsTwo.update(secondSurveyData=data)

            return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)

class UpdateSettingsSecondSurveyEndURL(APIView):
    # FollowUp settings are updated in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        secondSurveyID = request.data.get('secondSurveyID')
        secondSurveyServer = request.data.get('secondSurveyServer')
        endURL = request.data.get('endURL')
        secondSurveyLanguage = request.data.get('secondSurveyLanguage')
        passLang = request.data.get('passLang')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()

            settingsTwo = FollowupSurvey.objects.filter(settings=settingsOne)

            settingsTwo.update(secondSurveyID=secondSurveyID)
            settingsTwo.update(secondSurveyServer=secondSurveyServer)
            settingsTwo.update(secondSurveyLanguage=secondSurveyLanguage)
            settingsTwo.update(secondSurveyEndURL=endURL)
            settingsTwo.update(passLang=passLang)

            return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)

class DeleteSettings(APIView):
    # Retrieval profile is deleted - only if no participant data exists
    
    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                # Delete follow-up survey settings first (not protected)
                settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
                settingsTwo.delete()
                
                # Try to delete the settings - will fail if protected data exists
                settings.delete()
                
                return Response({'message': 'Settings deleted successfully'}, status=status.HTTP_200_OK)
                
            except models.ProtectedError:
                # This should rarely happen - frontend checks first
                # Only occurs in race conditions or if frontend bypassed
                return Response({
                    'error': 'Cannot delete settings with existing participant data',
                    'message': 'Participant data exists. Please delete the results data first.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Survey ID parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateSettings(APIView):
    # Retrieval profile is updated

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = request.data.get('data')
        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')
        umfrageURL = request.data.get('umfrageEndUrl')
        updateID = request.data.get('updateID')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:

            settings = RetrievalSetting.objects.filter(umfrageID=updateID)
            if settings.exists():
                settings.update(data=data, nameUmfrage=nameUmfrage, umfrageID=umfrageID, umfrageURL=umfrageURL)
                return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)
            return Response({'msg': 'No settings found...'}, status=status.HTTP_404_NOT_FOUND)


class DeleteSettingsSecondSurvey(APIView):
    # FollowUp-Setting is deleted

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
            settingsTwo.delete()
            return Response({}, status=status.HTTP_200_OK)


class DeleteOnlyResultsWithID(APIView):
    # Results of a retrieval profile are deleted

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID).first()
            if not settings: 
                return Response({'Bad Request': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)
            participants = Participant.objects.filter(settings=settings)
            participant_count = participants.count()
            participants.delete()

            return Response({
                'message': f'Deleted {participant_count} participants and all their data'
            }, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class SaveCheckData(APIView):
    # Check if respondent has confirmed Spotify data, if not, it will be deleted.

    def post(self, request, format=None):

        zaehler = request.data.get('index')
        surveyID = request.data.get('surveyID')
        checkData = request.data.get('checkData')
        noData = request.data.get('noData')

        if surveyID is not None:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)

            if settingsFilter.exists():
                settings = settingsFilter[0]
                settings.save()

            retrieval_session_key = self.request.session.get('retrieval_session_key')
            if not retrieval_session_key: 
                return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)
            try: 
                participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
            except Participant.DoesNotExist:
                return Response({'error': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)
                
            if len(checkData) > 0:
                for i in range(len(checkData)):
                    if int(zaehler)==0 or int(zaehler)==1 or int(zaehler)==2:
                        isrcCheckData = checkData[i].get('isrc')
                        if int(zaehler)==0:
                            confirmData = SavedTrack.objects.filter(participant=participant, data__isrc=isrcCheckData)
                        elif int(zaehler)==1:
                            confirmData = TopTrack.objects.filter(participant=participant, data__isrc=isrcCheckData)
                        else:
                            confirmData = RecentTrack.objects.filter(participant=participant, data__isrc=isrcCheckData)
                    else:
                        idCheckData = checkData[i].get('id')
                        if int(zaehler)==3:
                            confirmData = TopArtist.objects.filter(participant=participant, data__id=idCheckData)
                        elif int(zaehler)==4:
                            confirmData = FollowedArtist.objects.filter(participant=participant, data__id=idCheckData)
                        else:
                            confirmData = CurrentPlaylist.objects.filter(participant=participant, data__id=idCheckData)

                    confirmData.update(confirm=True)

            if len(noData) > 0:    
                for j in range(len(noData)):
                    if int(zaehler)==0 or int(zaehler)==1 or int(zaehler)==2:
                        isrcCheckData = noData[j].get('isrc')
                        if int(zaehler)==0:
                            confirmData = SavedTrack.objects.filter(participant=participant, data__isrc=isrcCheckData).delete()
                        elif int(zaehler)==1:
                            confirmData = TopTrack.objects.filter(participant=participant, data__isrc=isrcCheckData).delete()
                        else:
                            confirmData = RecentTrack.objects.filter(participant=participant, data__isrc=isrcCheckData).delete()
                    else:
                        idCheckData = noData[j].get('id')
                        if int(zaehler)==3:
                            confirmData = TopArtist.objects.filter(participant=participant, data__id=idCheckData).delete()
                        elif int(zaehler)==4:
                            confirmData = FollowedArtist.objects.filter(participant=participant, data__id=idCheckData).delete()
                        else:
                            confirmData = CurrentPlaylist.objects.filter(participant=participant, data__id=idCheckData).delete()
                
            return Response({'checkData':checkData}, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class FinalizeParticipantData(APIView): 
    # Mark participant as completed and clean up old attempts

    def post(self, request, format=None):
        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)
        
        participant.status = 'completed'
        participant.completed_at = timezone.now()
        participant.save()

        old_participants = Participant.objects.filter(
            participant=participant.participant
        ).exclude(id=participant.id)

        if old_participants.exists():
            old_participants.delete()
        return Response({'message': 'Participant data finalized successfully'}, status=status.HTTP_200_OK)

class UpdateConfirmText(APIView):
    # Confirmation text is changed
    
    def post(self, request, format=None):

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        confirmTextArray = request.data.get('confirmTextArray')

        if surveyID is not None:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID, user__username=username)

            if settingsFilter.exists():
                settings = settingsFilter
                
                for i, data in enumerate(confirmTextArray):
                    if i == 0:
                        settings.update(confirmTextSTDe=data[0])
                        settings.update(confirmTextSTEng=data[1])
                    elif i == 1:
                        settings.update(confirmTextTTDe=data[0])
                        settings.update(confirmTextTTEng=data[1])
                    elif i == 3:
                        settings.update(confirmTextTADe=data[0])
                        settings.update(confirmTextTAEng=data[1])
                    elif i == 4:
                        settings.update(confirmTextFADe=data[0])
                        settings.update(confirmTextFAEng=data[1])
                    elif i == 5:
                        settings.update(confirmTextCPDe=data[0])
                        settings.update(confirmTextCPEng=data[1])
                    else:
                        settings.update(confirmTextRTDe=data[0])
                        settings.update(confirmTextRTEng=data[1])

                return Response({}, status=status.HTTP_200_OK)
            else:
                return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
            
            
class GetParticipantCountForSurvey(APIView):
    # Get count of participants and data records for a survey ID
    lookup_url_kwarg = 'surveyID'

    def get(self, request): 
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None: 
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)

            # count participants across all data types
            participants = set()
            total_records = 0

            for model in [SavedTrack, TopTrack, TopArtist, 
                            ParticipantProfile, FollowedArtist, 
                            CurrentPlaylist, RecentTrack]:
                records = model.objects.filter(participant__settings__in=settings)
                total_records += records.count()
                for record in records: 
                    if record.participant: 
                        participants.add(record.participant.participant)
            return Response({
                'surveyID': surveyID, 
                'participantCount': len(participants), 
                'totalRecords': total_records, 
                'hasData': total_records > 0
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Survey ID parameter missing'}, status=status.HTTP_400_BAD_REQUEST)