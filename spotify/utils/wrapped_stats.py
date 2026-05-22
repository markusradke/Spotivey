"""Compute and store participant-level 'Wrapped' summary statistics."""

from __future__ import annotations

import json
from collections import Counter
from statistics import median
from typing import Any, Iterable

from django.db.models import Avg

from spotify.models import (
    CurrentPlaylist,
    FollowedArtist,
    Participant,
    PrivatePlaylistTrack,
    RecentTrack,
    SavedTrack,
    TopArtistLongTerm,
    TopArtistMediumTerm,
    TopArtistShortTerm,
    TopTrackLongTerm,
    TopTrackMediumTerm,
    TopTrackShortTerm,
)

TOP_N_GENRES = 20


def compute_wrapped_stats(participant: Participant) -> dict[str, Any]:
    """Compute wrapped summary stats using confirmed, already-stored data.

    The function only considers rows with ``confirmed=True`` and treats missing
    fields (e.g., unknown popularity) as unavailable.

    Args:
        participant: Participant DB instance.

    Returns:
        Mapping of computed wrapped fields (keys match Participant fields).
    """

    playlists = CurrentPlaylist.objects.filter(participant=participant)
    confirmed_playlists = playlists.filter(confirmed=True).count()

    confirmed_playlist_tracks = PrivatePlaylistTrack.objects.filter(
        participant=participant, confirmed=True, playlist__confirmed=True
    ).count()

    public_known = playlists.exclude(is_public__isnull=True)
    public_pct = _pct_true(public_known, "is_public")

    self_owned_known = playlists.exclude(is_self_owned__isnull=True)
    self_owned_pct = _pct_true(self_owned_known, "is_self_owned")

    avg_tracks = playlists.exclude(n_tracks__isnull=True).aggregate(avg=Avg("n_tracks"))["avg"]

    saved_track_popularities = _collect_saved_track_values(participant, "popularity")
    recent_track_popularities = _collect_recent_track_values(participant, "popularity")
    top_track_popularities = _collect_top_track_values(participant, "popularity")
    artist_popularities = _collect_artist_values(participant, "popularity")

    track_popularities = recent_track_popularities + top_track_popularities
    track_median = _safe_median(track_popularities)
    saved_track_median = _safe_median(saved_track_popularities)
    recent_track_median = _safe_median(recent_track_popularities)
    top_track_median = _safe_median(top_track_popularities)
    artist_median = _safe_median(artist_popularities)
    mainstream_score = _safe_mean([
        saved_track_median,
        recent_track_median,
        top_track_median,
        artist_median,
    ])

    explicit_pct = _compute_explicit_pct(participant)

    genre_counts = _compute_genre_counts(participant)
    top_genres = [genre for genre, _count in genre_counts.most_common(TOP_N_GENRES)]

    confirmed_tracks = _count_confirmed_tracks(participant)
    confirmed_artists = _count_confirmed_artists(participant)

    return {
        "wrapped_confirmed_track_count": confirmed_tracks,
        "wrapped_confirmed_artist_count": confirmed_artists,
        "wrapped_confirmed_playlist_count": confirmed_playlists,
        "wrapped_confirmed_playlist_track_count": confirmed_playlist_tracks,
        "wrapped_playlists_public_pct": public_pct,
        "wrapped_playlists_self_owned_pct": self_owned_pct,
        "wrapped_playlists_avg_tracks": float(avg_tracks) if avg_tracks is not None else None,
        "wrapped_mainstream_track_popularity_median": track_median,
        "wrapped_saved_track_popularity_median": saved_track_median,
        "wrapped_recent_track_popularity_median": recent_track_median,
        "wrapped_top_tracks_popularity_median": top_track_median,
        "wrapped_mainstream_artist_popularity_median": artist_median,
        "wrapped_mainstream_score": mainstream_score,
        "wrapped_explicit_pct": explicit_pct,
        "wrapped_genre_counts": dict(genre_counts),
        "wrapped_top_genres": top_genres,
    }


def store_wrapped_stats(participant: Participant, *, save: bool = True) -> dict[str, Any]:
    """Compute wrapped stats and persist them on the participant.

    Args:
        participant: Participant DB instance.
        save: When True, writes fields to the DB.

    Returns:
        The computed wrapped stats mapping.
    """

    stats = compute_wrapped_stats(participant)
    for key, value in stats.items():
        setattr(participant, key, value)

    if save:
        participant.save(update_fields=list(stats.keys()))

    return stats


def _pct_true(queryset, field: str) -> float | None:
    total = queryset.count()
    if total <= 0:
        return None
    true_count = queryset.filter(**{field: True}).count()
    return (true_count / total) * 100.0


def _safe_median(values: Iterable[int | float | None]) -> float | None:
    cleaned = [v for v in values if v is not None]
    if not cleaned:
        return None
    return float(median(cleaned))


