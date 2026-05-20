from django.db import models
from django.contrib.auth.models import User

class Researcher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) 
    institution = models.CharField(max_length=200)


class RetrievalSetting(models.Model):
    defaultConfirmTextEng = """Please confirm the results.
If some results are unfamiliar or uncomfortable to you, please feel free to deselect the results."""
    defaultConfirmTextDe = """Bitte bestätigen Sie die Ergebnisse.
Wenn einige Ergebnisse für Sie ungewohnt oder unangenehm sind, können Sie die Ergebnisse gerne abwählen."""

    user = models.ManyToManyField(User, default='')
    nameUmfrage = models.TextField(default='')
    umfrageID = models.TextField(max_length=50, default='', unique=True)

    saved_tracks_enabled = models.BooleanField(default=False)
    saved_tracks_confirm = models.BooleanField(default=True)
    saved_tracks_limit = models.PositiveIntegerField(default=10)
    saved_tracks_market_code = models.CharField(max_length=10, default="", blank=True)
    saved_tracks_followup = models.PositiveIntegerField(default=0)

    profile_enabled = models.BooleanField(default=False)
    profile_confirm = models.BooleanField(default=False)

    top_tracks_shortterm_enabled = models.BooleanField(default=False)
    top_tracks_shortterm_confirm = models.BooleanField(default=True)
    top_tracks_shortterm_limit = models.PositiveIntegerField(default=20)
    top_tracks_shortterm_followup = models.PositiveIntegerField(default=0)

    top_tracks_mediumterm_enabled = models.BooleanField(default=False)
    top_tracks_mediumterm_confirm = models.BooleanField(default=True)
    top_tracks_mediumterm_limit = models.PositiveIntegerField(default=20)
    top_tracks_mediumterm_followup = models.PositiveIntegerField(default=0)

    top_tracks_longterm_enabled = models.BooleanField(default=False)
    top_tracks_longterm_confirm = models.BooleanField(default=True)
    top_tracks_longterm_limit = models.PositiveIntegerField(default=20)
    top_tracks_longterm_followup = models.PositiveIntegerField(default=0)

    top_artists_shortterm_enabled = models.BooleanField(default=False)
    top_artists_shortterm_confirm = models.BooleanField(default=True)
    top_artists_shortterm_limit = models.PositiveIntegerField(default=20)
    top_artists_shortterm_followup = models.PositiveIntegerField(default=0)

    top_artists_mediumterm_enabled = models.BooleanField(default=False)
    top_artists_mediumterm_confirm = models.BooleanField(default=True)
    top_artists_mediumterm_limit = models.PositiveIntegerField(default=20)
    top_artists_mediumterm_followup = models.PositiveIntegerField(default=0)

    top_artists_longterm_enabled = models.BooleanField(default=False)
    top_artists_longterm_confirm = models.BooleanField(default=True)
    top_artists_longterm_limit = models.PositiveIntegerField(default=20)
    top_artists_longterm_followup = models.PositiveIntegerField(default=0)

    followed_artists_enabled = models.BooleanField(default=False)
    followed_artists_confirm = models.BooleanField(default=True)
    followed_artists_limit = models.PositiveIntegerField(default=20)
    followed_artists_followup = models.PositiveIntegerField(default=0)

    current_playlists_enabled = models.BooleanField(default=False)
    current_playlists_confirm = models.BooleanField(default=True)
    current_playlists_limit = models.PositiveIntegerField(default=20)
    current_playlists_public = models.BooleanField(default=True)
    current_playlists_privatetracks = models.BooleanField(default=False)
    current_playlists_followup = models.PositiveIntegerField(default=0)

    recent_tracks_enabled = models.BooleanField(default=False)
    recent_tracks_confirm = models.BooleanField(default=True)
    recent_tracks_limit = models.PositiveIntegerField(default=20)
    recent_tracks_followup = models.PositiveIntegerField(default=0)
    
    saved_shows_enabled = models.BooleanField(default=False)
    saved_shows_confirm = models.BooleanField(default=True)
    saved_shows_limit = models.PositiveIntegerField(default=20)
    saved_shows_followup = models.PositiveIntegerField(default=0)

    saved_episodes_enabled = models.BooleanField(default=False)
    saved_episodes_confirm = models.BooleanField(default=True)
    saved_episodes_limit = models.PositiveIntegerField(default=20)
    saved_episodes_followup = models.PositiveIntegerField(default=0)

    confirmTextEng = models.TextField(default=defaultConfirmTextEng)
    confirmTextDe = models.TextField(default=defaultConfirmTextDe)

    END_CHOICES = [
        ("plain", "Simple end of survey page"),
        ("wrapped", "Statistical summary of participant responses"),
        ("end_url", "Redirect to custom URL at end of donation (e.g., to a follow-up survey)"), 
        ("conditional_end_url", "Redirect to custom URL at end of donation based on presence of a URL parameter"),
    ]
    CONDITIONAL_CHOICES = [
        ("plain", "Simple end of survey page"),
        ("wrapped", "Statistical summary of participant responses"),
    ]
    
    end_option = models.CharField(max_length=20, choices = END_CHOICES, default="plain")
    end_url = models.URLField(max_length=200, default='', blank=True)
    conditional_end_url_parameter = models.CharField(max_length=100, default='', blank=True)
    conditional_end_url_option = models.CharField(max_length=200, choices = CONDITIONAL_CHOICES, default='plain')

    def __str__(self):
        return self.nameUmfrage + " (survey ID: " + self.umfrageID + ")"
    
  

# keep legacy model for now, to check its inner workings later
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