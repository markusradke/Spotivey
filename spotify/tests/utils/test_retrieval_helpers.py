from django.test import TestCase
from spotify.utils.retrieval_helpers import random_sample_items, extract_artist_info


class RetrievalHelpersTest(TestCase):
    """Test retrieval helper functions."""
    
    def test_random_sample_items(self):
        """Test random sampling function."""
        items = list(range(100))
        sampled = random_sample_items(items, limit=100, sample_size=50)
        
        self.assertEqual(len(sampled), 50)
        self.assertTrue(all(item in items for item in sampled))
    
    def test_extract_artist_info(self):
        """Test artist info extraction."""
        artists = [
            {'name': 'Artist 1', 'id': 'id1'},
            {'name': 'Artist 2', 'id': 'id2'}
        ]
        
        info = extract_artist_info(artists)
        
        self.assertEqual(info['names'], ['Artist 1', 'Artist 2'])
        self.assertEqual(info['ids'], ['id1', 'id2'])
        self.assertEqual(info['names_string'], 'Artist 1, Artist 2')
