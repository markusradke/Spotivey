"""Compute and store participant-level 'Wrapped' summary statistics."""

from __future__ import annotations

from datetime import datetime
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
FIRST_DECADE_BIN_YEAR = 1960


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
    followed_artist_popularities = _collect_followed_artist_values(participant, "popularity")
    top_artist_popularities = _collect_top_artist_values(participant, "popularity")

    track_popularities = recent_track_popularities + top_track_popularities
    track_median = _safe_median(track_popularities)
    saved_track_median = _safe_median(saved_track_popularities)
    recent_track_median = _safe_median(recent_track_popularities)
    top_track_median = _safe_median(top_track_popularities)
    followed_artist_median = _safe_median(followed_artist_popularities)
    top_artist_median = _safe_median(top_artist_popularities)
    mainstream_score = _safe_mean([
        saved_track_median,
        recent_track_median,
        top_track_median,
        top_artist_median,
        followed_artist_median,
    ])

    saved_track_explicit_pct = _compute_explicit_pct_for_models(participant, [SavedTrack])
    recent_track_explicit_pct = _compute_explicit_pct_for_models(participant, [RecentTrack])
    top_tracks_explicit_pct = _compute_explicit_pct_for_models(
        participant,
        [TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm],
    )
    explicit_pct = _safe_mean([
        saved_track_explicit_pct,
        recent_track_explicit_pct,
        top_tracks_explicit_pct,
    ])

    release_year_median = _compute_release_year_median(participant)
    release_year_bins = _compute_release_year_bin_percentages(participant)

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
        "wrapped_followed_artist_popularity_median": followed_artist_median,
        "wrapped_recent_track_popularity_median": recent_track_median,
        "wrapped_top_tracks_popularity_median": top_track_median,
        "wrapped_mainstream_artist_popularity_median": top_artist_median,
        "wrapped_mainstream_score": mainstream_score,
        "wrapped_saved_track_explicit_pct": saved_track_explicit_pct,
        "wrapped_recent_track_explicit_pct": recent_track_explicit_pct,
        "wrapped_top_tracks_explicit_pct": top_tracks_explicit_pct,
        "wrapped_explicit_pct": explicit_pct,
        "wrapped_release_year_median": release_year_median,
        "wrapped_release_year_bins": release_year_bins,
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


def _collect_top_artist_values(participant: Participant, field: str) -> list[int | float]:
    models = [
        TopArtistShortTerm,
        TopArtistMediumTerm,
        TopArtistLongTerm,
    ]

    collected: list[int | float] = []
    for model in models:
        collected.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(**{f"{field}__isnull": True})
            .values_list(field, flat=True)
        )
    return collected


def _collect_followed_artist_values(participant: Participant, field: str) -> list[int | float]:
    return list(
        FollowedArtist.objects.filter(participant=participant, confirmed=True)
        .exclude(**{f"{field}__isnull": True})
        .values_list(field, flat=True)
    )


def _compute_explicit_pct_for_models(
    participant: Participant,
    models: list[type[Any]],
) -> float | None:
    explicit_values: list[bool] = []
    for model in models:
        explicit_values.extend(
            model.objects.filter(participant=participant, confirmed=True)
            .exclude(explicit__isnull=True)
            .values_list("explicit", flat=True)
        )

    if not explicit_values:
        return None

    explicit_true = sum(1 for value in explicit_values if value)
    return (explicit_true / len(explicit_values)) * 100.0


def get_release_year_bin_labels() -> list[str]:
    current_decade = (datetime.now().year // 10) * 10
    labels = ["up to 1960"]
    labels.extend(f"{decade}s" for decade in range(FIRST_DECADE_BIN_YEAR, current_decade + 1, 10))
    return labels


def _compute_release_year_bin_percentages(participant: Participant) -> dict[str, float]:
    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
    ]

    labels = get_release_year_bin_labels()
    bin_counts = {label: 0 for label in labels}
    total_count = 0

    for model in track_models:
        release_dates = model.objects.filter(participant=participant, confirmed=True).values_list(
            "release_date", flat=True
        )
        for release_date in release_dates:
            year = _extract_release_year(release_date)
            if year is None:
                continue
            bin_label = _get_release_year_bin_label(year)
            if bin_label not in bin_counts:
                continue
            bin_counts[bin_label] += 1
            total_count += 1

    if total_count == 0:
        return {}

    return {
        label: (count / total_count) * 100.0
        for label, count in bin_counts.items()
    }


def _compute_release_year_median(participant: Participant) -> float | None:
    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
    ]

    years: list[int] = []
    for model in track_models:
        release_dates = model.objects.filter(participant=participant, confirmed=True).values_list(
            "release_date", flat=True
        )
        for release_date in release_dates:
            year = _extract_release_year(release_date)
            if year is not None:
                years.append(year)

    return _safe_median(years)


def _extract_release_year(release_date: Any) -> int | None:
    if not isinstance(release_date, str):
        return None

    stripped = release_date.strip()
    if len(stripped) < 4 or not stripped[:4].isdigit():
        return None

    year = int(stripped[:4])
    if year < 1900 or year > 2100:
        return None
    return year


def _get_release_year_bin_label(year: int) -> str:
    if year <= FIRST_DECADE_BIN_YEAR:
        return "up to 1960"
    decade = (year // 10) * 10
    return f"{decade}s"


def _compute_genre_counts(participant: Participant) -> Counter[str]:
    counts: Counter[str] = Counter()

    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
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
