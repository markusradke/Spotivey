"""
Common helper functions for Spotify data retrieval views.
"""

from typing import List, Dict, Any
from rest_framework.response import Response
from rest_framework import status
import random

from spotify.models import Participant


def get_participant_from_session(request) -> tuple:
    """
    Get participant from retrieval_session_key stored in session.
    
    Returns:
        Tuple of (participant_object, error_response)
        If successful: (Participant, None)
        If error: (None, Response)
    
    Usage:
        participant, error = get_participant_from_session(request)
        if error:
            return error
        # continue with participant
    """
    retrieval_session_key = request.session.get('retrieval_session_key')
    
    if not retrieval_session_key:
        return (None, Response(
            {'error': 'No active retrieval session'},
            status=status.HTTP_400_BAD_REQUEST
        ))
    
    try:
        participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        return (participant, None)
    except Participant.DoesNotExist:
        return (None, Response(
            {'error': 'Participant session not found'},
            status=status.HTTP_404_NOT_FOUND
        ))


def random_sample_items(items: List[Any], limit: int, sample_size: int = 50) -> List[Any]:
    """
    Randomly sample from Spotify API response items.
    
    Args:
        items: List of items from Spotify API
        limit: Original limit requested from API
        sample_size: Number of items to sample (default 50)
    
    Returns:
        List of randomly sampled items
    """
    size = min(sample_size, limit, len(items))
    if size <= 0:
        return []
    if size >= len(items):
        return items
    random_indices = random.sample(range(len(items)), size)
    return [items[i] for i in random_indices]


def extract_artist_info(artists_array: List[dict]) -> Dict[str, Any]:
    """
    Extract artist information from Spotify track's artists array.
    
    Args:
        artists_array: List of artist objects from Spotify track data
    
    Returns:
        Dict with:
            - 'names': List of artist names
            - 'ids': List of artist IDs
            - 'names_string': Comma-separated artist names
    
    Usage:
        artists = track['artists']
        info = extract_artist_info(artists)
        # info['names_string'] = "Artist1, Artist2, Artist3"
    """
    names = []
    ids = []
    
    for artist in artists_array:
        names.append(artist.get('name', ''))
        ids.append(artist.get('id', ''))
    
    return {
        'names': names,
        'ids': ids,
        'names_string': ', '.join(names)
    }


def extract_album_info(album_data: dict) -> Dict[str, Any]:
    """
    Extract album information consistently.
    
    Args:
        album_data: Album object from Spotify API (full album data)
    
    Returns:
        Dict with standardized album fields
    
    Usage:
        album_data = albums_cache.get(album_id)
        info = extract_album_info(album_data)
    """
    return {
        'label': album_data.get('label', ''),
        'name': album_data.get('name', ''),
        'release_date': album_data.get('release_date', ''),
        'album_type': album_data.get('album_type', ''),
        'id': album_data.get('id', '')
    }


def get_artist_genres(artist_data: dict) -> str:
    """
    Extract and format genres from artist data.
    
    Args:
        artist_data: Artist object from Spotify API
    
    Returns:
        Comma-separated genre string
    
    Usage:
        artist = artists_cache.get(artist_id)
        genres = get_artist_genres(artist)
        # genres = "pop, rock, indie"
    """
    genres = artist_data.get('genres', [])
    if not genres:
        return ''
    return ', '.join(genres)


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