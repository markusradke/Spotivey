"""Show retreival views for Spotify data (saved shows and episodes)."""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from spotify.models import SavedShow, SavedEpisode
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.spotify_api import retrieve_spotify_data
from spotify.utils.field_extractors import get_image_url

def _extract_show_fields(show_item):
    """Extract show fields from Spotify API response."""
    images = show_item.get('images', [])
    languages = show_item.get('languages', [])
    if languages: 
        if type(languages) == list and all(isinstance(lang, str) for lang in languages):
            languages = ', '.join(languages)
        else: 
            languages = ''
    
    return {
        'spotify_id': show_item.get('id', ''),
        'show_name': show_item.get('name', ''),
        'show_languages': languages,
        'show_description': show_item.get('description', ''),
        'image_url': get_image_url(images),
        'show_total_episodes': show_item.get('total_episodes', 0),
        'show_media_type': show_item.get('media_type', ''),
        'show_publisher': show_item.get('publisher', ''),
    }

def _extract_episode_fields(episode_item):
    """Extract episode fields from Spotify API response."""
    images = episode_item.get('show', {}).get('images', [])
    languages = episode_item.get('languages', [])
    if languages: 
        if type(languages) == list and all(isinstance(lang, str) for lang in languages):
            languages = ', '.join(languages)
        else: 
            languages = ''

    return {
        'spotify_id': episode_item.get('id', ''),
        'name': episode_item.get('name', ''),
        'description': episode_item.get('description', ''),
        'duration_ms': episode_item.get('duration_ms', 0),
        'release_date': episode_item.get('release_date', ''),
        'languages': languages,
        'is_fully_played': episode_item.get('resume_point', {}).get('fully_played', False),
        'show_id': episode_item.get('show', {}).get('id', ''),
        'show_name': episode_item.get('show', {}).get('name', ''),
        'show_languages': episode_item.get('show', {}).get('languages', ''),
        'show_description': episode_item.get('show', {}).get('description', ''),
        'image_url': get_image_url(images),
        'show_total_episodes': episode_item.get('show', {}).get('total_episodes', 0),
        'show_media_type': episode_item.get('show', {}).get('media_type', ''),
        'show_publisher': episode_item.get('show', {}).get('publisher', ''),
    
    }

class GetSavedShowsSpotify(APIView):
    def post(self, request, format=None):
        participant, error = get_participant_from_session(request)
        if error:
            return error

        limit = request.GET.get('limit', 50)
        endpoint = f"me/shows"

        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, datatype='shows')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        total = response.get('total', 0)
        participant.total_saved_shows = total
        participant.save()

        items = response.get('items', [])
        shows_to_create = []
        for item in items:
            fields = _extract_show_fields(item['show'])
            fields['added_at'] = item.get('added_at', '')
            fields['participant'] = participant
            fields['confirmed'] = False
            shows_to_create.append(SavedShow(**fields))

        bulk_create_with_retry(SavedShow, shows_to_create)
        return Response([s.to_dict() for s in shows_to_create], status=status.HTTP_200_OK)


class GetSavedEpisodesSpotify(APIView):
    def post(self, request, format=None):
        participant, error = get_participant_from_session(request)
        if error:
            return error

        limit = request.GET.get('limit', 50)
        endpoint = f"me/episodes"

        response = retrieve_spotify_data(request.session.session_key, endpoint, limit, datatype='episodes')
        if 'error' in response.keys():
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        total = response.get('total', 0)
        participant.total_saved_episodes = total
        participant.save()

        items = response.get('items', [])
        episodes_to_create = []
        for item in items:
            fields = _extract_episode_fields(item['episode'])
            fields['added_at'] = item.get('added_at', '')
            fields['participant'] = participant
            fields['confirmed'] = False
            episodes_to_create.append(SavedEpisode(**fields))

        bulk_create_with_retry(SavedEpisode, episodes_to_create)
        return Response([e.to_dict() for e in episodes_to_create], status=status.HTTP_200_OK)