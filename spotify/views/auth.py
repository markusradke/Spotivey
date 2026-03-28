"""Authentication and callback views for Spotify OAuth flow."""

import os

from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
import random
import string

from spotify.credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID, REDIRECT_URI2
from spotify.utils.spotify_api import update_or_create_user_tokens, is_spotify_authenticated
from api.models import RetrievalSetting
from api.utils.retrieval_settings_mapping import build_retrieval_settings_payload


def get_random_string(length):
    """Generate random string for OAuth state parameter."""
    letters = string.ascii_lowercase
    result_str = "".join(random.choice(letters) for i in range(length))
    return result_str


class AuthURL(APIView):
    """
    Get authentication URL from Spotify.
    The retrieval setting determines required OAuth scopes.
    """
    lookup_url_kwarg = "surveyid"

    def get(self, request, fornat=None):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if len(settings) > 0:
                payload = build_retrieval_settings_payload(settings[0])

                checks = [
                    payload["saved_tracks"]["check"],
                    payload["profile"]["check"],
                    payload["top_tracks"]["check"],
                    payload["top_artists"]["check"],
                    payload["followed_artists"]["check"],
                    payload["current_playlists"]["check"],
                    payload["recently_played"]["check"],
                ]
                tempCheck = [False, False, False, False, False, False, False]

                scope1 = "user-library-read"  # saved Tracks
                scope2 = """user-read-private
                    user-read-email"""  # user's profile
                scope3_4 = "user-top-read"  # top Tracks/Artists
                scope5 = "user-follow-read"  # followed artists
                scope6 = "user-read-recently-played"  # recently Tracks
                scope7 = """playlist-read-private"""  # current Playlists

                scopeArrayDefault = [
                    scope1,
                    scope2,
                    scope3_4,
                    scope3_4,
                    scope5,
                    scope7,
                    scope6,
                ]

                scopeTemp = ""

                for j in range(7):
                    if checks[j]:
                        tempCheck[j] = True
                        if not (j == 3 and tempCheck[j - 1]):
                            scopeTemp = scopeTemp + scopeArrayDefault[j] + " "

                state = get_random_string(16)

                url = (
                    Request(
                        "GET",
                        "https://accounts.spotify.com/authorize",
                        params={
                            "scope": scopeTemp,
                            "response_type": "code",
                            "redirect_uri": REDIRECT_URI,
                            "client_id": CLIENT_ID,
                            "show_dialog": False,
                            "state": state,
                        },
                    )
                    .prepare()
                    .url
                )

                return Response({"url": url}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"Room Not Found": "Invalid Room Code."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"Bad Request": "Code parameter not found in request"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AuthURL2(APIView):
    """Get authentication URL from Spotify for audio features (researcher)."""

    def get(self, request, fornat=None):
        state = get_random_string(16)

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI2,
                    "client_id": CLIENT_ID,
                    "show_dialog": False,
                    "state": state,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    """Redirect from Spotify to Spotivey Participant Page."""
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    request.session["welcome"] = True

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    return redirect("/?oauth_complete=true")


def spotify_callback2(request, format=None):
    """Redirect from Spotify to Spotivey Researcher Page."""
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI2,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    # return redirect('https://spotivey.users.ak.tu-berlin.de/user/results')
    return redirect("http://127.0.0.1:8000/user/results")


class IsAuthenticated(APIView):
    """Check Spotify authentication status."""

    def get(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        if os.getenv("SPOTIVEY_TEST_MODE") == "1":
            return Response({"status": True}, status=status.HTTP_200_OK)

        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)