from __future__ import annotations

from typing import Any, Mapping


EXPLICIT_SETTING_FIELDS: tuple[str, ...] = (
    "saved_tracks_enabled",
    "saved_tracks_confirm",
    "saved_tracks_limit",
    "saved_tracks_market_code",
    "saved_tracks_followup",
    "profile_enabled",
    "profile_confirm",
    "top_tracks_shortterm_enabled",
    "top_tracks_shortterm_confirm",
    "top_tracks_shortterm_limit",
    "top_tracks_shortterm_followup",
    "top_tracks_mediumterm_enabled",
    "top_tracks_mediumterm_confirm",
    "top_tracks_mediumterm_limit",
    "top_tracks_mediumterm_followup",
    "top_tracks_longterm_enabled",
    "top_tracks_longterm_confirm",
    "top_tracks_longterm_limit",
    "top_tracks_longterm_followup",
    "top_artists_shortterm_enabled",
    "top_artists_shortterm_confirm",
    "top_artists_shortterm_limit",
    "top_artists_shortterm_followup",
    "top_artists_mediumterm_enabled",
    "top_artists_mediumterm_confirm",
    "top_artists_mediumterm_limit",
    "top_artists_mediumterm_followup",
    "top_artists_longterm_enabled",
    "top_artists_longterm_confirm",
    "top_artists_longterm_limit",
    "top_artists_longterm_followup",
    "followed_artists_enabled",
    "followed_artists_confirm",
    "followed_artists_limit",
    "followed_artists_followup",
    "current_playlists_enabled",
    "current_playlists_confirm",
    "current_playlists_limit",
    "current_playlists_public",
    "current_playlists_privatetracks",
    "current_playlists_followup",
    "recent_tracks_enabled",
    "recent_tracks_confirm",
    "recent_tracks_limit",
    "recent_tracks_followup",
    "saved_shows_enabled",
    "saved_shows_confirm",
    "saved_shows_limit",
    "saved_shows_followup",
    "saved_episodes_enabled",
    "saved_episodes_confirm",
    "saved_episodes_limit",
    "saved_episodes_followup",
    "end_option",
    "end_url",
    "share_survey_url",
    "conditional_end_url_parameter",
    "conditional_end_url_option",
    "collect_emails",
    "email_text_en",
    "email_text_de",
)


def extract_explicit_settings_update(payload: Mapping[str, Any]) -> dict[str, Any]:
    update: dict[str, Any] = {}
    for field_name in EXPLICIT_SETTING_FIELDS:
        if field_name in payload and payload[field_name] is not None:
            update[field_name] = payload[field_name]

    return update
