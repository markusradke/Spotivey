"""Results dictionary builder for displaying retrieval data."""
from ..models import RetrievalSetting
from spotify.models import (
    SavedTrack, TopTrack, RecentTrack,
    TopArtist, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant, AudioFeatures
)


def getResultDict(surveyID):
    # Result list as dict

    settings = RetrievalSetting.objects.filter(umfrageID=surveyID)

    # Line 23 - Fixed query
    savedTracksSpotify = SavedTrack.objects.filter(
        participant__settings__in=settings, confirm=True
    ).order_by('participant__participant').values_list('participant', 'data')
    participantSavedTracks = Participant.objects.filter(id__in=savedTracksSpotify.values_list('participant'))

    rowsSavedTracks = []
    participantArray = []
    if len(savedTracksSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(savedTracksSpotify)):
            participantCount += 1
            # Changed index from [1] to [0] because we removed surveyID
            participantString = list(Participant.objects.filter(id=savedTracksSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
        
            # Changed index from [2] to [1] because we removed surveyID
            rowsSavedTracks.append({
                'id': len(rowsSavedTracks)+1, 
                'no': participantCount,
                'participant': participantString, 
                'isrc': savedTracksSpotify[zaehlerConfirm][1].get('isrc'), 
                'trackName': savedTracksSpotify[zaehlerConfirm][1].get('track_name'),
                'spotifyID': savedTracksSpotify[zaehlerConfirm][1].get('spotify_id'),
                'spotify_artist_string': savedTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string'),
                'cover': savedTracksSpotify[zaehlerConfirm][1].get('image_url'),
                'albumLabel': savedTracksSpotify[zaehlerConfirm][1].get('albumLabel'),
                'albumName': savedTracksSpotify[zaehlerConfirm][1].get('albumName'),
                'releaseDate': savedTracksSpotify[zaehlerConfirm][1].get('releaseDate'),
                'album_type': savedTracksSpotify[zaehlerConfirm][1].get('album_type'),
                'duration_ms': savedTracksSpotify[zaehlerConfirm][1].get('duration_ms'),
                'added_at': savedTracksSpotify[zaehlerConfirm][1].get('added_at'),
                'explicit': savedTracksSpotify[zaehlerConfirm][1].get('explicit'),
                'popularity': savedTracksSpotify[zaehlerConfirm][1].get('popularity'),
                'spotify_artist_string_ohne_komma': savedTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string_ohne_komma'),
                'spotify_artist_id': savedTracksSpotify[zaehlerConfirm][1].get('spotify_artist_id'),
                'track_uri': savedTracksSpotify[zaehlerConfirm][1].get('track_uri'),
                'spotify_artist_genre': savedTracksSpotify[zaehlerConfirm][1].get('spotify_artist_genre'),
                'acousticness': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('acousticness'),
                'danceability': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('danceability'),
                'energy': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('energy'),
                'key': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('key'),
                'loudness': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('loudness'),
                'speechiness': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('speechness'),
                'instrumentalness': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('instrumentalness'),
                'liveness': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('liveness'),
                'valence': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('valence'),
                'tempo': savedTracksSpotify[zaehlerConfirm][1].get('data', {}).get('tempo'),
            })
        
    # Line 73 - Fixed query
    topTracksSpotify = TopTrack.objects.filter(
        participant__settings__in=settings, confirm=True
    ).values_list('participant', 'data')
    participantTopTracks = Participant.objects.filter(id__in=topTracksSpotify.values_list('participant'))

    rowsTopTracks = []
    if len(topTracksSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(topTracksSpotify)):
            participantCount += 1
            participantString = list(Participant.objects.filter(id=topTracksSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
        
            rowsTopTracks.append({
                'id': len(rowsTopTracks)+1, 
                'no': participantCount,
                'participant': participantString, 
                'isrc': topTracksSpotify[zaehlerConfirm][1].get('isrc'), 
                'trackName': topTracksSpotify[zaehlerConfirm][1].get('track_name'),
                'spotifyID': topTracksSpotify[zaehlerConfirm][1].get('spotify_id'),
                'spotify_artist_string': topTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string'),
                'cover': topTracksSpotify[zaehlerConfirm][1].get('image_url'),
                'albumLabel': topTracksSpotify[zaehlerConfirm][1].get('albumLabel'),
                'albumName': topTracksSpotify[zaehlerConfirm][1].get('albumName'),
                'releaseDate': topTracksSpotify[zaehlerConfirm][1].get('releaseDate'),
                'album_type': topTracksSpotify[zaehlerConfirm][1].get('album_type'),
                'duration_ms': topTracksSpotify[zaehlerConfirm][1].get('duration_ms'),
                'added_at': topTracksSpotify[zaehlerConfirm][1].get('added_at'),
                'explicit': topTracksSpotify[zaehlerConfirm][1].get('explicit'),
                'popularity': topTracksSpotify[zaehlerConfirm][1].get('popularity'),
                'spotify_artist_string_ohne_komma': topTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string_ohne_komma'),
                'spotify_artist_id': topTracksSpotify[zaehlerConfirm][1].get('spotify_id'),
                'track_uri': topTracksSpotify[zaehlerConfirm][1].get('track_uri'),
                'spotify_artist_genre': topTracksSpotify[zaehlerConfirm][1].get('spotify_artist_genre'),
                'acousticness': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('acousticness'),
                'danceability': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('danceability'),
                'energy': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('energy'),
                'key': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('key'),
                'loudness': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('loudness'),
                'speechiness': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('speechness'),
                'instrumentalness': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('instrumentalness'),
                'liveness': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('liveness'),
                'valence': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('valence'),
                'tempo': topTracksSpotify[zaehlerConfirm][1].get('data', {}).get('tempo'),
            })

    # Line 116 - Fixed query
    recentlyTracksSpotify = RecentTrack.objects.filter(
        participant__settings__in=settings, confirm=True
    ).values_list('participant', 'data')
    participantRecentlyTracks = Participant.objects.filter(id__in=recentlyTracksSpotify.values_list('participant'))

    rowsRecentlyTracks = []
    if len(recentlyTracksSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(recentlyTracksSpotify)):
            participantCount += 1
            participantString = list(Participant.objects.filter(id=recentlyTracksSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)

            rowsRecentlyTracks.append({
                'id': len(rowsRecentlyTracks)+1, 
                'no': participantCount,
                'participant': participantString, 
                'isrc': recentlyTracksSpotify[zaehlerConfirm][1].get('isrc'), 
                'trackName': recentlyTracksSpotify[zaehlerConfirm][1].get('track_name'),
                'spotifyID': recentlyTracksSpotify[zaehlerConfirm][1].get('spotify_id'),
                'spotify_artist_string': recentlyTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string'),
                'cover': recentlyTracksSpotify[zaehlerConfirm][1].get('image_url'),
                'albumLabel': recentlyTracksSpotify[zaehlerConfirm][1].get('albumLabel'),
                'albumName': recentlyTracksSpotify[zaehlerConfirm][1].get('albumName'),
                'releaseDate': recentlyTracksSpotify[zaehlerConfirm][1].get('releaseDate'),
                'album_type': recentlyTracksSpotify[zaehlerConfirm][1].get('album_type'),
                'duration_ms': recentlyTracksSpotify[zaehlerConfirm][1].get('duration_ms'),
                'added_at': recentlyTracksSpotify[zaehlerConfirm][1].get('added_at'),
                'explicit': recentlyTracksSpotify[zaehlerConfirm][1].get('explicit'),
                'popularity': recentlyTracksSpotify[zaehlerConfirm][1].get('popularity'),
                'spotify_artist_string_ohne_komma': recentlyTracksSpotify[zaehlerConfirm][1].get('spotify_artist_string_ohne_komma'),
                'spotify_artist_id': recentlyTracksSpotify[zaehlerConfirm][1].get('spotify_artist_id'),
                'track_uri': recentlyTracksSpotify[zaehlerConfirm][1].get('track_uri'),
                'spotify_artist_genre': recentlyTracksSpotify[zaehlerConfirm][1].get('spotify_artist_genre'),
                'acousticness': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('acousticness'),
                'danceability': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('danceability'),
                'energy': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('energy'),
                'key': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('key'),
                'loudness': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('loudness'),
                'speechiness': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('speechness'),
                'instrumentalness': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('instrumentalness'),
                'liveness': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('liveness'),
                'valence': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('valence'),
                'tempo': recentlyTracksSpotify[zaehlerConfirm][1].get('data', {}).get('tempo'),
            })

    # Line 163 - Fixed query
    topArtistsSpotify = TopArtist.objects.filter(
        participant__settings__in=settings, confirm=True
    ).values_list('participant', 'data')
    participantTopArtists = Participant.objects.filter(id__in=topArtistsSpotify.values_list('participant'))

    rowsTopArtists = []
    if len(topArtistsSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(topArtistsSpotify)):
            participantCount += 1
            participantString = list(Participant.objects.filter(id=topArtistsSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
            
            rowsTopArtists.append({
                'id': len(rowsTopArtists)+1, 
                'no': participantCount,
                'participant': participantString, 
                'type': topArtistsSpotify[zaehlerConfirm][1].get('type'), 
                'popularity': topArtistsSpotify[zaehlerConfirm][1].get('popularity'),
                'followers': topArtistsSpotify[zaehlerConfirm][1].get('followers').get('total'),
                'genre_string': topArtistsSpotify[zaehlerConfirm][1].get('genre_string'),
                'cover': topArtistsSpotify[zaehlerConfirm][1].get('image_url'),
                'artistName': topArtistsSpotify[zaehlerConfirm][1].get('artist'),
                'spotifyID': topArtistsSpotify[zaehlerConfirm][1].get('id')
            })

    # Line 189 - Fixed query
    followedArtistsSpotify = FollowedArtist.objects.filter(
        participant__settings__in=settings, confirm=True
    ).values_list('participant', 'data')
    participantFollowedArtists = Participant.objects.filter(id__in=followedArtistsSpotify.values_list('participant'))

    rowsFollowedArtists = []
    if len(followedArtistsSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(followedArtistsSpotify)):
            participantCount += 1
            participantString = list(Participant.objects.filter(id=followedArtistsSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
            
            rowsFollowedArtists.append({
                'id': len(rowsFollowedArtists)+1, 
                'no': participantCount,
                'participant': participantString, 
                'type': followedArtistsSpotify[zaehlerConfirm][1].get('type'), 
                'popularity': followedArtistsSpotify[zaehlerConfirm][1].get('popularity'),
                'followers': followedArtistsSpotify[zaehlerConfirm][1].get('followers').get('total'),
                'genre_string': followedArtistsSpotify[zaehlerConfirm][1].get('genre_string'),
                'cover': followedArtistsSpotify[zaehlerConfirm][1].get('image_url'),
                'artistName': followedArtistsSpotify[zaehlerConfirm][1].get('artist'),
                'spotifyID': followedArtistsSpotify[zaehlerConfirm][1].get('id')
            })
        
    # Line 216 - Fixed query
    currentPlaylistsSpotify = CurrentPlaylist.objects.filter(
        participant__settings__in=settings, confirm=True
    ).values_list('participant', 'data')
    participantCurrentPlaylists = Participant.objects.filter(id__in=currentPlaylistsSpotify.values_list('participant'))

    rowsCurrentPlaylists = []
    if len(currentPlaylistsSpotify) > 0:
        participantCount = 0
        for zaehlerConfirm in range(len(currentPlaylistsSpotify)):
            participantCount += 1
            participantString = list(Participant.objects.filter(id=currentPlaylistsSpotify[zaehlerConfirm][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
            
            rowsCurrentPlaylists.append({
                'id': len(rowsCurrentPlaylists)+1, 
                'no': participantCount,
                'participant': participantString, 
                'collaborative': currentPlaylistsSpotify[zaehlerConfirm][1].get('collaborative'), 
                'playlistName': currentPlaylistsSpotify[zaehlerConfirm][1].get('name'),
                'owner': currentPlaylistsSpotify[zaehlerConfirm][1].get('owner'),
                'public': currentPlaylistsSpotify[zaehlerConfirm][1].get('public'),
                'spotifyID': currentPlaylistsSpotify[zaehlerConfirm][1].get('id'),
                'tracks_total': currentPlaylistsSpotify[zaehlerConfirm][1].get('tracks_total'),
                'cover': currentPlaylistsSpotify[zaehlerConfirm][1].get('playlists_cover'),
                'playlistsTracksRow': currentPlaylistsSpotify[zaehlerConfirm][1].get('playlistsTracksRow'),
            })

    # Line 245 - Fixed query  
    usersProfileSpotify = ParticipantProfile.objects.filter(
        participant__settings__in=settings
    ).values_list('participant')
    participantUsersProfile = Participant.objects.filter(id__in=usersProfileSpotify.values_list('participant'))

    rowsUsersProfile = []
    if len(usersProfileSpotify) > 0:
        participantCount = 0
        for participantZaehler in range(len(usersProfileSpotify)):
            participantCount += 1
            participantID = list(ParticipantProfile.objects.filter(
                participant__settings__in=settings).values_list('participant'))[participantZaehler]
            participantString = list(Participant.objects.filter(id=usersProfileSpotify[participantZaehler][0]).values_list('participant')[0])
            if participantString not in participantArray:
                participantCount = 1
                participantArray.append(participantString)
            for profileListResult in list(ParticipantProfile.objects.filter(participant__id__in=participantID).values_list('data')):
                for profileList in profileListResult:
                    rowsUsersProfile.append({
                        'id': len(rowsUsersProfile)+1, 
                        'no': participantCount,
                        'participant': int(participantString[0]), 
                        'country': profileList.get('country'),
                        'followers': profileList.get('followers'),
                        'product': profileList.get('product'),
                    })

    rowGesamt = [[rowsSavedTracks, 'Saved Tracks', {'participantCount': participantSavedTracks.count(), 
                    'resultCount': len(rowsSavedTracks)}, 'Tracks'], 
                [rowsTopTracks, 'Top Tracks', {'participantCount': participantTopTracks.count(), 
                    'resultCount': len(rowsTopTracks)}, 'Tracks'], 
                [rowsTopArtists, 'Top Artists', {'participantCount': participantTopArtists.count(), 
                    'resultCount': len(rowsTopArtists)}, 'Artists'], 
                [rowsFollowedArtists, 'Followed Artists', {'participantCount': participantFollowedArtists.count(), 
                    'resultCount': len(rowsFollowedArtists)}, 'Artists'],
                [rowsRecentlyTracks, 'Last Tracks', {'participantCount': participantRecentlyTracks.count(),
                    'resultCount': len(rowsRecentlyTracks)}, 'Tracks'], 
                [rowsCurrentPlaylists, 'Current Playlists', {'participantCount': participantCurrentPlaylists.count(),
                    'resultCount': len(rowsCurrentPlaylists)}, 'Playlists'], 
                [rowsUsersProfile, 'User\'s Profile', {'participantCount': participantUsersProfile.count(),
                    'resultCount': len(rowsUsersProfile)}, 'Profile']]
            
    return {
            'rowGesamt':rowGesamt,
            'savedTracksData': {
                'data': rowsSavedTracks, 
                'participantCount': participantSavedTracks.count(), 
                'resultCount': len(rowsSavedTracks)
            },
            'topTracksData': {
                'data': rowsTopTracks, 
                'participantCount': participantTopTracks.count(), 
                'resultCount': len(rowsTopTracks)
            },
            'topArtistsData': {
                'data': rowsTopArtists, 
                'participantCount': participantTopArtists.count(), 
                'resultCount': len(rowsTopArtists)
            }, 
            'usersProfileData': {
                
            },
            'followedArtistsData': {
                'data': rowsFollowedArtists, 
                'participantCount': participantFollowedArtists.count(), 
                'resultCount': len(rowsFollowedArtists)
            },
            'recentlyTracksData': {
                'data': rowsRecentlyTracks,
                'participantCount': participantRecentlyTracks.count(),
                'resultCount': len(rowsRecentlyTracks)
            },
            'currentPlaylistsData': {
                'data': rowsCurrentPlaylists,
                'participantCount': participantCurrentPlaylists.count(),
                'resultCount': len(rowsCurrentPlaylists)
            },
            'participantArray': participantArray
        }