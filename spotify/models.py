from turtle import mode
from django.db import models
from api.models import Settings

class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

class Participant(models.Model):
    participant = models.CharField(max_length=50, default='')
    settings = models.ForeignKey(Settings, on_delete=models.PROTECT)
    retrieval_session_key = models.CharField(max_length=50, unique=True, default='')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='in_progress')


class SavedTracksSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

class TopTracksSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

class TopArtistsSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

class UsersProfileSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)   

class FollowedArtistsSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

class CurrentPlaylistsSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)   

class RecentlyTracksSpotify(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

class SpotifyAudioFeatures(models.Model):
    dataString = models.CharField(max_length=50, default='')
    data = models.JSONField(default=dict)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)

