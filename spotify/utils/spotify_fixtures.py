"""Deterministic Spotify API fixtures for tests.

This module is only used when `SPOTIVEY_TEST_MODE=1`.
Keep fixtures minimal and stable; they should include only fields
read by the app's extractors.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class SpotifyFixtureResponse:
    payload: Dict[str, Any]


def _me_user() -> Dict[str, Any]:
    return {
        "id": "test_user_1",
        "country": "DE",
        "followers": {"total": 42},
        "product": "premium",
    }


def _track(track_id: str, artist_id: str, album_id: str) -> Dict[str, Any]:
    return {
        "id": track_id,
        "uri": f"spotify:track:{track_id}",
        "name": f"Track {track_id}",
        "duration_ms": 123000,
        "explicit": False,
        "popularity": 50,
        "external_ids": {"isrc": f"ISRC{track_id[-4:]}"},
        "album": {
            "id": album_id,
            "name": f"Album {album_id}",
            "album_type": "album",
            "release_date": "2020-01-01",
            "images": [{"url": "https://example.com/cover.jpg"}],
        },
        "artists": [
            {"id": artist_id, "name": f"Artist {artist_id}"},
        ],
    }


def _artist(artist_id: str) -> Dict[str, Any]:
    return {
        "id": artist_id,
        "name": f"Artist {artist_id}",
        "type": "artist",
        "popularity": 55,
        "followers": {"total": 1000},
        "images": [{"url": "https://example.com/artist.jpg"}],
        "genres": ["rock", "pop"],
    }


def _playlist(spotify_id: str, owner_id: str) -> Dict[str, Any]:
    return {
        "id": spotify_id,
        "name": f"Playlist {spotify_id}",
        "collaborative": False,
        "public": True,
        "owner": {"id": owner_id},
        "images": [{"url": "https://example.com/pl.jpg"}],
        "tracks": {"total": 12},
    }

def _show(show_id: str) -> Dict[str, Any]:
    return {
        "id": show_id,
        "name": f"Show {show_id}",
        "description": f"Description for show {show_id}",
        "languages": ["en"],
        "media_type": "audio",
        "publisher": f"Publisher {show_id}",
        "total_episodes": 10,
        "images": [{"url": "https://example.com/show.jpg"}],
    }

def _episode(episode_id: str, show_id: str) -> Dict[str, Any]:
    return {
        "id": episode_id,
        "name": f"Episode {episode_id}",
        "description": f"Description for episode {episode_id}",
        "duration_ms": 3600000,
        "release_date": "2020-01-01",
        "languages": ["en"],
        "resume_point": {"fully_played": False},
        "show": _show(show_id),
    }


def get_fixture_for_endpoint(endpoint: str) -> Optional[SpotifyFixtureResponse]:
    """Return a deterministic fixture for a Spotify endpoint.

    Args:
        endpoint: Spotify endpoint string passed to `execute_spotify_api_request`,
            e.g. "me/tracks?limit=10".

    Returns:
        SpotifyFixtureResponse if endpoint is recognized, else None.
    """

    # Normalize common patterns used by the app.
    if endpoint == "me":
        return SpotifyFixtureResponse(_me_user())

    if endpoint.startswith("me/tracks"):
        return SpotifyFixtureResponse(
            {
                "items": [
                    {
                        "added_at": "2020-01-02T00:00:00Z",
                        "track": _track("track_saved_1", "artist_1", "album_1"),
                    }
                ]
            }
        )

    if endpoint.startswith("me/top/tracks"):
        return SpotifyFixtureResponse({"items": [_track("track_top_1", "artist_2", "album_2")]})

    if endpoint.startswith("me/player/recently-played"):
        return SpotifyFixtureResponse(
            {
                "items": [
                    {
                        "played_at": "2020-01-03T00:00:00Z",
                        "context": {"type": "playlist", "uri": "spotify:playlist:pl_1"},
                        "track": _track("track_recent_1", "artist_3", "album_3"),
                    }
                ]
            }
        )

    if endpoint.startswith("me/top/artists"):
        return SpotifyFixtureResponse({"items": [_artist("artist_top_1")]})

    if endpoint.startswith("me/following"):
        return SpotifyFixtureResponse({"artists": {"items": [_artist("artist_followed_1")]}})

    if endpoint.startswith("me/playlists"):
        return SpotifyFixtureResponse({"items": [_playlist("pl_1", owner_id="test_user_1")]})

    # Batch helpers in `spotify/utils/batch_operations.py`
    if endpoint.startswith("albums"):
        # Example: albums?ids=a,b
        ids = endpoint.split("ids=", 1)[-1].split(",") if "ids=" in endpoint else []
        return SpotifyFixtureResponse(
            {
                "albums": [
                    {
                        "id": album_id,
                        "label": f"Label {album_id}",
                        "genres": ["indie"],
                    }
                    for album_id in ids
                    if album_id
                ]
            }
        )

    if endpoint.startswith("artists"):
        ids = endpoint.split("ids=", 1)[-1].split(",") if "ids=" in endpoint else []
        return SpotifyFixtureResponse(
            {"artists": [{"id": artist_id, "genres": ["alt"], "followers": {"total": 1}} for artist_id in ids if artist_id]}
        )

    if endpoint.startswith("me/shows"):
        return SpotifyFixtureResponse(
            {"items": [{"added_at": "2020-01-02T00:00:00Z", "show": _show("show_1")}]}
        )
    
    if endpoint.startswith("me/episodes"):
        return SpotifyFixtureResponse(
            {"items": [{"added_at": "2020-01-02T00:00:00Z", "episode": _episode("episode_1", "show_1")}]}
        )

    return None
