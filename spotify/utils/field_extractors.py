"""Shared utilities for extracting structured fields from Spotify API responses."""
import json
from typing import List, Dict, Any


def extract_base_track_fields(track_item, albums_cache, artists_cache):
    """
    Extract common track fields from Spotify API response.
    
    Args:
        track_item: Track object from Spotify API
        album_data: Album details from batch_fetch_albums()
        artists_data: Artist details from batch_fetch_artists()
    
    Returns:
        Dictionary with all BaseTrack model fields
    """
    
    album_data = albums_cache.get(track_item['album']['id'])
    artist_names, artist_ids, artist_genres = extract_artist_info(track_item['artists'], artists_cache)
    
    return {
        # Identification
        'spotify_id': track_item['id'],
        'isrc': track_item.get('external_ids', {}).get('isrc', ''),
        'track_uri': track_item.get('uri', ''),
        
        # Metadata
        'track_name': track_item.get('name', '').replace('"', ''),
        'duration_ms': track_item.get('duration_ms'),
        'explicit': track_item.get('explicit'),
        'popularity': track_item.get('popularity'),
        
        # Album fields
        'album_id': album_data['id'],
        'album_name': album_data.get('name', ''),
        'album_label': album_data.get('label', ''),
        'album_type': album_data.get('album_type', ''),
        'release_date': album_data.get('release_date', ''),
        'image_url': get_image_url(album_data.get('images', [])),
        
        # Artist fields
        'artist_names': artist_names,
        'artist_ids': json.dumps(artist_ids),
        'artist_genres': json.dumps(artist_genres),
    }


def extract_artist_info(artists_array: List[dict], artists_cache=None) -> Dict[str, Any]:
    """
    Extract artist information from Spotify track's artists array.
    
    Args:
        artists_array: List of artist objects from Spotify track data
    
    Returns:
        Dict with:
            - 'names': List of artist names
            - 'ids': List of artist IDs
            - 'names_string': Comma-separated artist names
    """
    names = []
    ids = []
    genres = []
    
    for artist in artists_array:
        names.append(artist.get('name', ''))
        id = artist.get('id', '')
        ids.append(id)
        genres.append(artists_cache.get(id, {}).get('genres', []))
    names_string = ', '.join(names)

    return names_string, ids, genres


def extract_artist_fields(artist_item):
    """
    Extract artist fields from Spotify API response.
    
    Args:
        artist_item: Artist object from Spotify API
    
    Returns:
        Dictionary with all BaseArtist model fields
    """
    genres_list = artist_item.get('genres', [])
    genre_string = ', '.join(genres_list) if genres_list else ''
    
    return {
        'spotify_id': artist_item['id'],
        'artist_name': artist_item.get('name', '').replace('"', "'"),
        'artist_type': artist_item.get('type', ''),
        'popularity': artist_item.get('popularity'),
        'followers': artist_item.get('followers', {}).get('total'),
        'image_url': get_image_url(artist_item.get('images', [])),
        'genre_string': genre_string,
    }


def get_image_url(images_array: List[dict], default: str = '') -> str:
    """
    Get first image URL from Spotify images array.
    
    Args:
        images_array: List of image objects from Spotify data
        default: Default value if no images
    
    Returns:
        URL string of first image, or default
    
    Usage:
        cover_url = get_image_url(album['images'])
    """
    if images_array and len(images_array) > 0:
        return images_array[0].get('url', default)
    return default