"""CSV export builders for Spotify data models."""
import json
from spotify.models import SavedTrack


def build_saved_tracks_csv(survey_settings):
    """
    Build CSV rows for SavedTrack using structured fields.
    
    Returns all model fields for each confirmed saved track record,
    using efficient database queries with select_related.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    tracks = SavedTrack.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for track in tracks:
        # Deserialize JSON-stored fields
        try:
            artist_ids = json.loads(track.artist_ids) if track.artist_ids else []
        except (json.JSONDecodeError, TypeError):
            artist_ids = []
        
        try:
            artist_genres = json.loads(track.artist_genres) if track.artist_genres else []
        except (json.JSONDecodeError, TypeError):
            artist_genres = []
        
        rows.append({
            'participant_id': track.participant.participant,
            'survey_id': track.participant.settings.umfrageID,
            'survey_name': track.participant.settings.nameUmfrage,
            
            'spotify_id': track.spotify_id,
            'isrc': track.isrc,
            'track_uri': track.track_uri,
            
            'track_name': track.track_name,
            'duration_ms': track.duration_ms,
            'explicit': track.explicit,
            'popularity': track.popularity,
            # 'added_at': track.added_at.isoformat() if track.added_at else '',
            
            'album_name': track.album_name,
            'album_label': track.album_label,
            'album_type': track.album_type,
            'release_date': track.release_date,
            'image_url': track.image_url,
            
            'artist_names': track.artist_names,
            'artist_ids': ', '.join(artist_ids),
            
            'combined_artist_genres': ', '.join(
            sorted({genre for g in artist_genres if g for genre in g})
            ),
            
            'confirmed': track.confirmed,
        })
    
    return rows


def build_all_data_types_csv(survey_id):
    """
    Build complete CSV export for all data types in a survey.
    
    Extensible approach - add new data types by adding build functions
    and registering them here.
    
    Args:
        survey_id: Survey identifier
        
    Returns:
        List of dictionaries ready for CSV export
    """
    from api.models import RetrievalSetting
    
    survey_settings = RetrievalSetting.objects.filter(umfrageID=survey_id)
    
    if not survey_settings.exists():
        return []
    
    # Build CSV data for each type
    # Extensible: add new builders here as models are transformed
    all_rows = []
    
    # SavedTrack (transformed to structured fields)
    saved_tracks = build_saved_tracks_csv(survey_settings)
    if saved_tracks:
        # Add data type identifier
        for row in saved_tracks:
            row['data_type'] = 'saved_tracks'
        all_rows.extend(saved_tracks)
    
    # TODO: Add other data types as they're transformed
    # top_tracks = build_top_tracks_csv(survey_settings)
    # recent_tracks = build_recent_tracks_csv(survey_settings)
    # top_artists = build_top_artists_csv(survey_settings)
    # etc.
    
    return all_rows
