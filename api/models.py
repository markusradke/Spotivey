from django.db import models
from django.contrib.auth.models import User

class Researcher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) 
    institution = models.CharField(max_length=200)


class RetrievalSetting(models.Model):
    defaultConfirmTextEng = """Wenn Sie mit der Spende einverstanden sind, klicken Sie einfach auf "Bestätige alle Ergebnisse". Falls Sie einige Inhalte aus Ihrem Spotify-Konto nicht spenden möchten, können Sie diese auch einzeln abwählen und dann OK klicken."""
    defaultConfirmTextDe = """If you agree to the donation, simply click "Confirm all results." If there are some items in your Spotify account that you don't want to donate, you can deselect them individually and then click OK."""

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
        ("summary", "Statistical summary of participant responses"),
        ("end_url", "Redirect to custom URL at end of donation (e.g., to a follow-up survey)"), 
        ("conditional_end_url", "Redirect to custom URL at end of donation based on presence of a URL parameter"),
    ]
    CONDITIONAL_CHOICES = [
        ("plain", "Simple end of survey page"),
        ("summary", "Statistical summary of participant responses"),
    ]
    
    end_option = models.CharField(max_length=20, choices = END_CHOICES, default="plain")
    end_url = models.URLField(max_length=200, default='', blank=True)
    share_survey_url = models.URLField(max_length=500, default='', blank=True)
    conditional_end_url_parameter = models.CharField(max_length=100, default='', blank=True)
    conditional_end_url_option = models.CharField(max_length=200, choices = CONDITIONAL_CHOICES, default='plain')
    collect_emails = models.BooleanField(default=False)
    email_text_en = models.TextField(default="", blank=True)
    email_text_de = models.TextField(default="", blank=True)


    SCREENOUT_CHOICES = [
        ("page", "Screenout end page with retry link"),
        ("end_url", "Redirect to custom URL at screenout (e.g., to a screenout survey)"),
        ("conditional_end_url", "Redirect to custom URL at screenout based on presence of a URL parameter"),
        ]
    screenout_option = models.CharField(max_length=20, choices = SCREENOUT_CHOICES, default="plain")
    screenout_url = models.URLField(max_length=200, default='', blank=True)
    conditional_screenout_url_parameter = models.CharField(max_length=100, default='', blank=True)
    screenout_min_data = models.PositiveIntegerField(default=0)
    screenout_check_identical = models.BooleanField(default=False)

    def __str__(self):
        return self.nameUmfrage + " (survey ID: " + self.umfrageID + ")"
    
  
class ParticipantEmail(models.Model):
    email = models.EmailField(max_length=254)
    settings = models.ForeignKey(RetrievalSetting, on_delete=models.CASCADE, null=True, blank=True)
    retrieval_session_key = models.CharField(max_length=100, unique=True, null=True, blank=True)

    class Meta:
        unique_together = ('email', 'settings')

    def __str__(self):
        return self.email + " (associated with survey ID: " + self.settings.umfrageID + ")"

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
    