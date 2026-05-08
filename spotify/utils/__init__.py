"""Spotify utilities package."""

from .spotify_api import (
    get_user_tokens,
    update_or_create_user_tokens,
    is_spotify_authenticated,
    refresh_spotify_token,
    execute_spotify_api_request,
)

from .batch_operations import (
    batch_fetch_albums,
    batch_fetch_artists,
)

from .bulk_db import (
    bulk_create_with_retry,
    bulk_update_fields,
    bulk_update_objects
)

from .retrieval_helpers import (
    get_participant_from_session,
)

from .field_extractors import (
    extract_base_track_fields,
    extract_artist_info,
    get_image_url
)

__all__ = [
    # Spotify API 
    'get_user_tokens',
    'update_or_create_user_tokens',
    'is_spotify_authenticated',
    'refresh_spotify_token',
    'execute_spotify_api_request',
    # Batch operations
    'batch_fetch_albums',
    'batch_fetch_artists',
    # Bulk DB operations
    'bulk_create_with_retry',
    'bulk_update_fields',
    'bulk_update_objects',
    # Retrieval helpers
    'get_participant_from_session',
    # Field extractors
    'extract_base_track_fields',
    'extract_artist_info',
    'get_image_url',
]