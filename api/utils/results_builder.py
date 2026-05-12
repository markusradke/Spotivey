"""Results dictionary builder for displaying retrieval data."""
from ..models import RetrievalSetting
from spotify.models import (
    SavedTrack, TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, RecentTrack,
    TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant, SavedShow, SavedEpisode
    )


def _build_track_row_from_structured_fields(track, idx):
    """Build row dict from track with structured fields (SavedTrack)."""
    return {
        'id': idx,
        'no': idx,
        'participant': track.participant.participant,
        'cover': track.image_url,
        'trackName': track.track_name,
        'spotify_artist_string': track.artist_names,
        'spotifyID': track.spotify_id,
        'isrc': track.isrc,
    }


def _build_artist_row(artist, idx):
    """Build row dict from artist with structured fields."""
    return {
        'id': idx,
        'no': idx,
        'participant': artist.participant.participant,
        'cover': artist.image_url,
        'artistName': artist.artist_name,
        'spotifyID': artist.spotify_id,
        'type': artist.artist_type,
        'popularity': artist.popularity if artist.popularity is not None else 0,
        'followers': artist.followers if artist.followers is not None else 0,
        'genre_string': artist.genre_string,
    }


def _build_profile_row(profile, idx):
    """Build row dict from ParticipantProfile."""
    return {
        'id': idx,
        'no': idx,
        'participant': profile.participant.participant,
        'country': profile.country or '',
        'followers': profile.followers if profile.followers is not None else 0,
        'product': profile.product or '',
    }




def _build_track_results(model_class, title, data_type_id, survey_settings):
    """
    Build results structure for any track model.
    
    Args:
        model_class: Django model class (SavedTrack, TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, or RecentTrack)
        title: Display title for this data type
        data_type_id: Unique identifier for frontend routing
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with track results metadata and rows
    """
    tracks = model_class.objects.filter(
        participant__settings__in=survey_settings
    ).select_related('participant').order_by('participant__participant')
    rows = []
    participants = set()
    
    for idx, track in enumerate(tracks, start=1):
        participants.add(track.participant.participant)
        rows.append(_build_track_row_from_structured_fields(track, idx))
    
    return {
        'id': data_type_id,
        'title': title,
        'type': 'Tracks',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }


