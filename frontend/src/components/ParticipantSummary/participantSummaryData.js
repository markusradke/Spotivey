import { useMemo } from "react";
import {
    buildBasisText,
    colors,
    formatCount,
    formatPercent,
    getExplicitScoreVariant,
    getMainstreamScoreVariant,
    hasMetricValue,
} from "./participantSummaryHelpers";

export function useSummaryData(summary, lang, isMobileLayout) {
    const surveyMeans = summary?.survey_means || {};
    const surveyMeanUsage = surveyMeans.usage || {};
    const surveyMeanSummary = surveyMeans.summary || {};
    const surveyMeanReleaseYearBins = surveyMeans.release_year_bins || {};
    const dataBasis = summary?.data_basis || {};
    const respondentCount = surveyMeans.respondent_count || 0;
    const releaseYearBins = summary?.release_year_bins || {};

    const shareSurveyUrl = useMemo(() => {
        const base = summary?.end?.share_survey_url;
        if (!base) return "";

        try {
            const url = new URL(base);
            url.search = "";
            if (lang) url.searchParams.set("lang", lang);
            return url.toString();
        } catch {
            const params = new URLSearchParams();
            if (lang) params.set("lang", lang);
            const queryString = params.toString();
            return queryString ? `${base}?${queryString}` : base;
        }
    }, [summary, lang]);

    const usageData = useMemo(() => ([
        {
            key: "followers",
            metric: lang === "de" ? "Profilfollower" : "Profile followers",
            value: summary?.usage?.followers ?? NaN,
            mean: surveyMeanUsage.followers ?? NaN,
        },
        {
            key: "saved_tracks",
            metric: lang === "de" ? "Gespeicherte Lieblingssongs" : "liked songs",
            value: summary?.usage?.total_saved_tracks ?? NaN,
            mean: surveyMeanUsage.total_saved_tracks ?? NaN,
        },
        {
            key: "followed_artists",
            metric: lang === "de" ? "Gefolgte Artists" : "Followed artists",
            value: summary?.usage?.total_followed_artists ?? NaN,
            mean: surveyMeanUsage.total_followed_artists ?? NaN,
        },
        {
            key: "saved_playlists",
            metric: lang === "de" ? "Gespeicherte Playlists" : "Saved playlists",
            value: summary?.usage?.total_current_playlists ?? NaN,
            mean: surveyMeanUsage.total_current_playlists ?? NaN,
        },
    ]), [lang, summary, surveyMeanUsage]);

    const usageChartData = useMemo(
        () => usageData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [usageData],
    );

    const playlistDetail = summary?.summary?.summary_playlists_public_pct
        ? (lang === "de"
            ? [
                `${formatPercent(summary.summary.summary_playlists_public_pct)} öffentlich`,
                `${formatPercent(summary.summary.summary_playlists_self_owned_pct)} selbst erstellt`,
                `${formatCount(summary.summary.summary_playlists_avg_tracks, lang)} Titel im Durchschnitt`,
            ]
            : [
                `${formatPercent(summary.summary.summary_playlists_public_pct)} public`,
                `${formatPercent(summary.summary.summary_playlists_self_owned_pct)} created yourself`,
                `${formatCount(summary.summary.summary_playlists_avg_tracks, lang)} tracks on average`,
            ])
        : [];

    const mainstreamData = useMemo(() => ([
        {
            metric: lang === "de" ? "Lieblingssongs" : "liked songs",
            value: summary?.summary?.summary_saved_track_popularity_median ?? NaN,
            mean: surveyMeanSummary.summary_saved_track_popularity_median ?? NaN,
        },
        {
            metric: lang === "de" ? "Gefolgte Artists" : "Followed artists",
            value: summary?.summary?.summary_followed_artist_popularity_median ?? NaN,
            mean: surveyMeanSummary.summary_followed_artist_popularity_median ?? NaN,
        },
        {
            metric: lang === "de" ? "Kürzlich gehörte Songs" : "Recent songs",
            value: summary?.summary?.summary_recent_track_popularity_median ?? NaN,
            mean: surveyMeanSummary.summary_recent_track_popularity_median ?? NaN,
        },
        {
            metric: lang === "de" ? "Top-Songs" : "Top songs",
            value: summary?.summary?.summary_top_tracks_popularity_median ?? NaN,
            mean: surveyMeanSummary.summary_top_tracks_popularity_median ?? NaN,
        },
        {
            metric: lang === "de" ? "Top-Künstler" : "Top artists",
            value: summary?.summary?.summary_mainstream_artist_popularity_median ?? NaN,
            mean: surveyMeanSummary.summary_mainstream_artist_popularity_median ?? NaN,
        },
    ]), [lang, summary, surveyMeanSummary]);

    const mainstreamChartData = useMemo(
        () => mainstreamData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [mainstreamData],
    );

    const explicitData = useMemo(() => ([
        {
            key: "saved_tracks",
            metric: lang === "de" ? "Lieblingssongs" : "Saved tracks",
            value: summary?.summary?.summary_saved_track_explicit_pct ?? NaN,
            mean: surveyMeanSummary.summary_saved_track_explicit_pct ?? NaN,
        },
        {
            key: "recent_tracks",
            metric: lang === "de" ? "Kürzlich gehörte Songs" : "Recent songs",
            value: summary?.summary?.summary_recent_track_explicit_pct ?? NaN,
            mean: surveyMeanSummary.summary_recent_track_explicit_pct ?? NaN,
        },
        {
            key: "top_tracks",
            metric: lang === "de" ? "Top-Songs" : "Top songs",
            value: summary?.summary?.summary_top_tracks_explicit_pct ?? NaN,
            mean: surveyMeanSummary.summary_top_tracks_explicit_pct ?? NaN,
        },
    ]), [lang, summary, surveyMeanSummary]);

    const explicitChartData = useMemo(
        () => explicitData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [explicitData],
    );

    const releaseYearData = useMemo(() => {
        const binLabels = Object.keys(releaseYearBins).length
            ? Object.keys(releaseYearBins)
            : Object.keys(surveyMeanReleaseYearBins);

        return binLabels.map((label) => ({
            bin: label,
            value: releaseYearBins[label] ?? NaN,
            mean: surveyMeanReleaseYearBins[label] ?? NaN,
        }));
    }, [releaseYearBins, surveyMeanReleaseYearBins]);

    const releaseYearChartData = useMemo(
        () => releaseYearData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [releaseYearData],
    );

    const genreWordData = useMemo(() => {
        const counts = summary?.summary?.summary_genre_counts;
        if (!counts || typeof counts !== "object") {
            return [];
        }

        return Object.entries(counts)
            .map(([text, value]) => ({ text, value: Number(value) }))
            .filter((word) => Number.isFinite(word.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100);
    }, [summary]);

    const genreCloudSize = isMobileLayout
        ? { width: 340, height: 340 }
        : { width: 840, height: 420 };

    const showUsageSection = usageChartData.length > 0;
    const showMainstreamSection = mainstreamChartData.length > 0;
    const showExplicitSection = explicitChartData.length > 0;
    const showReleaseYearSection = releaseYearChartData.length > 0;
    const showGenreSection = genreWordData.length > 0;

    const score = summary?.summary?.summary_mainstream_score ?? NaN;
    const scoreMean = surveyMeanSummary.summary_mainstream_score ?? NaN;
    const explicitScore = summary?.summary?.summary_explicit_pct ?? NaN;
    const explicitScoreMean = surveyMeanSummary.summary_explicit_pct ?? NaN;
    const releaseYearScore = summary?.summary?.summary_release_year_median ?? NaN;
    const releaseYearScoreMean = surveyMeanSummary.summary_release_year_median ?? NaN;
    const mainstreamVariant = getMainstreamScoreVariant(score, lang);
    const explicitVariant = getExplicitScoreVariant(explicitScore, lang);

    const userStatsBasisText = lang === "de"
        ? `Datenbasis: ${respondentCount} Survey-Antworten.`
        : `Data basis: ${respondentCount} survey responses.`;

    const mainstreamBasisText = lang === "de"
        ? buildBasisText([
            [dataBasis.saved_track_points, "gespeicherte Lieblingssongs"],
            [dataBasis.recent_track_points, "kürzlich gehörte Songs"],
            [dataBasis.top_track_points, "Top-Songs"],
            [dataBasis.top_artist_points, "Top-Künstler"],
            [dataBasis.followed_artist_points, "gefolgte Künstler"],
        ], "Datenbasis")
        : buildBasisText([
            [dataBasis.saved_track_points, "liked songs"],
            [dataBasis.recent_track_points, "recent songs"],
            [dataBasis.top_track_points, "top songs"],
            [dataBasis.top_artist_points, "top artists"],
            [dataBasis.followed_artist_points, "followed artists"],
        ], "Data basis");

    const explicitBasisText = lang === "de"
        ? buildBasisText([
            [dataBasis.saved_track_points, "gespeicherte Lieblingssongs"],
            [dataBasis.recent_track_points, "kürzlich gehörte Songs"],
            [dataBasis.top_track_points, "Top-Songs"],
        ], "Datenbasis")
        : buildBasisText([
            [dataBasis.saved_track_points, "liked songs"],
            [dataBasis.recent_track_points, "recent songs"],
            [dataBasis.top_track_points, "top songs"],
        ], "Data basis");

    const releaseYearBasisText = lang === "de"
        ? buildBasisText([
            [dataBasis.saved_track_points, "gespeicherten Lieblingssongs"],
            [dataBasis.top_track_points, "Top-Songs"],
            [dataBasis.recent_track_points, "kürzlich gehörten Songs"],
        ], `Datenbasis: ${dataBasis.release_year_points || 0} Release-Dates aus`)
        : buildBasisText([
            [dataBasis.saved_track_points, "liked songs"],
            [dataBasis.top_track_points, "top songs"],
            [dataBasis.recent_track_points, "recent songs"],
        ], `Data basis: ${dataBasis.release_year_points || 0} release dates from`);

    const genreBasisText = lang === "de"
        ? buildBasisText([
            [dataBasis.saved_track_points, "gespeicherten Lieblingssongs"],
            [dataBasis.recent_track_points, "kürzlich gehörten Songs"],
            [dataBasis.top_track_points, "Top-Songs"],
            [dataBasis.top_artist_points, "Top-Künstlern"],
            [dataBasis.followed_artist_points, "gefolgten Künstlern"],
        ], `Datenbasis: ${dataBasis.genre_points || 0} Artist-Genre-Nennungen aus`)
        : buildBasisText([
            [dataBasis.saved_track_points, "liked songs"],
            [dataBasis.recent_track_points, "recent songs"],
            [dataBasis.top_track_points, "top songs"],
            [dataBasis.top_artist_points, "top artists"],
            [dataBasis.followed_artist_points, "followed artists"],
        ], `Data basis: ${dataBasis.genre_points || 0} artist genre mentions from`);

    return {
        colors,
        shareSurveyUrl,
        usageChartData,
        playlistDetail,
        mainstreamChartData,
        explicitChartData,
        releaseYearChartData,
        genreWordData,
        genreCloudSize,
        showUsageSection,
        showMainstreamSection,
        showExplicitSection,
        showReleaseYearSection,
        showGenreSection,
        score,
        scoreMean,
        explicitScore,
        explicitScoreMean,
        releaseYearScore,
        releaseYearScoreMean,
        mainstreamVariant,
        explicitVariant,
        userStatsBasisText,
        mainstreamBasisText,
        explicitBasisText,
        releaseYearBasisText,
        genreBasisText,
    };
}
