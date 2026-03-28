from django.db import models
import random
import string
from django.contrib.auth.models import User

def generate_unique_code():
    """Generate unique 6-character code for UserCode"""
    length = 6
    
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if UserCode.objects.filter(code=code).count() == 0:
            break
    
    return code

class UserCode(models.Model):
    code = models.CharField(max_length=8, default='', unique=True)
    host = models.CharField(max_length=50)
    user = models.ManyToManyField(User, default='')

    
class RetrievalSetting(models.Model):
    defaultConfirmTextEng = """Please confirm the results.
If some results are unfamiliar or uncomfortable to you, please feel free to contradict the results."""
    defaultConfirmTextDe = """Bitte bestätigen Sie die Ergebnisse.
Wenn einige Ergebnisse für Sie ungewohnt oder unangenehm sind, können Sie den Ergebnissen gerne widersprechen."""

    user = models.ManyToManyField(User, default='')
    nameUmfrage = models.TextField(default='')
    umfrageID = models.TextField(max_length=50, default='', unique=True)
    umfrageURL = models.TextField(default='')
    data = models.JSONField(null=True)

    saved_tracks_enabled = models.BooleanField(default=False)
    saved_tracks_confirm = models.BooleanField(default=True)
    saved_tracks_limit = models.PositiveIntegerField(default=10)
    saved_tracks_market_code = models.CharField(max_length=10, default="", blank=True)

    profile_enabled = models.BooleanField(default=False)
    profile_confirm = models.BooleanField(default=False)

    top_tracks_enabled = models.BooleanField(default=False)
    top_tracks_confirm = models.BooleanField(default=True)
    top_tracks_limit = models.PositiveIntegerField(default=20)
    top_tracks_time_range = models.CharField(
        max_length=20, default="medium_term", blank=True
    )

    top_artists_enabled = models.BooleanField(default=False)
    top_artists_confirm = models.BooleanField(default=True)
    top_artists_limit = models.PositiveIntegerField(default=20)
    top_artists_time_range = models.CharField(
        max_length=20, default="medium_term", blank=True
    )

    followed_artists_enabled = models.BooleanField(default=False)
    followed_artists_confirm = models.BooleanField(default=True)
    followed_artists_limit = models.PositiveIntegerField(default=20)

    current_playlists_enabled = models.BooleanField(default=False)
    current_playlists_confirm = models.BooleanField(default=True)
    current_playlists_limit = models.PositiveIntegerField(default=20)
    current_playlists_public = models.BooleanField(default=True)

    recent_tracks_enabled = models.BooleanField(default=False)
    recent_tracks_confirm = models.BooleanField(default=True)
    recent_tracks_limit = models.PositiveIntegerField(default=20)
    
    confirmTextSTEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextTTEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextRTEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextTAEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextFAEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextCPEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextSTDe = models.TextField(default=defaultConfirmTextDe)
    confirmTextTTDe = models.TextField(default=defaultConfirmTextDe)
    confirmTextRTDe = models.TextField(default=defaultConfirmTextDe)
    confirmTextTADe = models.TextField(default=defaultConfirmTextDe)
    confirmTextFADe = models.TextField(default=defaultConfirmTextDe)
    confirmTextCPDe = models.TextField(default=defaultConfirmTextDe)

    def __str__(self):
        return self.nameUmfrage + " (survey ID: " + self.umfrageID + ")"


class FollowupSurvey(models.Model):
    user = models.ManyToManyField(User, default='')
    settings = models.ForeignKey(RetrievalSetting, on_delete=models.CASCADE, null= True, blank=True)
    secondSurveyID = models.TextField(max_length=50, default='', blank=True)
    secondSurveyServer = models.TextField(max_length=50, default='', blank=True)
    secondSurveyLanguage = models.TextField(max_length=50, default='', blank=True)
    secondSurveyOther = models.JSONField(null=True, blank=True)
    secondSurveyData = models.JSONField(null=True, blank=True)
    secondSurveyEndURL = models.URLField(max_length=200, default='', blank=True)
    passLang = models.BooleanField(default=False)

    def __str__(self):
        return "Follow-up survey for " + self.settings.nameUmfrage + " (follow-up survey ID: " + self.settings.umfrageID + ")"