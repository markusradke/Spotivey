from __future__ import annotations

from typing import Any

from ..models import RetrievalSetting


def build_retrieval_settings_payload(setting: RetrievalSetting) -> dict[str, Any]:
    return {
        'saved_tracks': {
            'check': setting.saved_tracks_enabled,
            'limit': setting.saved_tracks_limit,
            'market': setting.saved_tracks_market_code or "",
            'marketCode': setting.saved_tracks_market_code or "",
            'confirmCheck': setting.saved_tracks_confirm,
        },
        'profile': {
            'check': setting.profile_enabled,
            'confirmCheck': setting.profile_confirm,
        },
        'top_tracks': {
            'check': setting.top_tracks_enabled,
            'limit': setting.top_tracks_limit,
            'timeRange': setting.top_tracks_time_range or "medium_term",
            'confirmCheck': setting.top_tracks_confirm,
        },
        'top_artists': {
            'check': setting.top_artists_enabled,
            'limit': setting.top_artists_limit,
            'timeRange': setting.top_artists_time_range or "medium_term",
            'confirmCheck': setting.top_artists_confirm,
        },
        'followed_artists': {
            'check': setting.followed_artists_enabled,
            'limit': setting.followed_artists_limit,
            'confirmCheck': setting.followed_artists_confirm,
        },
        'current_playlists': {
            'check': setting.current_playlists_enabled,
            'limit': setting.current_playlists_limit,
            'confirmCheck': setting.current_playlists_confirm,
            'public': setting.current_playlists_public,
        },
        'recently_played': {
            'check': setting.recent_tracks_enabled,
            'limit': setting.recent_tracks_limit,
            'confirmCheck': setting.recent_tracks_confirm,
        },
        'saved_shows': {
            'check': setting.saved_shows_enabled,
            'limit': setting.saved_shows_limit,
            'confirmCheck': setting.saved_shows_confirm,
        },
        'saved_episodes': {
            'check': setting.save_episodes_enabled,
            'limit': setting.save_episodes_limit,
            'confirmCheck': setting.save_episodes_confirm,
        },
        'textAllg': [],
    }
