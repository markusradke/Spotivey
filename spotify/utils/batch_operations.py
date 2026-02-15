"""
Batch API operations for Spotify endpoints.
Reduces API calls by fetching multiple resources in single requests.
"""

from typing import Dict, Iterable, List, Set

from .spotify_api import execute_spotify_api_request


def _batch_fetch(
    session_key: str,
    ids: Iterable[str],
    endpoint: str,
    response_key: str,
    batch_size: int,
    id_field: str = "id",
) -> Dict[str, dict]:
    """Generic batched fetcher for Spotify endpoints.

    Args:
        session_key: Django session key for Spotify authentication
        ids: Iterable of Spotify IDs to fetch
        endpoint: Endpoint path (e.g. "albums", "artists", "audio-features")
        response_key: Key in the API response containing the list
        batch_size: Number of items per API request
        id_field: Field name to use as dictionary key for each item

    Returns:
        Mapping from item id to item data.
    """
    ids_list = list(ids)
    if not ids_list:
        return {}

    result: Dict[str, dict] = {}

    for i in range(0, len(ids_list), batch_size):
        batch = ids_list[i : i + batch_size]
        ids_string = ",".join(batch)
        endpoint_with_ids = f"{endpoint}?ids={ids_string}"
        response = execute_spotify_api_request(session_key, endpoint_with_ids)

        items = response.get(response_key)
        if not items:
            continue

        for item in items:
            if item:
                key = item.get(id_field)
                if key:
                    result[key] = item

    return result


def batch_fetch_albums(
    session_key: str, album_ids_set: Set[str], batch_size: int = 20
) -> Dict[str, dict]:
    """Fetch multiple albums in batched requests.

    Spotify allows up to 20 albums per request via /albums endpoint.

    Args:
        session_key: Django session key for Spotify authentication
        album_ids_set: Set of Spotify album IDs to fetch
        batch_size: Number of albums per API request (max 20)

    Returns:
        Dict mapping album_id to album data: {album_id: {...album_data...}}
    """
    return _batch_fetch(
        session_key,
        album_ids_set,
        endpoint="albums",
        response_key="albums",
        batch_size=batch_size,
    )


def batch_fetch_artists(
    session_key: str, artist_ids_set: Set[str], batch_size: int = 50
) -> Dict[str, dict]:
    """Fetch multiple artists in batched requests.

    Spotify allows up to 50 artists per request via /artists endpoint.

    Args:
        session_key: Django session key for Spotify authentication
        artist_ids_set: Set of Spotify artist IDs to fetch
        batch_size: Number of artists per API request (max 50)

    Returns:
        Dict mapping artist_id to artist data: {artist_id: {...artist_data...}}
    """
    return _batch_fetch(
        session_key,
        artist_ids_set,
        endpoint="artists",
        response_key="artists",
        batch_size=batch_size,
    )


def batch_fetch_audio_features(
    session_key: str, track_ids: List[str], batch_size: int = 50
) -> Dict[str, dict]:
    """Fetch audio features for multiple tracks in batched requests.

    Spotify allows up to 50 tracks per request via /audio-features endpoint.

    Args:
        session_key: Django session key for Spotify authentication
        track_ids: List of Spotify track IDs to fetch audio features for
        batch_size: Number of tracks per API request (max 50)

    Returns:
        Dict mapping track_id to audio features: {track_id: {...audio_features...}}
    """
    return _batch_fetch(
        session_key,
        track_ids,
        endpoint="audio-features",
        response_key="audio_features",
        batch_size=batch_size,
    )