import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { BarChart } from "@mui/x-charts/BarChart";
import WordCloud from "react-d3-cloud";
import { Box, Button, Card, CardContent, Container, Divider, Paper, Stack, Typography, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { WhatsappShareButton, WhatsappIcon, XShareButton, XIcon } from "react-share";
import EnterEmail from "../Room/enterEmail";

const genreWordColors = [
    'var(--color-black)',
    'var(--color-tu-berlin)',
    'var(--color-tu-berlin-secondary)',
];

export default function WrappedPage() {
    const [searchParams] = useSearchParams();
    const surveyID = searchParams.get("surveyID") || "";
    const participant = searchParams.get("participant") || "";
    const lang = searchParams.get("lang") || "en";

    const wrappedQuery = useMemo(() => {
        const params = new URLSearchParams();
        if (surveyID) params.set("surveyID", surveyID);
        if (participant) params.set("participant", participant);
        if (lang) params.set("lang", lang);
        return params.toString();
    }, [surveyID, participant, lang]);

    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMobileLayout = useMediaQuery("(max-width:600px)");

    const colors = {
        primary: "var(--color-tu-berlin)",
        mean: "#c7c7c7",
        text: "var(--color-black)",
        muted: "#6f6f6f",
        border: "rgba(0, 0, 0, 0.08)",
        panel: "rgba(255, 255, 255, 0.72)",
    };

    useEffect(() => {
        let isMounted = true;

        async function loadSummary() {
            try {
                setIsLoading(true);
                const resp = await fetch(`/spotify/wrapped/summary?${wrappedQuery}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                    },
                });
                if (!resp.ok) {
                    throw new Error("Failed to load wrapped summary");
                }
                const data = await resp.json();
                if (isMounted) {
                    setSummary(data);
                }
            } catch (e) {
                if (isMounted) {
                    setSummary(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadSummary();
        return () => {
            isMounted = false;
        };
    }, [wrappedQuery]);

    const shareSurveyUrl = useMemo(() => {
        const base = summary?.end?.share_survey_url;
        if (!base) return "";
        try {
            const url = new URL(base);
            url.search = "";
            if (lang) url.searchParams.set("lang", lang);
            return url.toString();
        } catch (e) {
            const params = new URLSearchParams();
            if (lang) params.set("lang", lang);
            const qs = params.toString();
            return qs ? `${base}?${qs}` : base;
        }
    }, [summary, lang]);

    const shareTargetUrl = shareSurveyUrl || window.location.href;

    const surveyMeans = summary?.survey_means || {};
    const surveyMeanUsage = surveyMeans.usage || {};
    const surveyMeanWrapped = surveyMeans.wrapped || {};
    const surveyMeanReleaseYearBins = surveyMeans.release_year_bins || {};
    const dataBasis = summary?.data_basis || {};
    const respondentCount = surveyMeans.respondent_count || 0;
    const releaseYearBins = summary?.release_year_bins || {};

    const usageData = useMemo(() => ([
        {
            key: 'followers',
            metric: lang === 'de' ? 'Profilfollower' : 'Profile followers',
            value: summary?.usage?.followers ?? NaN,
            mean: surveyMeanUsage.followers ?? NaN,
        },
        {
            key: 'saved_tracks',
            metric: lang === 'de' ? 'Gespeicherte Tracks' : 'Saved tracks',
            value: summary?.usage?.total_saved_tracks ?? NaN,
            mean: surveyMeanUsage.total_saved_tracks ?? NaN,
        },
        {
            key: 'followed_artists',
            metric: lang === 'de' ? 'Gefolgte Artists' : 'Followed artists',
            value: summary?.usage?.total_followed_artists ?? NaN,
            mean: surveyMeanUsage.total_followed_artists ?? NaN,
        },
        {
            key: 'saved_playlists',
            metric: lang === 'de' ? 'Gespeicherte Playlists' : 'Saved playlists',
            value: summary?.usage?.total_current_playlists ?? NaN,
            mean: surveyMeanUsage.total_current_playlists ?? NaN,
        },
    ]), [lang, summary, surveyMeanUsage]);

    const usageChartData = useMemo(
        () => usageData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [usageData],
    );

    const playlistDetail = summary?.wrapped ? (
        lang === "de" ? [
            `${formatPercent(summary.wrapped.wrapped_playlists_public_pct)} öffentlich`,
            `${formatPercent(summary.wrapped.wrapped_playlists_self_owned_pct)} selbst erstellt`,
            `${formatCount(summary.wrapped.wrapped_playlists_avg_tracks, lang)} Titel im Durchschnitt`,
        ] : [
            `${formatPercent(summary.wrapped.wrapped_playlists_public_pct)} public`,
            `${formatPercent(summary.wrapped.wrapped_playlists_self_owned_pct)} created yourself`,
            `${formatCount(summary.wrapped.wrapped_playlists_avg_tracks, lang)} tracks on average`,
        ]
    ) : [];

    const mainstreamData = useMemo(() => ([
        {
            metric: lang === 'de' ? 'Gespeicherte Tracks' : 'Saved tracks',
            value: summary?.wrapped?.wrapped_saved_track_popularity_median ?? NaN,
            mean: surveyMeanWrapped.wrapped_saved_track_popularity_median ?? NaN,
        },
        {
            metric: lang === 'de' ? 'Gefolgte Artists' : 'Followed artists',
            value: summary?.wrapped?.wrapped_followed_artist_popularity_median ?? NaN,
            mean: surveyMeanWrapped.wrapped_followed_artist_popularity_median ?? NaN,
        },
        {
            metric: lang === 'de' ? 'Recent tracks' : 'Recent tracks',
            value: summary?.wrapped?.wrapped_recent_track_popularity_median ?? NaN,
            mean: surveyMeanWrapped.wrapped_recent_track_popularity_median ?? NaN,
        },
        {
            metric: lang === 'de' ? 'Top tracks' : 'Top tracks',
            value: summary?.wrapped?.wrapped_top_tracks_popularity_median ?? NaN,
            mean: surveyMeanWrapped.wrapped_top_tracks_popularity_median ?? NaN,
        },
        {
            metric: lang === 'de' ? 'Top artists' : 'Top artists',
            value: summary?.wrapped?.wrapped_mainstream_artist_popularity_median ?? NaN,
            mean: surveyMeanWrapped.wrapped_mainstream_artist_popularity_median ?? NaN,
        },
    ]), [lang, summary, surveyMeanWrapped]);

    const mainstreamChartData = useMemo(
        () => mainstreamData.filter((item) => hasMetricValue(item.value) || hasMetricValue(item.mean)),
        [mainstreamData],
    );

    const explicitData = useMemo(() => ([
        {
            key: 'saved_tracks',
            metric: lang === 'de' ? 'Gespeicherte Tracks' : 'Saved tracks',
            value: summary?.wrapped?.wrapped_saved_track_explicit_pct ?? NaN,
            mean: surveyMeanWrapped.wrapped_saved_track_explicit_pct ?? NaN,
        },
        {
            key: 'recent_tracks',
            metric: lang === 'de' ? 'Recent tracks' : 'Recent tracks',
            value: summary?.wrapped?.wrapped_recent_track_explicit_pct ?? NaN,
            mean: surveyMeanWrapped.wrapped_recent_track_explicit_pct ?? NaN,
        },
        {
            key: 'top_tracks',
            metric: lang === 'de' ? 'Top tracks' : 'Top tracks',
            value: summary?.wrapped?.wrapped_top_tracks_explicit_pct ?? NaN,
            mean: surveyMeanWrapped.wrapped_top_tracks_explicit_pct ?? NaN,
        },
    ]), [lang, summary, surveyMeanWrapped]);

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
        const counts = summary?.wrapped?.wrapped_genre_counts;
        if (!counts || typeof counts !== 'object') {
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

    const score = summary?.wrapped?.wrapped_mainstream_score ?? NaN;
    const scoreMean = surveyMeanWrapped.wrapped_mainstream_score ?? NaN;
    const explicitScore = summary?.wrapped?.wrapped_explicit_pct ?? NaN;
    const explicitScoreMean = surveyMeanWrapped.wrapped_explicit_pct ?? NaN;
    const releaseYearScore = summary?.wrapped?.wrapped_release_year_median ?? NaN;
    const releaseYearScoreMean = surveyMeanWrapped.wrapped_release_year_median ?? NaN;

    const userStatsBasisText = lang === 'de'
        ? `Datenbasis: ${respondentCount} Survey-Antworten.`
        : `Data basis: ${respondentCount} survey responses.`;

    const mainstreamBasisText = lang === 'de'
        ? `Datenbasis: ${dataBasis.saved_track_points || 0} Saved Tracks, ${dataBasis.recent_track_points || 0} Recent Tracks, ${dataBasis.top_track_points || 0} Top Tracks, ${dataBasis.top_artist_points || 0} Top Artists und ${dataBasis.followed_artist_points || 0} Gefolgte Artists.`
        : `Data basis: ${dataBasis.saved_track_points || 0} saved tracks, ${dataBasis.recent_track_points || 0} recent tracks, ${dataBasis.top_track_points || 0} top tracks, ${dataBasis.top_artist_points || 0} top artists, and ${dataBasis.followed_artist_points || 0} followed artists.`;

    const explicitBasisText = lang === 'de'
        ? `Datenbasis: ${dataBasis.saved_track_points || 0} Saved Tracks, ${dataBasis.recent_track_points || 0} Recent Tracks, ${dataBasis.top_track_points || 0} Top Tracks.`
        : `Data basis: ${dataBasis.saved_track_points || 0} saved tracks, ${dataBasis.recent_track_points || 0} recent tracks, ${dataBasis.top_track_points || 0} top tracks.`;

    const releaseYearBasisText = lang === 'de'
        ? `Datenbasis: ${dataBasis.release_year_points || 0} Release-Dates aus ${dataBasis.saved_track_points || 0} bestätigten Saved, ${dataBasis.top_track_points || 0} Top und ${dataBasis.recent_track_points || 0} Recent Tracks.`
        : `Data basis: ${dataBasis.release_year_points || 0} release dates from ${dataBasis.saved_track_points || 0} confirmed saved, ${dataBasis.top_track_points || 0} top, and ${dataBasis.recent_track_points || 0} recent tracks.`;

    const genreBasisText = lang === 'de'
        ? `Datenbasis: ${dataBasis.genre_points || 0} Genre-Nennungen aus ${dataBasis.saved_track_points || 0} gespeicherten, ${dataBasis.recent_track_points || 0} zuletzt gehörten und ${dataBasis.top_track_points || 0} top Tracks sowie ${dataBasis.top_artist_points || 0} top Artists und ${dataBasis.followed_artist_points || 0} gefolgten Artists.`
        : `Data basis: ${dataBasis.genre_points || 0} genre mentions from ${dataBasis.saved_track_points || 0} saved tracks, ${dataBasis.recent_track_points || 0} recent tracks, ${dataBasis.top_track_points || 0} top tracks, ${dataBasis.top_artist_points || 0} top artists, and ${dataBasis.followed_artist_points || 0} followed artists.`;

    async function fetchWrappedPngBlob() {
        const resp = await fetch(`/spotify/wrapped/image?${wrappedQuery}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "image/png",
            },
        });
        if (!resp.ok) {
            throw new Error("Failed to fetch wrapped image");
        }
        return resp.blob();
    }

    async function shareWrappedPng() {
        const blob = await fetchWrappedPngBlob();
        const file = new File([blob], "spotivey_wrapped.png", { type: "image/png" });

        if (
            navigator.share &&
            (!navigator.canShare || navigator.canShare({ files: [file] }))
        ) {
            await navigator.share({ files: [file] });
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spotivey_wrapped.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function downloadWrappedPng() {
        const blob = await fetchWrappedPngBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spotivey_wrapped.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const heading = lang === 'de' ? 'Wrapped' : 'Wrapped';
    const bodyText = lang === 'de'
        ? 'Was für ein Typ Musikhörer*in sind Sie?'
        : 'What kind of music listener are you?';

    return (
        <div style={{ backgroundColor: 'var(--main-bg-color)' }}>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={2} sx={{ p: 3, backgroundColor: 'var(--main-bg-color)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            component="img"
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            sx={{ height: 40, mr: 2 }}
                        />
                        <Typography variant="h5" component="h1" sx={{ color: 'var(--color-tu-berlin)' }}>
                            {heading}
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: 'var(--color-black)' }}>
                        {bodyText}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <EnterEmail surveyID={surveyID} language={lang} />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        {isLoading ? (
                            <Typography variant="body2" sx={{ color: 'var(--color-black)' }}>
                                {lang === 'de' ? 'Lade Auswertung...' : 'Loading wrapped...'}
                            </Typography>
                        ) : null}

                        {!isLoading && summary ? (
                            <Stack spacing={1.5}>
                                {shareSurveyUrl ? (
                                    <Button
                                        variant="outlined"
                                        size="medium"
                                        onClick={() => navigator.clipboard.writeText(shareSurveyUrl)}
                                        aria-label={lang === 'de' ? 'Link zur Befragung kopieren' : 'Copy link to survey'}
                                        startIcon={<ContentCopyIcon />}
                                    >
                                        {lang === 'de'
                                            ? 'Teilen Sie den Link zur Befragung, um Ihre Ergebnisse mit Freund*innen zu vergleichen!'
                                            : 'Share the survey link to compare your wrapped with your friends!'}
                                    </Button>



                                ) : null}
                                <Typography variant="body2" sx={{ color: 'var(--color-black)' }}>
                                    {lang === 'de'
                                        ? 'Teilen Sie Ihr Wrapped mit Freund*innen oder laden Sie es herunter!'
                                        : 'Share your Wrapped with your friends or download it!'}
                                </Typography>
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <XShareButton
                                        url={shareTargetUrl}
                                        openShareDialogOnClick={false}
                                        onClick={() => shareWrappedPng()}
                                        style={{
                                            border: '1px solid rgba(0, 0, 0, 0.23)',
                                            borderRadius: 999,
                                            background: 'transparent',
                                            padding: '8px 16px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                            <XIcon size={18} round />
                                            <span>X</span>
                                        </Box>
                                    </XShareButton>
                                    <WhatsappShareButton
                                        url={shareTargetUrl}
                                        openShareDialogOnClick={false}
                                        onClick={() => shareWrappedPng()}
                                        style={{
                                            border: '1px solid rgba(0, 0, 0, 0.23)',
                                            borderRadius: 999,
                                            background: 'transparent',
                                            padding: '8px 16px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                            <WhatsappIcon size={18} round />
                                            <span>WhatsApp</span>
                                        </Box>
                                    </WhatsappShareButton>
                                    <Button variant="outlined" onClick={shareWrappedPng}>
                                        TikTok
                                    </Button>
                                    <Button variant="outlined" onClick={shareWrappedPng}>
                                        Instagram
                                    </Button>
                                    <Button variant="outlined" onClick={downloadWrappedPng}>
                                        Download
                                    </Button>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {showUsageSection ? (
                                    <>
                                        <NoticeCard text={userStatsBasisText} />
                                        <SectionCard
                                            title={lang === 'de' ? 'Nutzungsstatistiken' : 'Usage Statistics'}
                                            description={lang === 'de'
                                                ? 'Ihre Profil-Daten im Vergleich zu anderen Teilnehmenden.'
                                                : 'Your profile data compared with other participants.'}
                                        >
                                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                <LegendKey color={colors.primary} label={lang === 'de' ? 'Sie' : 'You'} />
                                                <LegendKey color={colors.mean} label={lang === 'de' ? 'Mittel' : 'Mean'} />
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                                    gap: 2,
                                                }}
                                            >
                                                {usageChartData.map((item) => (
                                                    <UsageChartCard
                                                        key={item.key}
                                                        item={item}
                                                        colors={colors}
                                                        lang={lang}
                                                    />
                                                ))}
                                            </Box>
                                            <Typography variant="body2" sx={{ mt: 1.5, color: colors.text }}>
                                                {lang === 'de'
                                                    ? `Playlists: ${playlistDetail.join(' · ')}.`
                                                    : `Playlists: ${playlistDetail.join(' · ')}.`}
                                            </Typography>
                                        </SectionCard>
                                    </>
                                ) : null}

                                {showMainstreamSection ? (
                                    <>
                                        <NoticeCard text={mainstreamBasisText} />
                                        <SectionCard
                                            title={lang === 'de' ? 'Mainstreaminess' : 'Mainstreaminess'}
                                            description={lang === 'de'
                                                ? 'Populärität von Tracks und Artists im Vergleich zu anderen Teilnehmenden.'
                                                : 'Popularity of tracks and artists, each compared to other participants.'}
                                        >
                                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                <LegendKey color={colors.primary} label={lang === 'de' ? 'Sie' : 'You'} />
                                                <LegendKey color={colors.mean} label={lang === 'de' ? 'Mittel' : 'Mean'} />
                                            </Box>
                                            <BarChart
                                                dataset={mainstreamChartData}
                                                layout="horizontal"
                                                height={260}
                                                series={[
                                                    { dataKey: 'value', label: lang === 'de' ? 'Sie' : 'You', color: colors.primary },
                                                    { dataKey: 'mean', label: lang === 'de' ? 'Mittel' : 'Mean', color: colors.mean },
                                                ]}
                                                yAxis={[{ scaleType: 'band', dataKey: 'metric' }]}
                                                xAxis={[{ min: 0, max: 100 }]}
                                                margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                                                slotProps={{ legend: { hidden: true } }}
                                            />
                                            <Box sx={{ mt: 2, p: 2, borderRadius: 3, backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                                                <Typography variant="overline" sx={{ color: colors.muted }}>
                                                    {lang === 'de' ? 'Mainstreaminess Score' : 'Mainstreaminess score'}
                                                </Typography>
                                                <Typography variant="h4" component="div" sx={{ color: colors.primary, fontWeight: 700 }}>
                                                    {formatPercent(score)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.text }}>
                                                    {lang === 'de'
                                                        ? `Mittelwert der Survey-Antworten: ${formatPercent(scoreMean)}`
                                                        : `Survey mean: ${formatPercent(scoreMean)}`}
                                                </Typography>
                                            </Box>
                                        </SectionCard>
                                    </>
                                ) : null}

                                {showExplicitSection ? (
                                    <>
                                        <NoticeCard text={explicitBasisText} />
                                        <SectionCard
                                            title={lang === 'de' ? 'Explicitness' : 'Explicitness'}
                                            description={lang === 'de'
                                                ? 'Explizite Tracks aus gespeicherten, kürzlich gehörten und Top-Tracks im Vergleich zum Survey-Mittel.'
                                                : 'Explicit tracks from saved, recent, and top tracks compared with the survey mean.'}
                                        >
                                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                <LegendKey color={colors.primary} label={lang === 'de' ? 'Sie' : 'You'} />
                                                <LegendKey color={colors.mean} label={lang === 'de' ? 'Mittel' : 'Mean'} />
                                            </Box>
                                            <BarChart
                                                dataset={explicitChartData}
                                                layout="horizontal"
                                                height={260}
                                                series={[
                                                    { dataKey: 'value', label: lang === 'de' ? 'Sie' : 'You', color: colors.primary },
                                                    { dataKey: 'mean', label: lang === 'de' ? 'Mittel' : 'Mean', color: colors.mean },
                                                ]}
                                                yAxis={[{ scaleType: 'band', dataKey: 'metric' }]}
                                                xAxis={[{ min: 0, max: 100 }]}
                                                margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                                                slotProps={{ legend: { hidden: true } }}
                                            />
                                            <Box sx={{ mt: 2, p: 2, borderRadius: 3, backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                                                <Typography variant="overline" sx={{ color: colors.muted }}>
                                                    {lang === 'de' ? 'Explicitness Score' : 'Explicitness score'}
                                                </Typography>
                                                <Typography variant="h4" component="div" sx={{ color: colors.primary, fontWeight: 700 }}>
                                                    {formatPercent(explicitScore)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.text }}>
                                                    {lang === 'de'
                                                        ? `Mittelwert der Survey-Antworten: ${formatPercent(explicitScoreMean)}`
                                                        : `Survey mean: ${formatPercent(explicitScoreMean)}`}
                                                </Typography>
                                            </Box>
                                        </SectionCard>
                                    </>
                                ) : null}

                                {showReleaseYearSection ? (
                                    <>
                                        <NoticeCard
                                            text={releaseYearBasisText}
                                        />

                                        <SectionCard
                                            title={lang === 'de' ? 'Release year bins' : 'Release year bins'}
                                            description={lang === 'de'
                                                ? 'Anteil der Tracks pro Zeit-Bin im Vergleich zum Survey-Mittel.'
                                                : 'Share of tracks per time bin compared with the survey mean.'}
                                        >
                                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                <LegendKey color={colors.primary} label={lang === 'de' ? 'Sie' : 'You'} />
                                                <LegendKey color={colors.mean} label={lang === 'de' ? 'Mittel' : 'Mean'} />
                                            </Box>
                                            <BarChart
                                                dataset={releaseYearChartData}
                                                height={320}
                                                series={[
                                                    { dataKey: 'value', label: lang === 'de' ? 'Sie' : 'You', color: colors.primary },
                                                    { dataKey: 'mean', label: lang === 'de' ? 'Mittel' : 'Mean', color: colors.mean },
                                                ]}
                                                xAxis={[{ scaleType: 'band', dataKey: 'bin' }]}
                                                yAxis={[{ min: 0, max: 100 }]}
                                                margin={{ left: 50, right: 30, top: 20, bottom: 70 }}
                                                slotProps={{ legend: { hidden: true } }}
                                            />
                                            <Box sx={{ mt: 2, p: 2, borderRadius: 3, backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                                                <Typography variant="overline" sx={{ color: colors.muted }}>
                                                    {lang === 'de' ? 'Median release year' : 'Median release year'}
                                                </Typography>
                                                <Typography variant="h4" component="div" sx={{ color: colors.primary, fontWeight: 700 }}>
                                                    {formatYear(releaseYearScore)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.text }}>
                                                    {lang === 'de'
                                                        ? `Mittelwert der Survey-Antworten: ${formatYear(releaseYearScoreMean)}`
                                                        : `Survey mean: ${formatYear(releaseYearScoreMean)}`}
                                                </Typography>
                                            </Box>
                                        </SectionCard>
                                    </>
                                ) : null}

                                {showGenreSection ? (
                                    <>
                                        <NoticeCard text={genreBasisText} />
                                        <SectionCard
                                            title={lang === 'de' ? 'Ihre Spotify Genres' : 'Your Spotify Genres'}
                                            description={lang === 'de'
                                                ? 'Ihre häufigsten Genres (Top 100), Größe entspricht Häufigkeit.'
                                                : 'Your most frequent genres (Top 100), size corresponds to frequency.'}
                                        >
                                            <Box sx={{ width: '100%', minHeight: 420, overflow: 'hidden' }}>
                                                <WordCloud
                                                    key={isMobileLayout ? 'genre-cloud-mobile' : 'genre-cloud-desktop'}
                                                    data={genreWordData}
                                                    fontSize={getGenreWordFontSize(genreWordData, isMobileLayout)}
                                                    rotate={getGenreWordRotation}
                                                    fill={getGenreWordFill(genreWordData)}
                                                    spiral="rectangular"
                                                    padding={2}
                                                    fontWeight={700}
                                                    width={genreCloudSize.width}
                                                    height={genreCloudSize.height}
                                                />
                                            </Box>
                                        </SectionCard>
                                    </>
                                ) : null}
                            </Stack>
                        ) : null}
                    </Box>
                </Paper>
            </Container>
        </div>
    )
}

function SectionCard({ title, description, children }) {
    return (
        <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" component="h2" sx={{ color: 'var(--color-tu-berlin)', mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-black)', mb: 1.5 }}>
                    {description}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
}

function NoticeCard({ text }) {
    return (
        <Box sx={{ px: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#6f6f6f' }}>
                {text}
            </Typography>
        </Box>
    );
}

function LegendKey({ color, label }) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color }} />
            <Typography variant="body2" sx={{ color: 'var(--color-black)' }}>
                {label}
            </Typography>
        </Box>
    );
}

function getGenreWordRotation(word) {
    const rotations = [0, -30, 30];
    return rotations[getWordHash(word.text) % rotations.length];
}

function getGenreWordFontSize(words, isMobileLayout = false) {
    const values = words.map((word) => word.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return (word) => {
        const minSize = isMobileLayout ? 12 : 22;
        const maxSize = isMobileLayout ? 34 : 72;
        if (min === max) return (minSize + maxSize) / 2;
        const scaled = minSize + ((word.value - min) / (max - min)) * (maxSize - minSize);
        return Math.max(minSize, Math.min(maxSize, scaled));
    };
}


// make genre word colors from grey to tu color with a distint color picker based on the frequency  the word
function getGenreWordFill(words) {
    const values = words.map((word) => word.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const genreWordColors = [
        'var(--color-tu-berlin)',
        '#a34c4c',
        '#a88181',
        '#b89e9e',
        '#aaaaaa',
    ];
    return (word) => {
        const chosenColor = genreWordColors[Math.floor((Math.sqrt((words.findIndex((w) => w.text === word.text)) / words.length)) * genreWordColors.length)];
        return chosenColor;
    };
}



function getWordHash(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }
    return hash;
}

function hasMetricValue(value) {
    return value !== null && value !== undefined && !Number.isNaN(value);
}

function hasRenderableReleaseYear(bins) {
    if (!bins || typeof bins !== 'object') {
        return false;
    }

    return Object.values(bins).some((value) => hasMetricValue(value));
}

function UsageChartCard({ item, colors, lang }) {
    const xAxisMax = getUsageAxisMax(item.value, item.mean);

    return (
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: colors.text }}>
                {formatCount(item.value, lang)} {item.metric}
            </Typography>
            <BarChart
                dataset={[item]}
                layout="horizontal"
                height={160}
                series={[
                    { dataKey: 'value', label: lang === 'de' ? 'Sie' : 'You', color: colors.primary },
                    { dataKey: 'mean', label: lang === 'de' ? 'Mittel' : 'Mean', color: colors.mean },
                ]}
                yAxis={[{ scaleType: 'band', dataKey: 'metric', tickLabelStyle: { display: 'none' } }]}
                xAxis={[{ min: 0, max: xAxisMax }]}
                margin={{ left: 20, right: 20, top: 10, bottom: 20 }}
                slotProps={{ legend: { hidden: true } }}
            />
        </Box>
    );
}

function getUsageAxisMax(value, mean) {
    const values = [value, mean].filter(hasMetricValue);
    const maxValue = values.length ? Math.max(...values) : 1;
    return Math.max(1, Math.ceil(maxValue * 1.1));
}

function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'NA';
    }
    return `${Number(value).toFixed(0)}%`;
}

function formatCount(value, lang = 'en') {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'NA';
    }
    const formatted = Number(value).toFixed(0);
    // add decimal markers for thousands
    if (lang === 'de') {
        return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
        return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

function formatYear(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'NA';
    }
    return String(Math.round(Number(value)));
}