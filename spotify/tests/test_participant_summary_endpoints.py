from django.test import Client, TestCase

from api.models import RetrievalSetting
from spotify.models import Participant


class summaryEndpointsTest(TestCase):
    def setUp(self):
        self.settings = RetrievalSetting.objects.create(
            nameUmfrage="Test Survey",
            umfrageID="test123",
            end_option="summary",
            end_url="https://example.com/end",
            share_survey_url="https://example.com/survey",
        )
        self.participant = Participant.objects.create(
            participant=1,
            settings=self.settings,
            retrieval_session_key="test_session_key",
        )
        self.client = Client()
        session = self.client.session
        session["retrieval_session_key"] = "test_session_key"
        session.save()

    def test_summary_save_requires_session(self):
        other = Client()
        response = other.post("/spotify/participant/summary/save")
        self.assertEqual(response.status_code, 400)

    def test_summary_save_ok(self):
        response = self.client.post("/spotify/participant/summary/save")
        self.assertEqual(response.status_code, 200)
        self.participant.refresh_from_db()
        self.assertIsNotNone(self.participant.summary_confirmed_track_count)

    def test_summary_summary_ok(self):
        self.client.post("/spotify/participant/summary/save")
        response = self.client.get("/spotify/participant/summary?surveyID=test123&participant=1")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["participant"], 1)
        self.assertEqual(payload["surveyID"], "test123")
        self.assertIn("usage", payload)
        self.assertIn("summary", payload)
        self.assertIn("end", payload)

