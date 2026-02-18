import json
from turtle import mode
from django.db import models
from api.models import RetrievalSetting

class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

    def __str__(self):
        return self.user

class Participant(models.Model):
    participant = models.CharField(max_length=50, default='')
    settings = models.ForeignKey(RetrievalSetting, on_delete=models.PROTECT)
    retrieval_session_key = models.CharField(max_length=50, unique=True, default='')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='in_progress')

    def __str__(self):
        return self.participant + " (retrieval settings: " + self.settings.nameUmfrage + ")"

class BaseTrack(models.Model):
    """Abstract base model for all track types."""
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    confirmed = models.BooleanField(default=False)
    
    # Track identification
    spotify_id = models.CharField(max_length=50, db_index=True)
    isrc = models.CharField(max_length=20, default='')
    track_uri = models.CharField(max_length=100, default='')
    
    # Track metadata
    track_name = models.CharField(max_length=300, default='')
    duration_ms = models.IntegerField(null=True, default=None)
    explicit = models.BooleanField(null=True, default=None)
    popularity = models.IntegerField(null=True, default=None)
    
    # Album information
    album_id = models.CharField(max_length=50, default='')
    album_name = models.CharField(max_length=200, default='')
    album_label = models.CharField(max_length=200, default='')
    album_type = models.CharField(max_length=50, default='')
    release_date = models.CharField(max_length=20, default='')
    image_url = models.URLField(max_length=500, default='')
    
    # Artist information (comma-separated or JSON)
    artist_names = models.TextField(default='')
    artist_ids = models.TextField(default='')
    artist_genres = models.TextField(default='')
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['participant', 'spotify_id']),
        ]
    
    def get_base_dict(self):
        """Return common fields for frontend."""
        return {
            'track_name': self.track_name,
            'album_type': self.album_type,
            'duration_ms': self.duration_ms,
            'image_url': self.image_url,
            'explicit': self.explicit,
            'isrc': self.isrc,
            'spotify_id': self.spotify_id,
            'popularity': self.popularity,
            'spotify_artist_string': self.artist_names,
            'spotify_artist_id': json.loads(self.artist_ids),
            'track_uri': self.track_uri,
            'albumLabel': self.album_label,
            'albumName': self.album_name,
            'album_id': self.album_id,
            'releaseDate': self.release_date,
            'spotify_artist_genre': [g.strip() for g in self.artist_genres.split(', ') if g],
        }

    def __str__(self):
        return f"Track (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"


class SavedTrack(BaseTrack):
    """Participant's saved track."""
    added_at = models.DateTimeField(null=True, default=None)
    
    def to_dict(self): 
        data = self.get_base_dict()
        data['added_at'] = self.added_at
        return data


class TopTrack(BaseTrack):
    """Participant's top track."""

    def to_dict(self): 
        return self.get_base_dict()
    

class RecentTrack(BaseTrack):
    """Participant's recently played track."""
    played_at = models.DateTimeField(null=True, default=None)
    context_type = models.CharField(max_length=50, default='')
    context_uri = models.CharField(max_length=200, default='')
    
    def to_dict(self): 
        data = self.get_base_dict()
        data.update({
            'played_at': self.played_at,
            'context_type': self.context_type,
            'context_uri': self.context_uri,
        })
        return data


class ParticipantProfile(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    country = models.CharField(max_length=20, default='')
    followers = models.IntegerField(null=True, default=None)
    product = models.CharField(max_length=50, default='')
    confirmed = models.BooleanField(default=False)   
    
    def __str__(self):
        return "Participant profile for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"
    
    def to_dict(self):
        return {
            'country': self.country,
            'followers': self.followers,
            'product': self.product,
        }


class CurrentPlaylist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    playlist_id = models.CharField(max_length=100, default='')
    playlist_name = models.CharField(max_length=200, default='')
    playlist_cover = models.URLField(max_length=500, default='')
    is_collaborative = models.BooleanField(null=True, default=None)
    is_public = models.BooleanField(null=True, default=None)
    is_self_owned = models.BooleanField(null=True, default=None)
    n_tracks = models.IntegerField(null=True, default=None)

    confirmed = models.BooleanField(default=False)   
    def __str__(self):
        return "Current playlist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

    def to_dict(self):
        return {
            'playlist_id': self.playlist_id,
            'playlist_name': self.playlist_name,
            'playlist_cover': self.playlist_cover,
            'is_collaborative': self.is_collaborative,
            'is_public': self.is_public,
            'is_self_owned': self.is_self_owned,
            'n_tracks': self.n_tracks,
        }


class TopArtist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Top artist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class FollowedArtist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Followed artist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"


