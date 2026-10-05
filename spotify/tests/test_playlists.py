from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase

from api.models import Researcher, RetrievalSetting
from spotify.models import CurrentPlaylist, Participant
from spotify.views.playlists import _build_and_create_playlists


class PlaylistStorageTest(TestCase):
    def setUp(self):
        user = User.objects.create_user(username="researcher1")
        researcher = Researcher.objects.create(
            user=user,
            institution="Test Institute",
        )
        settings = RetrievalSetting.objects.create(
            user=researcher,
            nameUmfrage="Test Survey",
            umfrageID="test123",
        )
        self.participant = Participant.objects.create(
            participant=1,
            settings=settings,
            retrieval_session_key="test_session_key",
        )

    @patch("spotify.views.playlists.execute_spotify_api_request")
    def test_public_self_owned_playlists_are_not_stored_by_default(
        self,
        execute_spotify_api_request,
    ):
        execute_spotify_api_request.return_value = {"id": "current-user"}
        playlists = [
            {
                "id": "owned",
                "name": "Owned",
                "owner": {"id": "current-user"},
                "public": True,
            },
            {
                "id": "other",
                "name": "Other",
                "owner": {"id": "other-user"},
                "public": True,
            },
        ]

        _build_and_create_playlists(
            "test_session_key",
            playlists,
            self.participant,
        )

        self.assertEqual(
            list(CurrentPlaylist.objects.values_list("spotify_id", flat=True)),
            ["other"],
        )

        self.participant.settings.store_public_self_owned_playlists = True
        self.participant.settings.save()
        _build_and_create_playlists(
            "test_session_key",
            [playlists[0]],
            self.participant,
        )

        self.assertTrue(CurrentPlaylist.objects.filter(spotify_id="owned").exists())