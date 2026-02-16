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


class SavedTrack(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True)
    confirmed = models.BooleanField(default=False) 
    album_label = models.CharField(max_length=200, default='')
    album_name = models.CharField(max_length=200,  default='')
    album_type = models.CharField(max_length=50,   default='')
    release_date = models.CharField(max_length=20, default='')
    image_url = models.URLField(max_length=500,  default='')
    track_name = models.CharField(max_length=300,  default='')
    duration_ms = models.IntegerField(null=True,  default=None)
    explicit = models.BooleanField(null=True, default=None)
    isrc = models.CharField(max_length=20, default='')
    spotify_id = models.CharField(max_length=50, db_index=True, null=False, default='')
    track_uri = models.CharField(max_length=100, default='')
    popularity = models.IntegerField(null=True, default=None)
    added_at = models.DateTimeField(null=True, default=None)
    artist_names = models.TextField(default='')  # "Artist1, Artist2"
    artist_ids = models.TextField(default='')    # JSON array as string
    artist_genres = models.TextField(default='')  # "Genre1, Genre2"
    
    def to_dict(self): 
        """Serialize to frontend-compatible dictionary."""
        return {
            'track_name': self.track_name,
            'album_type': self.album_type,
            'duration_ms': self.duration_ms,
            'image_url': self.image_url,
            'added_at': self.added_at, 
            'explicit': self.explicit,
            'isrc': self.isrc,
            'spotify_id': self.spotify_id,
            'popularity': self.popularity,
            'spotify_artist_string': self.artist_names,  # Comma-separated string of artist names
            'spotify_artist_id': json.loads(self.artist_ids),  # Deserialize JSON array
            'track_uri': self.track_uri,
            'albumLabel': self.album_label,
            'albumName': self.album_name,
            'releaseDate': self.release_date,
            'spotify_artist_genre': [g.strip() for g in self.artist_genres.split(', ') if g],
            # TODO: dataAudioFeatures omitted for now - handle later
        }

    class Meta:
        indexes = [
            models.Index(fields=['participant', 'spotify_id']),
        ]


    def __str__(self):
        return f"Saved track (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"

class TopTrack(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Top track for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class TopArtist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Top artist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class ParticipantProfile(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)   
    def __str__(self):
        return "Participant profile for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class FollowedArtist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Followed artist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class CurrentPlaylist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)   
    def __str__(self):
        return "Current playlist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class RecentTrack(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    
    def __str__(self):
        return "Recent track for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

class AudioFeatures(models.Model):
    dataString = models.CharField(max_length=50, default='')
    data = models.JSONField(default=dict)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    
    def __str__(self):
        return "Audio features for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

    class Meta: 
        verbose_name_plural = "Audio Features"
