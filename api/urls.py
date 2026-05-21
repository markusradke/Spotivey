from django.urls import path

from .views import (
    # Auth views
    CreateSettingsUser, LoginSettingsUser, LogoutUser, GetUserSession,
    CheckUsernameAvailability, CheckEmailAvailability, GetUserProfile,
    UpdateUserProfile,
    # Participant views
    InitParticipantSession, AcceptPrivacyPolicy, GetParticipantSession, FinalizeParticipantData, SaveParticipantEmail,
    # Settings views
    CreateSettings, CheckSurveyIDExists, getSettingsListView, getSettingsFromIDView,
    UpdateSettings, SaveCheckData, DeleteSettings, UpdateConfirmText,
    GetSettingsSecondSurvey, CreateSettingsSecondSurvey, UpdateSettingsSecondSurvey,
    UpdateSettingsSecondSurveyEndURL, DeleteSettingsSecondSurvey,
    # Results views
    getResultListView, GetParticipantCountForSurvey, DeleteOnlyResultsWithID,
    # CSV export
    saveRepertoireToCsvFileView,
    saveParticipantsToCsvFileView,
    saveEmailsToCsvFileView,
)

urlpatterns = [
    # Participant session management
    path('init-participant-session', InitParticipantSession.as_view()),
    path('get-participant-session', GetParticipantSession.as_view()),
    path('accept-privacy-policy', AcceptPrivacyPolicy.as_view()),
    path('finalize-participant-data', FinalizeParticipantData.as_view()),
    path('save-participant-email', SaveParticipantEmail.as_view()),  
    
    # Authentication & session
    path('get-user-session', GetUserSession.as_view()),
    path('logout-user', LogoutUser.as_view()),
    path('create-settings-user', CreateSettingsUser.as_view()),
    path('login-settings-user', LoginSettingsUser.as_view()),
    path('check-username-availability', CheckUsernameAvailability.as_view()),
    path('check-email-availability', CheckEmailAvailability.as_view()),
    path('get-user-profile', GetUserProfile.as_view()),
    path('update-user-profile', UpdateUserProfile.as_view()),
    
    # Retrieval settings management
    path('create-settings', CreateSettings.as_view()),
    path('check-survey-id', CheckSurveyIDExists.as_view()),
    path('get-settingslist', getSettingsListView.as_view()),
    path('get-settingsfromid', getSettingsFromIDView.as_view()),
    path('update-settings', UpdateSettings.as_view()),
    path('save-check-data', SaveCheckData.as_view()),
    path('delete-settings', DeleteSettings.as_view()),
    path('update-confirm-text', UpdateConfirmText.as_view()),

    
    
    # Follow-up survey settings
    path('get-settings-second-survey', GetSettingsSecondSurvey.as_view()),
    path('create-settings-second-survey', CreateSettingsSecondSurvey.as_view()),
    path('update-settings-second-survey', UpdateSettingsSecondSurvey.as_view()),
    path('update-settings-second-survey-end-url', UpdateSettingsSecondSurveyEndURL.as_view()),
    path('delete-settings-second-survey', DeleteSettingsSecondSurvey.as_view()),
    
    # Results
    path('get-resultlist', getResultListView.as_view()),
    path('get-participant-count', GetParticipantCountForSurvey.as_view()),
    path('delete-only-results', DeleteOnlyResultsWithID.as_view()),
    
    # CSV export
    path('save-repertoire-to-csv-file', saveRepertoireToCsvFileView.as_view()),
    path('save-participants-to-csv-file', saveParticipantsToCsvFileView.as_view()),
    path('save-emails-to-csv-file', saveEmailsToCsvFileView.as_view()),
]