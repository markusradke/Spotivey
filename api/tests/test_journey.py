from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from rest_framework.test import APIClient

from api.models import RetrievalSetting
from spotify.models import SpotifyToken, Participant


class SpotiveyBackendJourneyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.researcher = User.objects.create_user(
            username="researcher1",
            email="researcher1@example.com",
            password="pw12345678",
        )

        self.survey_id = "123456"
        self.participant_id = "1"

    def _create_spotify_token_for_current_session(self):
        session_key = self.client.session.session_key
        if not session_key:
            self.client.get("/api/get-participant-session")
            session_key = self.client.session.session_key

        SpotifyToken.objects.update_or_create(
            user=session_key,
            defaults={
                "access_token": "test_access",
                "refresh_token": "test_refresh",
                "token_type": "Bearer",
                "expires_in": timezone.now() + timedelta(hours=1),
            },
        )

    def _create_settings_all_types(self):
        payload = {
            "data": {},
            "username": self.researcher.username,
            "umfrageName": "Test Survey",
            "umfrageID": self.survey_id,
            "umfrageEndUrl": "https://example.com/end",
            "saved_tracks_enabled": True,
            "saved_tracks_confirm": True,
            "saved_tracks_limit": 10,
            "profile_enabled": True,
            "profile_confirm": True,
            "top_tracks_shortterm_enabled": True,
            "top_tracks_shortterm_confirm": True,
            "top_tracks_shortterm_limit": 10,
            "top_tracks_mediumterm_enabled": True,
            "top_tracks_mediumterm_confirm": True,
            "top_tracks_mediumterm_limit": 10,
            "top_tracks_longterm_enabled": True,
            "top_tracks_longterm_confirm": True,
            "top_tracks_longterm_limit": 10,
            "top_artists_shortterm_enabled": True,
            "top_artists_shortterm_confirm": True,
            "top_artists_shortterm_limit": 10,
            "top_artists_mediumterm_enabled": True,
            "top_artists_mediumterm_confirm": True,
            "top_artists_mediumterm_limit": 10,
            "top_artists_longterm_enabled": True,
            "top_artists_longterm_confirm": True,
            "top_artists_longterm_limit": 10,
            "followed_artists_enabled": True,
            "followed_artists_confirm": True,
            "followed_artists_limit": 10,
            "current_playlists_enabled": True,
            "current_playlists_confirm": True,
            "current_playlists_limit": 10,
            "current_playlists_public": True,
            "recent_tracks_enabled": True,
            "recent_tracks_confirm": True,
            "recent_tracks_limit": 10,
            "saved_shows_enabled": True,
            "saved_shows_confirm": True,
            "saved_shows_limit": 10,
            "saved_episodes_enabled": True,
            "saved_episodes_confirm": True,
            "saved_episodes_limit": 10,
        }
        resp = self.client.post("/api/create-settings", payload, format="json")
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertTrue(RetrievalSetting.objects.filter(umfrageID=self.survey_id).exists())

    def _update_settings_saved_tracks_only(self):
        settings = RetrievalSetting.objects.get(umfrageID=self.survey_id)
        payload = {
            "data": {},
            "username": self.researcher.username,
            "umfrageName": settings.nameUmfrage,
            "umfrageID": self.survey_id,
            "umfrageEndUrl": settings.umfrageURL,
            "updateID": settings.umfrageID,
            "saved_tracks_enabled": True,
            "saved_tracks_confirm": True,
            "saved_tracks_limit": 10,
            "profile_enabled": False,
            "top_tracks_shortterm_enabled": False,
            "top_tracks_mediumterm_enabled": False,
            "top_tracks_longterm_enabled": False,
            "top_artists_shortterm_enabled": False,
            "top_artists_mediumterm_enabled": False,
            "top_artists_longterm_enabled": False,
            "followed_artists_enabled": False,
            "current_playlists_enabled": False,
            "recent_tracks_enabled": False,
            "saved_shows_enabled": False,
            "saved_episodes_enabled": False,
        }
        resp = self.client.post("/api/update-settings", payload, format="json")
        self.assertEqual(resp.status_code, 200, resp.data)

    def _init_participant(self):
        resp = self.client.post(
            "/api/init-participant-session",
            {
                "surveyID": self.survey_id,
                "participant": self.participant_id,
                "lang": "en",
                "paramsObject": [["surveyID", self.survey_id], ["participant", self.participant_id], ["lang", "en"]],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.data)

        resp2 = self.client.post(
            "/api/accept-privacy-policy",
            {"accepted": True},
            format="json",
        )
        self.assertEqual(resp2.status_code, 200, resp2.data)

    def _retrieve_all_types(self):
        self._create_spotify_token_for_current_session()

        resp = self.client.post("/spotify/saved-tracks?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/users-profile")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-tracks/short-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-tracks/medium-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-tracks/long-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-artists/short-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-artists/medium-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/top-artists/long-term?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/followed-artists?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/current-playlists?limit=10&public=true")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/recently-played-tracks?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/saved-shows?limit=10")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/spotify/saved-episodes?limit=10")
        self.assertEqual(resp.status_code, 200)

        done = self.client.post("/api/finalize-participant-data", format="json")
        self.assertEqual(done.status_code, 200, done.data)

    def _retrieve_saved_tracks_only(self):
        self._create_spotify_token_for_current_session()
        resp = self.client.post("/spotify/saved-tracks?limit=10")
        self.assertEqual(resp.status_code, 200)
        done = self.client.post("/api/finalize-participant-data", format="json")
        self.assertEqual(done.status_code, 200, done.data)

    def _assert_results_and_csv(self, expect_types: set[str]):
        res = self.client.get(f"/api/get-resultlist?surveyid={self.survey_id}")
        self.assertEqual(res.status_code, 200)
        payload = res.json()

        data_types = payload.get("dataTypes")
        self.assertIsInstance(data_types, list)

        got_titles = {dt.get("title") for dt in data_types}
        self.assertTrue(expect_types.issubset(got_titles))

        csv_repertoire = self.client.get(f"/api/save-repertoire-to-csv-file?surveyID={self.survey_id}")
        self.assertEqual(csv_repertoire.status_code, 200)
        csv_payload = csv_repertoire.json()
        self.assertIsInstance(csv_payload, list)
        self.assertGreater(len(csv_payload), 0)

        csv_participants = self.client.get(f"/api/save-participants-to-csv-file?surveyID={self.survey_id}")
        self.assertEqual(csv_participants.status_code, 200)
        csv_participants_payload = csv_participants.json()
        self.assertIsInstance(csv_participants_payload, list)
        self.assertGreater(len(csv_participants_payload), 0)



    def test_full_journey(self):
        # Ensure test-mode fixtures are used
        import os

        os.environ["SPOTIVEY_TEST_MODE"] = "1"

        # create retrieval settings with confirmations for all Spotify data types
        self._create_settings_all_types()

        # retrieve all spotify data
        self._init_participant()
        self._retrieve_all_types()

        # show all results and check that csv export works
        self._assert_results_and_csv(
            {
                "Saved Tracks",
                "Top Tracks (Short Term)",
                "Top Tracks (Medium Term)",
                "Top Tracks (Long Term)",
                "Recently Played",
                "Top Artists (Short Term)",
                "Top Artists (Medium Term)",
                "Top Artists (Long Term)",
                "Followed Artists",
                "Current Playlists",
                "User Profiles",
                "Saved Shows",
                "Saved Episodes",
            }
        )

        # fail in deleting retrieval settings
        del_settings = self.client.get(f"/api/delete-settings?surveyid={self.survey_id}")
        self.assertEqual(del_settings.status_code, 400)

        # delete all results for survey
        del_results = self.client.get(f"/api/delete-only-results?surveyid={self.survey_id}")
        self.assertEqual(del_results.status_code, 200)
        self.assertEqual(Participant.objects.filter(settings__umfrageID=self.survey_id).count(), 0)

        # edit retrieval settings to only retrieve saved tracks
        self._update_settings_saved_tracks_only()

        # retrieve spotify data
        self._init_participant()
        self._retrieve_saved_tracks_only()

        # show all results and check that csv export works
        self._assert_results_and_csv({"Saved Tracks"})

        # delete results
        del_results2 = self.client.get(f"/api/delete-only-results?surveyid={self.survey_id}")
        self.assertEqual(del_results2.status_code, 200)

        # delete settings
        del_settings2 = self.client.get(f"/api/delete-settings?surveyid={self.survey_id}")
        self.assertEqual(del_settings2.status_code, 200)

        os.environ["SPOTIVEY_TEST_MODE"] = "0"
        print("SPOTIVEY_TEST_MODE disabled after test completion.")
