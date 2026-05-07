from spotify.models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from spotify.credentials import CLIENT_ID, CLIENT_SECRET
import os
from requests import post, put, get, Session
from requests.adapters import HTTPAdapter, Retry

BASE_URL = "https://api.spotify.com/v1/"
    
def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)

    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                              refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)

        return True
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    if os.environ.get("SPOTIVEY_TEST_MODE") == "1":
        print("SPOTIVEY_TEST_MODE is enabled. Returning fixture data for endpoint:", endpoint)
        from spotify.utils.spotify_fixtures import get_fixture_for_endpoint

        fixture = get_fixture_for_endpoint(endpoint)
        if fixture is not None:
            return fixture.payload

    tokens = get_user_tokens(session_id)

    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)


    s = Session()

    retries = Retry(total=5,
                backoff_factor=0.1,
                status_forcelist=[ 500, 502, 503, 504 ])
    
    s.mount(BASE_URL + endpoint, HTTPAdapter(max_retries=retries))

    response = s.get(BASE_URL + endpoint, headers=headers)
    print(f"Spotify API request to {BASE_URL + endpoint} returned status code {response.status_code}")

    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}


def getAudioFeatures(session_key, id):
    endpoint = "audio-features/" + id

    response = execute_spotify_api_request(session_key, endpoint)

    dataAudioFeatures = {
        'acousticness': response.get('acousticness'),
        'danceability': response.get('danceability'),
        'energy': response.get('energy'),
        'key': response.get('key'),
        'loudness': response.get('loudness'),
        'speechiness': response.get('speechiness'),
        'instrumentalness': response.get('instrumentalness'),
        'liveness': response.get('liveness'),
        'valence': response.get('valence'),
        'tempo': response.get('tempo'),
        'duration_ms': response.get('duration_ms'),
        'spotify_id': id,
    }
    
    return dataAudioFeatures

def probe_authentication_scopes(session_id: str) -> bool:
    """
    Returns True only if the stored token can access all endpoints needed
    for participant retrieval (i.e., required scopes are actually granted).
    Relevant for cases where users are logged in but have not granted all required scopes.
    """
    probe_endpoints = [
        "me",  # user-read-private (and usually user-read-email if granted)
        "me/tracks?limit=1",  # user-library-read
        "me/top/tracks?time_range=short_term&limit=1",  # user-top-read
        "me/following?type=artist&limit=1",  # user-follow-read
        "me/playlists?limit=1",  # playlist-read-private
        "me/player/recently-played?limit=1",  # user-read-recently-played
    ]

    for endpoint in probe_endpoints:
        response: dict = execute_spotify_api_request(session_id, endpoint)

        error = response.get("error")
        if isinstance(error, dict):
            status_code = error.get("status")
            if status_code in (401, 403):
                return False

        if response.get("Error"):
            return False

    return True