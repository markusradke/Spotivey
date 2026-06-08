from django.test import TestCase
from django.contrib.auth.models import User

from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.models import Participant, SavedTrack
from api.models import RetrievalSetting, Researcher

class BulkOperationsTest(TestCase):
    """Test bulk database operations."""
    
    def setUp(self):
        """Create test data."""
        self.user = User.objects.create_user(
            username="researcher1",
            email="researcher1@example.com",
            password="pw12345678"
        )
        self.researcher = Researcher.objects.create(user=self.user, institution="Test Institute")
        self.settings = RetrievalSetting.objects.create(
            user=self.researcher,
            nameUmfrage='Test Survey',
            umfrageID='test123'
        )
        self.participant = Participant.objects.create(
            participant=1,
            settings=self.settings,
            retrieval_session_key='test_session_key'
        )
    
    def test_bulk_create(self):
        """Test bulk create operation."""
        tracks = [
            SavedTrack(
                participant=self.participant,
                spotify_id=f'id{i}',
            )
            for i in range(10)
        ]
        
        created_count, failed = bulk_create_with_retry(SavedTrack, tracks)
        
        self.assertEqual(created_count, 10)
        self.assertEqual(len(failed), 0)
        self.assertEqual(SavedTrack.objects.count(), 10)