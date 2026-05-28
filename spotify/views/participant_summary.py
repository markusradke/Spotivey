"""Participant summary endpoints."""

from __future__ import annotations

import re
from typing import Any

from django.db.models import Avg
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from spotify.models import Participant
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.summary_stats import (
    compute_participant_summary_stats,
    get_release_year_bin_labels,
    store_participant_summary_stats,
)

SUMMARY_FIELDS = [
    "summary_confirmed_playlist_count",
    "summary_confirmed_track_count",
    "summary_confirmed_artist_count",
    "summary_playlists_public_pct",
    "summary_playlists_self_owned_pct",
    "summary_playlists_avg_tracks",
    "summary_mainstream_track_popularity_median",
    "summary_saved_track_popularity_median",
    "summary_followed_artist_popularity_median",
    "summary_recent_track_popularity_median",
    "summary_top_tracks_popularity_median",
    "summary_mainstream_artist_popularity_median",
    "summary_mainstream_score",
    "summary_saved_track_explicit_pct",
    "summary_recent_track_explicit_pct",
    "summary_top_tracks_explicit_pct",
    "summary_explicit_pct",
    "summary_release_year_median",
    "summary_release_year_bins",
    "summary_genre_counts",
    "summary_top_genres",
]


def _safe_int(value: Any) -> int | None:
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _safe_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_participant_summary(participant, *, persist: bool = False) -> dict[str, Any]:
    stats = store_participant_summary_stats(participant, save=True) if persist else _get_summary_stats(participant)
    settings = participant.settings
    release_year_bins = stats.get("summary_release_year_bins") or {}
    release_year_points = _count_release_year_points(participant)
    survey_means = _build_survey_means(settings)
    data_basis = _build_data_basis(participant, stats, release_year_points)

    return {
        "participant": participant.participant,
        "surveyID": settings.umfrageID,
        "usage": {
            "followers": _safe_int(participant.followers),
            "total_saved_tracks": _safe_int(participant.total_saved_tracks),
            "total_followed_artists": _safe_int(participant.total_followed_artists),
            "total_current_playlists": _safe_int(participant.total_current_playlists),
        },
        "summary": stats,
        "release_year_bins": release_year_bins,
        "survey_means": survey_means,
        "data_basis": data_basis,
        "end": {
            "end_option": settings.end_option,
            "end_url": settings.end_url,
            "share_survey_url": getattr(settings, "share_survey_url", ""),
        },
    }


def _get_summary_stats(participant) -> dict[str, Any]:
    stats = {field: getattr(participant, field) for field in SUMMARY_FIELDS}
    if any(value is None for value in stats.values()):
        return compute_participant_summary_stats(participant)
    return stats


def _build_survey_means(settings) -> dict[str, Any]:
    qs = Participant.objects.filter(settings=settings, completed_at__isnull=False)
    respondent_count = qs.count()

    usage_fields = [
        "followers",
        "total_saved_tracks",
        "total_followed_artists",
        "total_current_playlists",
    ]

    SUMMARY_FIELDS = [
        "summary_confirmed_playlist_count",
        "summary_confirmed_track_count",
        "summary_confirmed_artist_count",
        "summary_playlists_public_pct",
        "summary_playlists_self_owned_pct",
        "summary_playlists_avg_tracks",
        "summary_mainstream_track_popularity_median",
        "summary_saved_track_popularity_median",
        "summary_followed_artist_popularity_median",
        "summary_recent_track_popularity_median",
        "summary_top_tracks_popularity_median",
        "summary_mainstream_artist_popularity_median",
        "summary_mainstream_score",
        "summary_saved_track_explicit_pct",
        "summary_recent_track_explicit_pct",
        "summary_top_tracks_explicit_pct",
        "summary_explicit_pct",
        "summary_release_year_median",
    ]

    agg = qs.aggregate(
        **{f"mean_{name}": Avg(name) for name in usage_fields + SUMMARY_FIELDS}
    )

    return {
        "respondent_count": respondent_count,
        "usage": {
            name: _safe_float(agg.get(f"mean_{name}"))
            for name in usage_fields
        },
        "summary": {
            name: _safe_float(agg.get(f"mean_{name}"))
            for name in SUMMARY_FIELDS
        },
        "release_year_bins": _build_release_year_bin_means(qs),
    }


