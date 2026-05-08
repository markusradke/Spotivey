from __future__ import annotations

from typing import Any, Mapping


EXPLICIT_SETTING_FIELDS: tuple[str, ...] = (
    "saved_tracks_enabled",
    "saved_tracks_confirm",
    "saved_tracks_limit",
    "saved_tracks_market_code",
    "profile_enabled",
    "profile_confirm",
    "top_tracks_enabled",
    "top_tracks_confirm",
    "top_tracks_limit",
    "top_tracks_time_range",
    "top_artists_enabled",
    "top_artists_confirm",
    "top_artists_limit",
    "top_artists_time_range",
    "followed_artists_enabled",
    "followed_artists_confirm",
    "followed_artists_limit",
    "current_playlists_enabled",
    "current_playlists_confirm",
    "current_playlists_limit",
    "current_playlists_public",
    "recent_tracks_enabled",
    "recent_tracks_confirm",
    "recent_tracks_limit",
    "saved_shows_enabled",
    "saved_shows_confirm",
    "saved_shows_limit",
    "save_episodes_enabled",
    "save_episodes_confirm",
    "save_episodes_limit",
)


def extract_explicit_settings_update(payload: Mapping[str, Any]) -> dict[str, Any]:
    update: dict[str, Any] = {}
    for field_name in EXPLICIT_SETTING_FIELDS:
        if field_name in payload and payload[field_name] is not None:
            update[field_name] = payload[field_name]

    return update