def _build_artist_results(model_class, title, data_type_id, survey_settings):
    """
    Build results structure for any artist model.
    
    Args:
        model_class: Django model class (TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, or FollowedArtist)
        title: Display title for this data type
        data_type_id: Unique identifier for frontend routing
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with artist results metadata and rows
    """
    artists = model_class.objects.filter(
        participant__settings__in=survey_settings
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, artist in enumerate(artists, start=1):
        participants.add(artist.participant.participant)
        rows.append(_build_artist_row(artist, idx))
    
    return {
        'id': data_type_id,
        'title': title,
        'type': 'Artists',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }


def _build_profile_results(survey_settings):
    """
    Build results structure for ParticipantProfile.
    
    Args:
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with profile results metadata and rows
    """
    profiles = ParticipantProfile.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, profile in enumerate(profiles, start=1):
        participants.add(profile.participant.participant)
        rows.append(_build_profile_row(profile, idx))
    
    return {
        'id': 'profiles',
        'title': 'User Profiles',
        'type': 'Profile',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }


def _build_playlist_results(survey_settings):
    """
    Build results structure for CurrentPlaylist.
    
    Args:
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with playlist results metadata and rows
    """
    playlists = CurrentPlaylist.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, playlist in enumerate(playlists, start=1):
        participants.add(playlist.participant.participant)
        rows.append({
            'id': idx,
            'no': idx,
            'participant': playlist.participant.participant,
            'playlist_id': playlist.playlist_id,
            'playlist_name': playlist.playlist_name,
            'cover': playlist.playlist_cover,
            'is_collaborative': playlist.is_collaborative,
            'is_public': playlist.is_public,
            'is_self_owned': playlist.is_self_owned,
            'n_tracks': playlist.n_tracks,
        })
    
    return {
        'id': 'playlists',
        'title': 'Current Playlists',
        'type': 'Playlists',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }

def _build_show_results(survey_settings):
    """
    Build results structure for SavedShow.
    
    Args:
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with show results metadata and rows
    """
    shows = SavedShow.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, show in enumerate(shows, start=1):
        participants.add(show.participant.participant)
        rows.append({
            'id': idx,
            'no': idx,
            'spotifyID': show.spotify_id,
            'participant': show.participant.participant,
            'show_name': show.show_name,
            'cover': show.show_image_url,
            'show_publisher': show.show_publisher,
        })
    
    return {
        'id': 'shows',
        'title': 'Saved Shows',
        'type': 'Shows',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }


def _build_episode_results(survey_settings):
    """
    Build results structure for SavedEpisode.
    
    Args:
        survey_settings: QuerySet of RetrievalSetting objects
        
    Returns:
        Dictionary with episode results metadata and rows
    """
    episodes = SavedEpisode.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, episode in enumerate(episodes, start=1):
        participants.add(episode.participant.participant)
        rows.append({
            'id': idx,
            'no': idx,
            'spotifyID': episode.spotify_id,
            'participant': episode.participant.participant,
            'name': episode.name,
            'show_name': episode.show_name,
            'cover': episode.show_image_url,
            'show_publisher': episode.show_publisher,
        })
    
    return {
        'id': 'episodes',
        'title': 'Saved Episodes',
        'type': 'Episodes',
        'data': rows,
        'participantCount': len(participants),
        'resultCount': len(rows),
        'hasData': len(rows) > 0
    }

def getResultDict(surveyID):
    """
    Build results dictionary for researcher dashboard display.
    
    Returns clean, self-documenting structure with data from all track types
    (SavedTrack, TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, RecentTrack),
     artist types (TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, FollowedArtist),
    profiles, and playlists using DRY helper functions.
    
    Args:
        surveyID: Survey identifier to filter results
        
    Returns:
        Dictionary with dataTypes array containing clear metadata and table rows
    """
    settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
    
    data_types = []
    all_participants = set(
        p.participant for p in Participant.objects.filter(settings__in=settings)
    )
    
    track_configs = [
        (SavedTrack, 'Saved Tracks', 'savedTracks'),
        (TopTrackShortTerm, 'Top Tracks (Short Term)', 'topTracksShortTerm'),
        (TopTrackMediumTerm, 'Top Tracks (Medium Term)', 'topTracksMediumTerm'),
        (TopTrackLongTerm, 'Top Tracks (Long Term)', 'topTracksLongTerm'),
        (RecentTrack, 'Recently Played', 'recentTracks'),
    ]
    
    for model_class, title, data_id in track_configs:
        result = _build_track_results(model_class, title, data_id, settings)
        data_types.append(result)
    
    artist_configs = [
        (TopArtistShortTerm, 'Top Artists (Short Term)', 'topArtistsShortTerm'),
        (TopArtistMediumTerm, 'Top Artists (Medium Term)', 'topArtistsMediumTerm'),
        (TopArtistLongTerm, 'Top Artists (Long Term)', 'topArtistsLongTerm'),
        (FollowedArtist, 'Followed Artists', 'followedArtists'),
    ]
    
    for model_class, title, data_id in artist_configs:
        result = _build_artist_results(model_class, title, data_id, settings)
        data_types.append(result)
    
    profile_result = _build_profile_results(settings)
    data_types.append(profile_result)

    playlist_result = _build_playlist_results(settings)
    data_types.append(playlist_result)

    show_result = _build_show_results(settings)
    data_types.append(show_result)

    episode_result = _build_episode_results(settings)
    data_types.append(episode_result)

    max_complete_participants = 0
    for dt in data_types:
        if dt['participantCount'] > max_complete_participants:
            max_complete_participants = dt['participantCount']
    total_participants = len(all_participants)
    incomplete_participants = total_participants - max_complete_participants

    return {
        'dataTypes': data_types,
        'incompleteParticipants': incomplete_participants,
        'totalNumberOfParticipants': total_participants,
    }