def _build_data_basis(participant, stats: dict[str, Any], release_year_points: int) -> dict[str, Any]:
    from spotify.models import (
        FollowedArtist,
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

    recent_track_points = RecentTrack.objects.filter(participant=participant, confirmed=True).count()
    top_track_points = (
        TopTrackShortTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopTrackMediumTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopTrackLongTerm.objects.filter(participant=participant, confirmed=True).count()
    )
    saved_track_points = SavedTrack.objects.filter(participant=participant, confirmed=True).count()
    playlist_track_points = PrivatePlaylistTrack.objects.filter(
        participant=participant, confirmed=True, playlist__confirmed=True
    ).count()
    top_artist_points = (
        TopArtistShortTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistMediumTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistLongTerm.objects.filter(participant=participant, confirmed=True).count()
    )
    followed_artist_points = FollowedArtist.objects.filter(participant=participant, confirmed=True).count()
    artist_points = top_artist_points + followed_artist_points

    return {
        "confirmed_tracks": _safe_int(stats.get("summary_confirmed_track_count")) or 0,
        "confirmed_artists": _safe_int(stats.get("summary_confirmed_artist_count")) or 0,
        "confirmed_playlists": _safe_int(stats.get("summary_confirmed_playlist_count")) or 0,
        "confirmed_playlist_tracks": _safe_int(stats.get("summary_confirmed_playlist_track_count"))
        or 0,
        "saved_track_points": saved_track_points,
        "recent_track_points": recent_track_points,
        "top_track_points": top_track_points,
        "playlist_track_points": playlist_track_points,
        "top_artist_points": top_artist_points,
        "followed_artist_points": followed_artist_points,
        "artist_points": artist_points,
        "release_year_points": release_year_points,
        "genre_points": sum(stats.get("summary_genre_counts", {}).values())
        if isinstance(stats.get("summary_genre_counts"), dict)
        else 0,
    }


def _get_participant_from_query(request):
    query = getattr(request, "query_params", request.GET)
    survey_id = query.get("surveyID")
    part_id = query.get("participant")


    if not survey_id or not part_id:
        return None, Response(
            {"error": "surveyID and participant are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try: participant = Participant.objects.get(participant=part_id, settings__umfrageID=survey_id)
    except Participant.DoesNotExist:
        return None, Response(
            {"error": "Participant not found for given surveyID and participant"},
            status=status.HTTP_404_NOT_FOUND,
        )

    print(participant) 
    return participant, None


def _extract_release_year(release_date: Any) -> int | None:
    if not isinstance(release_date, str):
        return None

    match = re.match(r"^(\d{4})", release_date.strip())
    if not match:
        return None

    year = _safe_int(match.group(1))
    if year is None:
        return None
    if year < 1900 or year > 2100:
        return None
    return year


def _count_release_year_points(participant) -> int:
    from spotify.models import (
        RecentTrack,
        SavedTrack,
        TopTrackLongTerm,
        TopTrackMediumTerm,
        TopTrackShortTerm,
    )

    valid_points = 0
    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
    ]

    for model in track_models:
        release_dates = model.objects.filter(participant=participant, confirmed=True).values_list(
            "release_date", flat=True
        )
        for release_date in release_dates:
            year = _extract_release_year(release_date)
            if year is None:
                continue
            valid_points += 1

    return valid_points


def _build_release_year_bin_means(qs) -> dict[str, float | None]:
    bin_labels = get_release_year_bin_labels()
    totals = {label: 0.0 for label in bin_labels}
    counts = {label: 0 for label in bin_labels}

    for bins in qs.values_list("summary_release_year_bins", flat=True):
        if not isinstance(bins, dict):
            continue
        for label in bin_labels:
            value = _safe_float(bins.get(label))
            if value is None:
                continue
            totals[label] += value
            counts[label] += 1

    return {
        label: (totals[label] / counts[label]) if counts[label] > 0 else None
        for label in bin_labels
    }


def _format_pct(value: Any) -> str:
    parsed = _safe_float(value)
    if parsed is None:
        return "NA"
    return f"{parsed:.1f}%"


def _format_float(value: Any) -> str:
    parsed = _safe_float(value)
    if parsed is None:
        return "NA"
    return f"{parsed:.1f}"


class ParticipantSummary(APIView):
    """Return participant summary JSON for the current session participant."""

    def get(self, request):
        participant, error = _get_participant_from_query(request)
        if error:
            return error

        return Response(_build_participant_summary(participant), status=status.HTTP_200_OK)


class ParticipantSummarySave(APIView):
    """Persist participant summary stats for the current session participant."""

    def post(self, request):
        participant, error = get_participant_from_session(request)
        if error:
            return error

        return Response(_build_participant_summary(participant, persist=True), status=status.HTTP_200_OK)
