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
from spotify.utils.spotify_api import update_or_create_user_tokens, is_spotify_authenticated, probe_authentication_scopes
from api.models import RetrievalSetting
from api.utils.retrieval_settings_mapping import build_retrieval_settings_payload


def get_random_string(length):
    """Generate random string for OAuth state parameter."""
    letters = string.ascii_lowercase
    result_str = "".join(random.choice(letters) for i in range(length))
    return result_str


class AuthURL(APIView):
    """
    Get authentication URL from Spotify with all necessary scopes for participant data retrieval.
    Checks if survey ID is valid before generating URL.
    """
    lookup_url_kwarg = "surveyid"

    def get(self, request, fornat=None):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if len(settings) > 0:
                    scope = "user-library-read user-read-private user-read-email user-top-read user-follow-read playlist-read-private user-read-recently-played"
                    state = get_random_string(16)

                    url = (
                        Request(
                            "GET",
                            "https://accounts.spotify.com/authorize",
                            params={
                                "scope": scope,
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


class IsAuthenticated(APIView):
    """Check Spotify authentication status."""

    def get(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        if os.getenv("SPOTIVEY_TEST_MODE") == "1":
            return Response({"status": True}, status=status.HTTP_200_OK)

        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        if not is_authenticated:
            return Response({"status": False}, status=status.HTTP_200_OK)


        all_scopes_granted = probe_authentication_scopes(self.request.session.session_key)
        return Response({"status": all_scopes_granted}, status=status.HTTP_200_OK)