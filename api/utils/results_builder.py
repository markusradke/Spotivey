"""Results dictionary builder for displaying retrieval data."""
from ..models import RetrievalSetting
from spotify.models import (
    SavedTrack, TopTrack, RecentTrack,
    TopArtist, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant
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
    Build results structure for any track model following DRY principles.
    
    Args:
        model_class: Django model class (SavedTrack, TopTrack, or RecentTrack)
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

def getResultDict(surveyID):
    """
    Build results dictionary for researcher dashboard display.
    
    Returns clean, self-documenting structure with data from all track types
    (SavedTrack, TopTrack, RecentTrack) using DRY helper functions.
    
    Args:
        surveyID: Survey identifier to filter results
        
    Returns:
        Dictionary with dataTypes array containing clear metadata and table rows
    """
    settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
    
    data_types = []
    all_participants = set()
    
    # Build results for each track type
    track_configs = [
        (SavedTrack, 'Saved Tracks', 'savedTracks'),
        (TopTrack, 'Top Tracks', 'topTracks'),
        (RecentTrack, 'Recently Played', 'recentTracks'),
    ]
    
    for model_class, title, data_id in track_configs:
        result = _build_track_results(model_class, title, data_id, settings)
        data_types.append(result)
        all_participants.update(row['participant'] for row in result['data'])
    
    # Build profile results
    profile_result = _build_profile_results(settings)
    data_types.append(profile_result)
    all_participants.update(row['participant'] for row in profile_result['data'])

    # Build playlist results
    playlist_result = _build_playlist_results(settings)
    data_types.append(playlist_result)
    all_participants.update(row['participant'] for row in playlist_result['data'])
    
    return {
        'dataTypes': data_types,
        'participantList': list(all_participants)
    }