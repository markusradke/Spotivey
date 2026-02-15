from django.test import TestCase
from spotify.utils.bulk_db import bulk_create_with_retry
from spotify.models import Participant, SavedTrack
from api.models import RetrievalSetting

class BulkOperationsTest(TestCase):
    """Test bulk database operations."""
    
    def setUp(self):
        """Create test data."""
        self.settings = RetrievalSetting.objects.create(
            nameUmfrage='Test Survey',
            umfrageID='test123'
        )
        self.participant = Participant.objects.create(
            participant='test_participant',
            settings=self.settings,
            retrieval_session_key='test_session_key'
        )
    
    def test_bulk_create(self):
        """Test bulk create operation."""
        tracks = [
            SavedTrack(
                participant=self.participant,
                data={'track_name': f'Track {i}', 'spotify_id': f'id{i}'},
                confirm=False
            )
            for i in range(10)
        ]
        
        created_count, failed = bulk_create_with_retry(SavedTrack, tracks)
        
        self.assertEqual(created_count, 10)
        self.assertEqual(len(failed), 0)
        self.assertEqual(SavedTrack.objects.count(), 10)