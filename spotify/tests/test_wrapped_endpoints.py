from django.test import Client, TestCase

from api.models import RetrievalSetting
from spotify.models import Participant


class WrappedEndpointsTest(TestCase):
    def setUp(self):
        self.settings = RetrievalSetting.objects.create(
            nameUmfrage="Test Survey",
            umfrageID="test123",
            end_option="wrapped",
            end_url="https://example.com/end",
            share_survey_url="https://example.com/survey",
        )
        self.participant = Participant.objects.create(
            participant="test_participant",
            settings=self.settings,
            retrieval_session_key="test_session_key",
        )
        self.client = Client()
        session = self.client.session
        session["retrieval_session_key"] = "test_session_key"
        session.save()

    def test_wrapped_save_requires_session(self):
        other = Client()
        response = other.post("/spotify/wrapped/summary/save")
        self.assertEqual(response.status_code, 400)

    def test_wrapped_save_ok(self):
        response = self.client.post("/spotify/wrapped/summary/save")
        self.assertEqual(response.status_code, 200)
        self.participant.refresh_from_db()
        self.assertIsNotNone(self.participant.wrapped_confirmed_track_count)

    def test_wrapped_summary_ok(self):
        self.client.post("/spotify/wrapped/summary/save")
        response = self.client.get("/spotify/wrapped/summary?surveyID=test123&participant=test_participant")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["participant"], "test_participant")
        self.assertEqual(payload["surveyID"], "test123")
        self.assertIn("usage", payload)
        self.assertIn("wrapped", payload)
        self.assertIn("end", payload)

    def test_wrapped_image_ok(self):
        self.client.post("/spotify/wrapped/summary/save")
        response = self.client.get("/spotify/wrapped/image?surveyID=test123&participant=test_participant")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        self.assertTrue(len(response.content) > 100)
