import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import EnterEmail from "../Room/enterEmail";
import { WrappedShareActions } from "./WrappedShared";
import {
    GenreSection,
    MainstreamSection,
    ReleaseYearSection,
    ExplicitSection,
    UsageSection,
} from "./WrappedSections";
import { useWrappedData } from "./wrappedData";

export default function WrappedPage() {
    const [searchParams] = useSearchParams();
    const surveyID = searchParams.get("surveyID") || "";
    const participant = searchParams.get("participant") || "";
    const lang = searchParams.get("lang") || "en";
    const isMobileLayout = useMediaQuery("(max-width:600px)");
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const wrappedQuery = useMemo(() => {
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
                const resp = await fetch(`/spotify/wrapped/summary?${wrappedQuery}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });

                if (!resp.ok) {
                    throw new Error("Failed to load wrapped summary");
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
    }, [wrappedQuery]);

    const wrappedData = useWrappedData(summary, lang, isMobileLayout);
    const shareTargetUrl = wrappedData.shareSurveyUrl || window.location.href;
    const heading = "Wrapped";
    const bodyText = lang === "de"
        ? "Was für ein Typ Musikhörer*in sind Sie?"
        : "What kind of music listener are you?";

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
                        <EnterEmail surveyID={surveyID} language={lang} />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        {isLoading ? (
                            <Typography variant="body2" sx={{ color: "var(--color-black)" }}>
                                {lang === "de" ? "Lade Auswertung..." : "Loading wrapped..."}
                            </Typography>
                        ) : null}

                        {!isLoading && summary ? (
                            <Stack spacing={1.5}>
                                <WrappedShareActions
                                    lang={lang}
                                    shareSurveyUrl={wrappedData.shareSurveyUrl}
                                    shareTargetUrl={shareTargetUrl}
                                    onSharePng={shareWrappedPng}
                                    onDownloadPng={downloadWrappedPng}
                                />

                                {wrappedData.showUsageSection ? (
                                    <UsageSection
                                        colors={wrappedData.colors}
                                        lang={lang}
                                        basisText={wrappedData.userStatsBasisText}
                                        usageChartData={wrappedData.usageChartData}
                                        playlistDetail={wrappedData.playlistDetail}
                                    />
                                ) : null}

                                {wrappedData.showMainstreamSection ? (
                                    <MainstreamSection
                                        colors={wrappedData.colors}
                                        lang={lang}
                                        basisText={wrappedData.mainstreamBasisText}
                                        chartData={wrappedData.mainstreamChartData}
                                        score={wrappedData.score}
                                        scoreMean={wrappedData.scoreMean}
                                        variant={wrappedData.mainstreamVariant}
                                    />
                                ) : null}

                                {wrappedData.showExplicitSection ? (
                                    <ExplicitSection
                                        colors={wrappedData.colors}
                                        lang={lang}
                                        basisText={wrappedData.explicitBasisText}
                                        chartData={wrappedData.explicitChartData}
                                        score={wrappedData.explicitScore}
                                        scoreMean={wrappedData.explicitScoreMean}
                                        variant={wrappedData.explicitVariant}
                                    />
                                ) : null}

                                {wrappedData.showReleaseYearSection ? (
                                    <ReleaseYearSection
                                        colors={wrappedData.colors}
                                        lang={lang}
                                        basisText={wrappedData.releaseYearBasisText}
                                        chartData={wrappedData.releaseYearChartData}
                                        score={wrappedData.releaseYearScore}
                                        scoreMean={wrappedData.releaseYearScoreMean}
                                    />
                                ) : null}

                                {wrappedData.showGenreSection ? (
                                    <GenreSection
                                        colors={wrappedData.colors}
                                        lang={lang}
                                        basisText={wrappedData.genreBasisText}
                                        genreWordData={wrappedData.genreWordData}
                                        genreCloudSize={wrappedData.genreCloudSize}
                                        isMobileLayout={isMobileLayout}
                                    />
                                ) : null}
                            </Stack>
                        ) : null}
                    </Box>
                </Paper>
            </Container>
        </div>
    );

    async function fetchWrappedPngBlob() {
        const resp = await fetch(`/spotify/wrapped/image?${wrappedQuery}`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "image/png" },
        });

        if (!resp.ok) {
            throw new Error("Failed to fetch wrapped image");
        }

        return resp.blob();
    }

    async function shareWrappedPng() {
        const blob = await fetchWrappedPngBlob();
        const file = new File([blob], "spotivey_wrapped.png", { type: "image/png" });

        if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
            await navigator.share({ files: [file] });
            return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "spotivey_wrapped.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    async function downloadWrappedPng() {
        const blob = await fetchWrappedPngBlob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "spotivey_wrapped.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }
}