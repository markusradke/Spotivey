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
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    data = models.JSONField(default=dict)
    confirm = models.BooleanField(default=False)    

    def __str__(self):
        return "Saved track for participant" + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"
    
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
