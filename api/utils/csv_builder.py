"""CSV export builders for Spotify data models."""
import json
import logging
from spotify.models import SavedTrack, TopTrack, RecentTrack, ParticipantProfile, CurrentPlaylist


def _build_base_track_csv_row(track, track_type):
    """
    Build CSV row with all common BaseTrack fields.
    
    Extracts and formats all shared fields from any track model following DRY principles.
    Handles empty/null values safely.
    
    Args:
        track: Track model instance (SavedTrack, TopTrack, or RecentTrack)
        track_type: String identifier for the track type
        
    Returns:
        Dictionary with all common track fields ready for CSV export
    """
    
    try:
        artist_ids = json.loads(track.artist_ids) if track.artist_ids else []
    except (json.JSONDecodeError, TypeError):
        artist_ids = []
    
    try:
        artist_genres = json.loads(track.artist_genres) if track.artist_genres else []
    except (json.JSONDecodeError, TypeError):
        artist_genres = []
    
    return {
        # Metadata
        'data_type': track_type,
        'participant_id': track.participant.participant,
        'survey_id': track.participant.settings.umfrageID,
        'survey_name': track.participant.settings.nameUmfrage,
        'confirmed': track.confirmed,
        
        # Track identification
        'spotify_id': track.spotify_id or '',
        'isrc': track.isrc or '',
        'track_uri': track.track_uri or '',
        
        # Track metadata
        'track_name': track.track_name or '',
        'duration_ms': track.duration_ms if track.duration_ms is not None else '',
        'explicit': track.explicit if track.explicit is not None else '',
        'popularity': track.popularity if track.popularity is not None else '',
        
        # Album information
        'album_id': track.album_id or '',
        'album_name': track.album_name or '',
        'album_label': track.album_label or '',
        'album_type': track.album_type or '',
        'release_date': track.release_date or '',
        'image_url': track.image_url or '',
        
        # Artist information
        'artist_names': track.artist_names or '',
        'artist_ids': ', '.join(artist_ids) if artist_ids else '',
        'artist_genres': ', '.join(sorted(set([g for artist in artist_genres for g in artist]))) if artist_genres else '',

        # Audio features
        # 'danceability': track.danceability if track.danceability is not None else '',
        # 'energy': track.energy if track.energy is not None else '',
        # 'key': track.key if track.key is not None else '',
        # 'loudness': track.loudness if track.loudness is not None else '',
        # 'mode': track.mode if track.mode is not None else '',
        # 'speechiness': track.speechiness if track.speechiness is not None else '',
        # 'acousticness': track.acousticness if track.acousticness is not None else '',
        # 'instrumentalness': track.instrumentalness if track.instrumentalness is not None else '',
        # 'liveness': track.liveness if track.liveness is not None else '',
        # 'valence': track.valence if track.valence is not None else '',
        # 'tempo': track.tempo if track.tempo is not None else '',
        # 'time_signature': track.time_signature if track.time_signature is not None else ''
    }


def build_saved_tracks_csv(survey_settings):
    """
    Build CSV rows for SavedTrack with all fields including added_at.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    tracks = SavedTrack.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    print(track.keys() for track in tracks[:5])  # Debug: print keys of first 5 tracks
    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, 'saved_track')
        row['added_at'] = track.added_at.isoformat() if track.added_at else ''
        rows.append(row)
    
    return rows


def build_top_tracks_csv(survey_settings):
    """
    Build CSV rows for TopTrack with all BaseTrack fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    tracks = TopTrack.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, 'top_track')
        rows.append(row)
    
    return rows


def build_recent_tracks_csv(survey_settings):
    """
    Build CSV rows for RecentTrack with all fields including playback context.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    tracks = RecentTrack.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, 'recent_track')
        row.update({
            'played_at': track.played_at.isoformat() if track.played_at else '',
            'context_type': track.context_type or '',
            'context_uri': track.context_uri or '',
        })
        rows.append(row)
    
    return rows


def build_profiles_csv(survey_settings):
    """
    Build CSV rows for ParticipantProfile with all fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    profiles = ParticipantProfile.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for profile in profiles:
        rows.append({
            # Metadata
            'data_type': 'profile',
            'participant_id': profile.participant.participant,
            'survey_id': profile.participant.settings.umfrageID,
            'survey_name': profile.participant.settings.nameUmfrage,
            'confirmed': profile.confirmed,
            
            # Profile fields
            'country': profile.country or '',
            'followers': profile.followers if profile.followers is not None else '',
            'product': profile.product or '',
        })
    
    return rows



def build_playlists_csv(survey_settings):
    """
    Build CSV rows for CurrentPlaylist with all fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
    Returns:
        List of dictionaries ready for CSV export
    """
    playlists = CurrentPlaylist.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for playlist in playlists:
        rows.append({
            # Metadata
            'data_type': 'current_playlist',
            'participant_id': playlist.participant.participant,
            'survey_id': playlist.participant.settings.umfrageID,
            'survey_name': playlist.participant.settings.nameUmfrage,
            'confirmed': playlist.confirmed,
            
            # Playlist fields
            'playlist_id': playlist.playlist_id,
            'playlist_name': playlist.playlist_name,
            'playlist_cover': playlist.playlist_cover,
            'is_collaborative': playlist.is_collaborative,
            'is_public': playlist.is_public,
            'is_self_owned': playlist.is_self_owned,
            'n_tracks': playlist.n_tracks,
        })
    
    return rows


def build_all_data_types_csv(survey_id):
    """
    Build complete CSV export for all data types in a survey.
    
    Uses DRY principles to aggregate data from all track models.
    Returns empty list if no survey settings found or no data available.
    
    Args:
        survey_id: Survey identifier
        
    Returns:
        List of dictionaries ready for CSV export, or empty list if no data
    """
    from api.models import RetrievalSetting
    
    survey_settings = RetrievalSetting.objects.filter(umfrageID=survey_id)
    
    if not survey_settings.exists():
        return []
    
    builders = [
        build_saved_tracks_csv,
        build_top_tracks_csv,
        build_recent_tracks_csv,
        build_profiles_csv,
        build_playlists_csv, 
    ]
    
    all_rows = []
    for builder_func in builders:
        rows = builder_func(survey_settings)
        all_rows.extend(rows)
    
    # TODO: Add other data types as they're transformed
    # top_artists = build_top_artists_csv(survey_settings)
    # followed_artists = build_followed_artists_csv(survey_settings)
    # playlists = build_playlists_csv(survey_settings)
    
    return all_rows
