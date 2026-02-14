"""CSV export view - exports all retrieval data to CSV file."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import numpy as np
import csv
from datetime import datetime

from ..models import RetrievalSetting
from spotify.models import (
    SavedTrack, TopTrack, RecentTrack,
    TopArtist, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant
)


class saveToCSVFileView(APIView):
    """
    Export all retrieval data to CSV file.
    
    Note: This view contains the existing complex CSV export logic.
    Will be refactored in Phase 2+ using csv_builder utilities.
    """
    
    def get(self, request, format=None):
        surveyID = request.GET.get('surveyID')
        
        if not surveyID:
            return Response({
                'error': 'Survey ID required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
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
        except RetrievalSetting.DoesNotExist:
            return Response({
                'error': 'Settings not found'
            }, status=status.HTTP_404_NOT_FOUND)