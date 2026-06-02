import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import EnterEmail from "../Room/enterEmail";
import { SummaryShareActions } from "./ParticipantSummaryShared";
import {
    GenreSection,
    MainstreamSection,
    ReleaseYearSection,
    ExplicitSection,
    UsageSection,
} from "./ParticipantSummarySections";
import { useSummaryData } from "./participantSummaryData";

export default function ParticipantSummaryPage() {
    const [searchParams] = useSearchParams();
    const surveyID = searchParams.get("surveyID") || "";
    const participant = searchParams.get("participant") || "";
    const lang = searchParams.get("lang") || "en";
    const isMobileLayout = useMediaQuery("(max-width:600px)");
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const summaryQuery = useMemo(() => {
        const params = new URLSearchParams();
        if (surveyID) params.set("surveyID", surveyID);
        if (participant) params.set("participant", participant);
        if (lang) params.set("lang", lang);
        return params.toString();
    }, [surveyID, participant, lang]);

    useEffect(() => {
        let isMounted = true;

        async function loadSummary() {
            try {
                setIsLoading(true);
                const resp = await fetch(`/spotify/participant/summary?${summaryQuery}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });

                if (!resp.ok) {
                    throw new Error("Failed to load participant summary");
                }

                const data = await resp.json();

                if (isMounted) {
                    setSummary(data);
                }
            } catch {
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
    }, [summaryQuery]);

    const summaryData = useSummaryData(summary, lang, isMobileLayout);
    const shareTargetUrl = window.location.href;
    const heading = "Profiler";
    const bodyText = lang === "de"
        ? "Ihr Musikprofil im Vergleich zu anderen Teilnehmenden"
        : "Your music profile compared to other participants";

    return (
        <div style={{ backgroundColor: "var(--main-bg-color)" }}>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={2} sx={{ p: 3, backgroundColor: "var(--main-bg-color)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Box
                            component="img"
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            sx={{ height: 40, mr: 2 }}
                        />
                        <Typography variant="h5" component="h1" sx={{ color: "var(--color-tu-berlin)" }}>
                            {heading}
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: "var(--color-black)" }}>
                        {bodyText}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <EnterEmail surveyID={surveyID} participant={participant} language={lang} />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        {isLoading ? (
                            <Typography variant="body2" sx={{ color: "var(--color-black)" }}>
                                {lang === "de" ? "Lade Auswertung..." : "Loading Summary..."}
                            </Typography>
                        ) : null}

                        {!isLoading && summary ? (
                            <Stack spacing={1.5}>
                                <SummaryShareActions
                                    lang={lang}
                                    shareSurveyUrl={summaryData.shareSurveyUrl}
                                    shareTargetUrl={shareTargetUrl}
                                />

                                {summaryData.showUsageSection ? (
                                    <UsageSection
                                        colors={summaryData.colors}
                                        lang={lang}
                                        basisText={summaryData.userStatsBasisText}
                                        usageChartData={summaryData.usageChartData}
                                        playlistDetail={summaryData.playlistDetail}
                                    />
                                ) : null}

                                {summaryData.showMainstreamSection ? (
                                    <MainstreamSection
                                        colors={summaryData.colors}
                                        lang={lang}
                                        basisText={summaryData.mainstreamBasisText}
                                        chartData={summaryData.mainstreamChartData}
                                        score={summaryData.score}
                                        scoreMean={summaryData.scoreMean}
                                        variant={summaryData.mainstreamVariant}
                                    />
                                ) : null}

                                {summaryData.showExplicitSection ? (
                                    <ExplicitSection
                                        colors={summaryData.colors}
                                        lang={lang}
                                        basisText={summaryData.explicitBasisText}
                                        chartData={summaryData.explicitChartData}
                                        score={summaryData.explicitScore}
                                        scoreMean={summaryData.explicitScoreMean}
                                        variant={summaryData.explicitVariant}
                                    />
                                ) : null}

                                {summaryData.showReleaseYearSection ? (
                                    <ReleaseYearSection
                                        colors={summaryData.colors}
                                        lang={lang}
                                        basisText={summaryData.releaseYearBasisText}
                                        chartData={summaryData.releaseYearChartData}
                                        score={summaryData.releaseYearScore}
                                        scoreMean={summaryData.releaseYearScoreMean}
                                    />
                                ) : null}

                                {summaryData.showGenreSection ? (
                                    <GenreSection
                                        colors={summaryData.colors}
                                        lang={lang}
                                        basisText={summaryData.genreBasisText}
                                        genreWordData={summaryData.genreWordData}
                                        genreCloudSize={summaryData.genreCloudSize}
                                        isMobileLayout={isMobileLayout}
                                    />
                                ) : null}
                                <SummaryShareActions
                                    lang={lang}
                                    shareSurveyUrl={summaryData.shareSurveyUrl}
                                    shareTargetUrl={shareTargetUrl}
                                />
                            </Stack>
                        ) : null}
                    </Box>
                </Paper>
            </Container>
        </div>
    );

}