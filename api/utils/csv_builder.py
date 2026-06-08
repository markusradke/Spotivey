"""CSV export builders for Spotify data models."""
import json
import logging
from api.models import RetrievalSetting, ParticipantEmail
from spotify.models import (
    PrivatePlaylistTrack, SavedTrack, TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, RecentTrack,
    TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, FollowedArtist,
    Participant, CurrentPlaylist, SavedShow, SavedEpisode
)


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
        'position': track.position or '',
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
        'album_type': track.album_type or '',
        'release_date': track.release_date or '',
        'image_url': track.image_url or '',
        
        # Artist information
        'artist_names': track.artist_names or '',
        'artist_ids': ', '.join(artist_ids) if artist_ids else '',
        'artist_genres': ', '.join(sorted(set([g for artist in artist_genres for g in artist]))) if artist_genres else '',
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
    
    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, 'saved_track')
        row['added_at'] = track.added_at.isoformat() if track.added_at else ''
        rows.append(row)
    
    return rows


def build_top_tracks_csv(survey_settings, time_range='shortterm'):
    """
    Build CSV rows for TopTrack with all BaseTrack fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    if time_range == 'shortterm':
        tracks = TopTrackShortTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    elif time_range == 'mediumterm':
        tracks = TopTrackMediumTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    elif time_range == 'longterm':
        tracks = TopTrackLongTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    else:
        raise ValueError("Invalid time_range. Must be 'shortterm', 'mediumterm', or 'longterm'.")

    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, f'top_track_{time_range}')
        rows.append(row)
    
    return rows


def build_private_playlist_tracks_csv(survey_settings):
    """
    Build CSV rows for PrivatePlaylistTrack with all fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    tracks = PrivatePlaylistTrack.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for track in tracks:
        row = _build_base_track_csv_row(track, 'private_playlist_track')
        row['added_at'] = track.added_at.isoformat() if track.added_at else ''
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

def _build_base_artist_csv_row(artist, artist_type):
    """
    Build CSV row with all common BaseArtist fields.
    
    Extracts and formats all shared fields from any artist model following DRY principles.
    Handles empty/null values safely.
    
    Args:
        artist: Artist model instance (TopArtist or FollowedArtist)
        artist_type: String identifier for the artist type
        
    Returns:
        Dictionary with all common artist fields ready for CSV export
    """
    return {
        # Metadata
        'data_type': artist_type,
        'participant_id': artist.participant.participant,
        'survey_id': artist.participant.settings.umfrageID,
        'survey_name': artist.participant.settings.nameUmfrage,
        'confirmed': artist.confirmed,
        
        # Artist identification
        'spotify_id': artist.spotify_id or '',
        'position': artist.position or '',
        
        # Artist metadata
        'artist_name': artist.artist_name or '',
        'artist_type': artist.artist_type or '',
        'popularity': artist.popularity if artist.popularity is not None else '',
        'followers': artist.followers if artist.followers is not None else '',
        'image_url': artist.image_url or '',
        'genre_string': artist.genre_string or '',
    }


