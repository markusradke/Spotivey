"""Wrapped summary + share image endpoints."""

from __future__ import annotations

from io import BytesIO
import re
from typing import Any

from PIL import Image, ImageDraw, ImageFont
from django.db.models import Avg
from django.http import HttpResponse
from django.views import View
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from spotify.models import Participant
from spotify.utils.retrieval_helpers import get_participant_from_session
from spotify.utils.wrapped_stats import compute_wrapped_stats, store_wrapped_stats

WRAPPED_FIELDS = [
    "wrapped_confirmed_playlist_count",
    "wrapped_confirmed_track_count",
    "wrapped_confirmed_artist_count",
    "wrapped_playlists_public_pct",
    "wrapped_playlists_self_owned_pct",
    "wrapped_playlists_avg_tracks",
    "wrapped_mainstream_track_popularity_median",
    "wrapped_saved_track_popularity_median",
    "wrapped_recent_track_popularity_median",
    "wrapped_top_tracks_popularity_median",
    "wrapped_mainstream_artist_popularity_median",
    "wrapped_mainstream_score",
    "wrapped_saved_track_explicit_pct",
    "wrapped_recent_track_explicit_pct",
    "wrapped_top_tracks_explicit_pct",
    "wrapped_explicit_pct",
    "wrapped_genre_counts",
    "wrapped_top_genres",
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


def _build_wrapped_summary(participant, *, persist: bool = False) -> dict[str, Any]:
    stats = store_wrapped_stats(participant, save=True) if persist else _get_wrapped_stats(participant)
    settings = participant.settings
    release_year_histogram = _build_release_year_histogram(participant)
    survey_means = _build_survey_means(settings)
    data_basis = _build_data_basis(participant, stats, release_year_histogram)

    return {
        "participant": participant.participant,
        "surveyID": settings.umfrageID,
        "usage": {
            "followers": _safe_int(participant.followers),
            "total_saved_tracks": _safe_int(participant.total_saved_tracks),
            "total_followed_artists": _safe_int(participant.total_followed_artists),
            "total_current_playlists": _safe_int(participant.total_current_playlists),
        },
        "wrapped": stats,
        "release_year_histogram": release_year_histogram,
        "survey_means": survey_means,
        "data_basis": data_basis,
        "end": {
            "end_option": settings.end_option,
            "end_url": settings.end_url,
            "share_survey_url": getattr(settings, "share_survey_url", ""),
        },
    }


def _get_wrapped_stats(participant) -> dict[str, Any]:
    stats = {field: getattr(participant, field) for field in WRAPPED_FIELDS}
    if any(value is None for value in stats.values()):
        return compute_wrapped_stats(participant)
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

    wrapped_fields = [
        "wrapped_confirmed_playlist_count",
        "wrapped_confirmed_track_count",
        "wrapped_confirmed_artist_count",
        "wrapped_playlists_public_pct",
        "wrapped_playlists_self_owned_pct",
        "wrapped_playlists_avg_tracks",
        "wrapped_mainstream_track_popularity_median",
        "wrapped_saved_track_popularity_median",
        "wrapped_recent_track_popularity_median",
        "wrapped_top_tracks_popularity_median",
        "wrapped_mainstream_artist_popularity_median",
        "wrapped_mainstream_score",
        "wrapped_saved_track_explicit_pct",
        "wrapped_recent_track_explicit_pct",
        "wrapped_top_tracks_explicit_pct",
        "wrapped_explicit_pct",
    ]

    agg = qs.aggregate(
        **{f"mean_{name}": Avg(name) for name in usage_fields + wrapped_fields}
    )

    return {
        "respondent_count": respondent_count,
        "usage": {
            name: _safe_float(agg.get(f"mean_{name}"))
            for name in usage_fields
        },
        "wrapped": {
            name: _safe_float(agg.get(f"mean_{name}"))
            for name in wrapped_fields
        },
    }


def _build_data_basis(participant, stats: dict[str, Any], release_year_histogram: list[dict[str, int]]) -> dict[str, Any]:
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
    artist_points = (
        TopArtistShortTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistMediumTerm.objects.filter(participant=participant, confirmed=True).count()
        + TopArtistLongTerm.objects.filter(participant=participant, confirmed=True).count()
        + FollowedArtist.objects.filter(participant=participant, confirmed=True).count()
    )

    return {
        "confirmed_tracks": _safe_int(stats.get("wrapped_confirmed_track_count")) or 0,
        "confirmed_artists": _safe_int(stats.get("wrapped_confirmed_artist_count")) or 0,
        "confirmed_playlists": _safe_int(stats.get("wrapped_confirmed_playlist_count")) or 0,
        "confirmed_playlist_tracks": _safe_int(stats.get("wrapped_confirmed_playlist_track_count"))
        or 0,
        "saved_track_points": saved_track_points,
        "recent_track_points": recent_track_points,
        "top_track_points": top_track_points,
        "playlist_track_points": playlist_track_points,
        "artist_points": artist_points,
        "release_year_points": sum(item.get("count", 0) for item in release_year_histogram),
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


def _build_release_year_histogram(participant) -> list[dict[str, int]]:
    from spotify.models import (
        PrivatePlaylistTrack,
        RecentTrack,
        SavedTrack,
        TopTrackLongTerm,
        TopTrackMediumTerm,
        TopTrackShortTerm,
    )

    year_counts: dict[int, int] = {}
    track_models = [
        SavedTrack,
        TopTrackShortTerm,
        TopTrackMediumTerm,
        TopTrackLongTerm,
        RecentTrack,
        PrivatePlaylistTrack,
    ]

    for model in track_models:
        release_dates = model.objects.filter(participant=participant, confirmed=True).values_list(
            "release_date", flat=True
        )
        for release_date in release_dates:
            year = _extract_release_year(release_date)
            if year is None:
                continue
            year_counts[year] = year_counts.get(year, 0) + 1

    return [
        {"year": year, "count": count}
        for year, count in sorted(year_counts.items(), key=lambda item: item[0])
    ]


def _render_wrapped_png(summary: dict[str, Any]) -> bytes:
    width, height = 1080, 1920
    image = Image.new("RGB", (width, height), (245, 245, 245))
    draw = ImageDraw.Draw(image)

    title_font = ImageFont.load_default()
    body_font = ImageFont.load_default()

    x = 60
    y = 80

    draw.text((x, y), "Spotivey Wrapped", fill=(20, 20, 20), font=title_font)
    y += 60

    usage = summary.get("usage", {})
    wrapped = summary.get("wrapped", {})

    lines = [
        f"Followers: {usage.get('followers', 'NA')}",
        f"Saved tracks (total): {usage.get('total_saved_tracks', 'NA')}",
        f"Followed artists (total): {usage.get('total_followed_artists', 'NA')}",
        f"Playlists (total): {usage.get('total_current_playlists', 'NA')}",
        "",
        f"Saved tracks median popularity: {_format_float(wrapped.get('wrapped_saved_track_popularity_median'))}",
        f"Recent tracks median popularity: {_format_float(wrapped.get('wrapped_recent_track_popularity_median'))}",
        f"Top tracks median popularity: {_format_float(wrapped.get('wrapped_top_tracks_popularity_median'))}",
        f"Top artists median popularity: {_format_float(wrapped.get('wrapped_mainstream_artist_popularity_median'))}",
        "",
        f"Confirmed playlists: {wrapped.get('wrapped_confirmed_playlist_count', 'NA')}",
        f"Public playlists: {_format_pct(wrapped.get('wrapped_playlists_public_pct'))}",
        f"Self-owned playlists: {_format_pct(wrapped.get('wrapped_playlists_self_owned_pct'))}",
        f"Avg tracks per playlist: {_format_float(wrapped.get('wrapped_playlists_avg_tracks'))}",
        "",
        f"Mainstream score: {_format_float(wrapped.get('wrapped_mainstream_score'))}",
        f"Saved tracks explicitness: {_format_pct(wrapped.get('wrapped_saved_track_explicit_pct'))}",
        f"Recent tracks explicitness: {_format_pct(wrapped.get('wrapped_recent_track_explicit_pct'))}",
        f"Top tracks explicitness: {_format_pct(wrapped.get('wrapped_top_tracks_explicit_pct'))}",
        f"Explicitness score: {_format_pct(wrapped.get('wrapped_explicit_pct'))}",
        "",
        f"Based on {wrapped.get('wrapped_confirmed_track_count', 'NA')} confirmed tracks",
        f"Based on {wrapped.get('wrapped_confirmed_artist_count', 'NA')} confirmed artists",
    ]

    top_genres = wrapped.get("wrapped_top_genres") or []
    if isinstance(top_genres, list) and top_genres:
        lines.append("")
        lines.append("Top genres:")
        lines.append(", ".join(top_genres[:10]))

    for line in lines:
        draw.text((x, y), line, fill=(20, 20, 20), font=body_font)
        y += 36

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


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


class WrappedSummary(APIView):
    """Return wrapped summary JSON for the current session participant."""

    def get(self, request):
        participant, error = _get_participant_from_query(request)
        if error:
            return error

        return Response(_build_wrapped_summary(participant), status=status.HTTP_200_OK)


class WrappedSummarySave(APIView):
    """Persist wrapped stats for the current session participant."""

    def post(self, request):
        participant, error = get_participant_from_session(request)
        if error:
            return error

        return Response(_build_wrapped_summary(participant, persist=True), status=status.HTTP_200_OK)


class WrappedImage(View):
    """Return a PNG share image for the current session participant."""

    def get(self, request):
        participant, error = _get_participant_from_query(request)
        if error:
            return error

        summary = _build_wrapped_summary(participant)
        png = _render_wrapped_png(summary)

        response = HttpResponse(png, content_type="image/png")
        response["Content-Disposition"] = "inline; filename=spotivey_wrapped.png"
        return response