def _safe_mean(values: Iterable[float | None]) -> float | None:
    cleaned = [v for v in values if v is not None]
    if not cleaned:
        return None
    return float(sum(cleaned) / len(cleaned))


def _collect_track_values(participant: Participant, field: str) -> list[int | float]:
    models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
        PrivatePlaylistTrack,
    ]

    collected: list[int | float] = []
    for model in models:
        collected.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(**{f"{field}__isnull": True})
            .values_list(field, flat=True)
        )
    return collected


def _collect_recent_track_values(participant: Participant, field: str) -> list[int | float]:
    return list(
        RecentTrack.objects.filter(participant=participant, confirmed=True)
        .exclude(**{f"{field}__isnull": True})
        .values_list(field, flat=True)
    )


def _collect_saved_track_values(participant: Participant, field: str) -> list[int | float]:
    return list(
        SavedTrack.objects.filter(participant=participant, confirmed=True)
        .exclude(**{f"{field}__isnull": True})
        .values_list(field, flat=True)
    )


def _collect_top_track_values(participant: Participant, field: str) -> list[int | float]:
    models = [TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm]

    collected: list[int | float] = []
    for model in models:
        collected.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(**{f"{field}__isnull": True})
            .values_list(field, flat=True)
        )
    return collected


def _collect_artist_values(participant: Participant, field: str) -> list[int | float]:
    models = [
        TopArtistShortTerm,
        TopArtistMediumTerm,
        TopArtistLongTerm,
        FollowedArtist,
    ]

    collected: list[int | float] = []
    for model in models:
        collected.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(**{f"{field}__isnull": True})
            .values_list(field, flat=True)
        )
    return collected


def _compute_explicit_pct(participant: Participant) -> float | None:
    explicit_values: list[bool] = []
    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
        PrivatePlaylistTrack,
    ]

    for model in track_models:
        explicit_values.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(explicit__isnull=True)
            .values_list("explicit", flat=True)
        )

    if not explicit_values:
        return None

    explicit_true = sum(1 for value in explicit_values if value)
    return (explicit_true / len(explicit_values)) * 100.0


def _compute_genre_counts(participant: Participant) -> Counter[str]:
    counts: Counter[str] = Counter()

    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
        PrivatePlaylistTrack,
    ]

    for model in track_models:
        for raw in (
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(artist_genres="")
            .values_list("artist_genres", flat=True)
        ):
            for genre in _iter_track_genres(raw):
                counts[genre] += 1

    artist_models = [
        TopArtistShortTerm,
        TopArtistMediumTerm,
        TopArtistLongTerm,
        FollowedArtist,
    ]
    for model in artist_models:
        for raw in (
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(genre_string="")
            .values_list("genre_string", flat=True)
        ):
            for genre in _iter_artist_genres(raw):
                counts[genre] += 1

    return counts


def _iter_track_genres(raw_json: str) -> Iterable[str]:
    if not raw_json:
        return []

    try:
        decoded = json.loads(raw_json)
    except (TypeError, json.JSONDecodeError):
        return []

    flattened: list[str] = []
    if isinstance(decoded, list):
        for item in decoded:
            if isinstance(item, list):
                for v in item:
                    flattened.extend(_split_maybe_csv(v))
            elif item:
                flattened.extend(_split_maybe_csv(item))

    normalized: list[str] = []
    for value in flattened:
        candidate = _normalize_genre(value)
        if candidate:
            normalized.append(candidate)

    return normalized


def _iter_artist_genres(raw: str) -> Iterable[str]:
    if not raw:
        return []

    parts = [part.strip() for part in raw.split(",")]
    normalized = [_normalize_genre(part) for part in parts]
    return [value for value in normalized if value]


def _normalize_genre(value: str) -> str:
    return str(value).strip().lower()


def _count_confirmed_tracks(participant: Participant) -> int:
    return (
        SavedTrack.objects.filter(participant=participant, confirmed=True).count()
        + TopTrackShortTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopTrackMediumTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopTrackLongTerm.objects.filter(participant=participant, confirmed=True).count()
        + RecentTrack.objects.filter(participant=participant, confirmed=True).count()
        + PrivatePlaylistTrack.objects.filter(
            participant=participant, confirmed=True, playlist__confirmed=True
        ).count()
    )


def _count_confirmed_artists(participant: Participant) -> int:
    return (
        TopArtistShortTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistMediumTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistLongTerm.objects.filter(participant=participant, confirmed=True).count()
        + FollowedArtist.objects.filter(participant=participant, confirmed=True).count()
    )


def _split_maybe_csv(value: Any) -> list[str]:
    if value is None:
        return []

    as_str = str(value)
    if "," not in as_str:
        return [as_str]

    return [part.strip() for part in as_str.split(",") if part.strip()]