def build_top_artists_csv(survey_settings, time_range='shortterm'):
    """
    Build CSV rows for TopArtist with all BaseArtist fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    if time_range == 'shortterm':
        artists = TopArtistShortTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    elif time_range == 'mediumterm':
        artists = TopArtistMediumTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    elif time_range == 'longterm':
        artists = TopArtistLongTerm.objects.filter(
            participant__settings__in=survey_settings,
        ).select_related('participant').order_by('participant__participant')
    else:
        raise ValueError("Invalid time_range. Must be 'shortterm', 'mediumterm', or 'longterm'.")

    rows = []
    for artist in artists:
        row = _build_base_artist_csv_row(artist, f'top_artist_{time_range}')
        rows.append(row)
    
    return rows


def build_followed_artists_csv(survey_settings):
    """
    Build CSV rows for FollowedArtist with all BaseArtist fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
        
    Returns:
        List of dictionaries ready for CSV export
    """
    artists = FollowedArtist.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for artist in artists:
        row = _build_base_artist_csv_row(artist, 'followed_artist')
        rows.append(row)
    
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
            'spotify_id': playlist.spotify_id,
            'position': playlist.position,
            'playlist_name': playlist.playlist_name,
            'image_url': playlist.image_url,
            'is_collaborative': playlist.is_collaborative,
            'is_public': playlist.is_public,
            'is_self_owned': playlist.is_self_owned,
            'n_tracks': playlist.n_tracks,
        })
    
    return rows


def build_shows_csv(survey_settings):
    """
    Build CSV rows for SavedShow with all fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
    Returns:
        List of dictionaries ready for CSV export
    """
    shows = SavedShow.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for show in shows:
        rows.append({
            # Metadata
            'data_type': 'saved_show',
            'participant_id': show.participant.participant,
            'survey_id': show.participant.settings.umfrageID,
            'survey_name': show.participant.settings.nameUmfrage,
            'confirmed': show.confirmed,
            # Show fields
            'spotify_id': show.spotify_id,
            'position': show.position,
            'added_at': show.added_at.isoformat() if show.added_at else '',
            'show_name': show.show_name,
            'show_languages': show.show_languages,
            'show_description': show.show_description,
            'image_url': show.image_url,
            'show_total_episodes': show.show_total_episodes,
            'show_media_type': show.show_media_type,
            'show_publisher': show.show_publisher,
        })
    return rows

def build_episodes_csv(survey_settings):
    """
    Build CSV rows for SavedEpisode with all fields.
    
    Args:
        survey_settings: QuerySet or list of RetrievalSetting objects
    Returns:
        List of dictionaries ready for CSV export
    """
    episodes = SavedEpisode.objects.filter(
        participant__settings__in=survey_settings,
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    for episode in episodes:
        rows.append({
            # Metadata
            'data_type': 'saved_episode',
            'participant_id': episode.participant.participant,
            'survey_id': episode.participant.settings.umfrageID,
            'survey_name': episode.participant.settings.nameUmfrage,
            'confirmed': episode.confirmed,
            # Episode fields
            'spotify_id': episode.spotify_id,
            'position': episode.position,
            'added_at': episode.added_at.isoformat() if episode.added_at else '',
            'name': episode.name,
            'description': episode.description,
            'release_date': episode.release_date or '',
            'languages': episode.languages or '',
            'is_fully_played': episode.is_fully_played if episode.is_fully_played is not None else '',
            'duration_ms': episode.duration_ms if episode.duration_ms is not None else '',
            'show_id': episode.show_id,
            'show_name': episode.show_name,
            'show_languages': episode.show_languages,
            'show_description': episode.show_description,
            'image_url': episode.image_url,
            'show_total_episodes': episode.show_total_episodes,
            'show_media_type': episode.show_media_type,
            'show_publisher': episode.show_publisher,
        })
    return rows


def build_all_data_types_csv(survey_id):
    """
    Build complete CSV export for all data types in a survey.
    
    Uses DRY principles to aggregate data from all track models (SavedTrack, 
    TopTrack, RecentTrack), artist models (TopArtist, FollowedArtist), profiles,
    and playlists. Returns empty list if no survey settings found or no data available.
    
    Args:
        survey_id: Survey identifier
        
    Returns:
        List of dictionaries ready for CSV export, or empty list if no data
    """
    survey_settings = RetrievalSetting.objects.filter(umfrageID=survey_id)
    
    if not survey_settings.exists():
        return []
    
    builders = [
        build_saved_tracks_csv,
        build_top_tracks_csv,
        build_recent_tracks_csv,
        build_top_artists_csv,
        build_followed_artists_csv,
        build_playlists_csv, 
        build_private_playlist_tracks_csv,
        build_shows_csv,
        build_episodes_csv,
    ]
    
    all_rows = []
    for builder_func in builders:
        if builder_func == build_top_tracks_csv or builder_func == build_top_artists_csv:
            for time_range in ['shortterm', 'mediumterm', 'longterm']:
                rows = builder_func(survey_settings, time_range=time_range)
                all_rows.extend(rows)
        else:
            rows = builder_func(survey_settings)
            all_rows.extend(rows)
    
    return all_rows


def build_participants_csv(survey_id):
    """
    Build CSV rows for Participant with all fields.
    
    Args:
        survey_id: Survey identifier
        
    Returns:
        List of dictionaries ready for CSV export
    """
    survey_settings = RetrievalSetting.objects.filter(umfrageID=survey_id)
    participants = Participant.objects.filter(
        settings__in=survey_settings,
    ).order_by('participant')
    
    rows = []
    for participant in participants:
        rows.append({
            # Metadata
            'data_type': 'participant_profile',
            'participant_id': participant.participant,
            'status': participant.status,
            'started_at': participant.started_at.isoformat() if participant.started_at else '',
            'completed_at': participant.completed_at.isoformat() if participant.completed_at else '',
            'survey_id': participant.settings.umfrageID,
            'survey_name': participant.settings.nameUmfrage,
            'country': participant.country or '',
            'followers': participant.followers if participant.followers is not None else '',
            'product': participant.product or '',
            'total_saved_tracks': participant.total_saved_tracks if participant.total_saved_tracks is not None else '',
            'total_top_tracks_shortterm': participant.total_top_tracks_shortterm if participant.total_top_tracks_shortterm is not None else '',
            'total_top_tracks_mediumterm': participant.total_top_tracks_mediumterm if participant.total_top_tracks_mediumterm is not None else '',
            'total_top_tracks_longterm': participant.total_top_tracks_longterm if participant.total_top_tracks_longterm is not None else '',
            'total_top_artists_shortterm': participant.total_top_artists_shortterm if participant.total_top_artists_shortterm is not None else '',
            'total_top_artists_mediumterm': participant.total_top_artists_mediumterm if participant.total_top_artists_mediumterm is not None else '',
            'total_top_artists_longterm': participant.total_top_artists_longterm if participant.total_top_artists_longterm is not None else '',
            'total_followed_artists': participant.total_followed_artists if participant.total_followed_artists is not None else '',
            'total_current_playlists': participant.total_current_playlists if participant.total_current_playlists is not None else '',
            'total_saved_shows': participant.total_saved_shows if participant.total_saved_shows is not None else '',
            'total_saved_episodes': participant.total_saved_episodes if participant.total_saved_episodes is not None else '',   
        })
    
    # remove all columns that contain only empty values
    if rows: 
        all_keys = set().union(*(row.keys() for row in rows))
        keys_to_remove = {key for key in all_keys if all(not row.get(key) for row in rows)}
        for row in rows:
            for key in keys_to_remove:
                row.pop(key, None)
    
    return rows


def build_emails_csv(survey_id):
    """
    Build CSV rows for ParticipantEmail with all fields.
    
    Args:
        survey_id: Survey identifier
    Returns:
        List of dictionaries ready for CSV export
    """ 
    survey_settings = RetrievalSetting.objects.filter(umfrageID=survey_id)
    emails = ParticipantEmail.objects.filter(
        settings__in=survey_settings,
    ).order_by('email')
    
    rows = []
    for email in emails:
        rows.append({
            'data_type': 'participant_email',
            'email': email.email,
            'survey_id': email.settings.umfrageID if email.settings else '',
        })
    
    return rows
