import React from "react";
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import WordCloud from "react-d3-cloud";
import {
    ComparisonSection,
    LegendKey,
    ScoreCard,
    UsageChartCard,
} from "./WrappedShared";
import {
    formatPercent,
    formatYear,
    getGenreWordFill,
    getGenreWordFontSize,
    getGenreWordRotation,
} from "./wrappedHelpers";

export function UsageSection({ colors, lang, basisText, usageChartData, playlistDetail }) {
    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Nutzungsstatistiken" : "Usage Statistics"}
            description={lang === "de"
                ? "Ihre Profil-Daten im Vergleich zu anderen Teilnehmenden."
                : "Your profile data compared with other participants."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Mittel" : "Mean"} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {usageChartData.map((item) => (
                    <UsageChartCard key={item.key} item={item} colors={colors} lang={lang} />
                ))}
            </Box>
            {playlistDetail.length > 0 ? (
                <Typography variant="body2" sx={{ mt: 1.5, color: colors.text }}>
                    {lang === "de"
                        ? `Playlists: ${playlistDetail.join(" · ")}.`
                        : `Playlists: ${playlistDetail.join(" · ")}.`}
                </Typography>
            ) : null}
        </ComparisonSection>
    );
}

export function MainstreamSection({ colors, lang, basisText, chartData, score, scoreMean, variant }) {
    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Mainstreaminess" : "Mainstreaminess"}
            description={lang === "de"
                ? "Populärität gehörter Musik im Vergleich zu anderen Teilnehmenden."
                : "Popularity of music listened to, compared to other participants."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Mittel" : "Mean"} />
            </Box>
            <BarChart
                dataset={chartData}
                layout="horizontal"
                height={260}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Mittel" : "Mean", color: colors.mean },
                ]}
                yAxis={[{ scaleType: "band", dataKey: "metric" }]}
                xAxis={[{ min: 0, max: 100 }]}
                margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <ScoreCard
                color={colors.primary}
                label={lang === "de" ? "Mainstreaminess Score" : "Mainstreaminess score"}
                value={score}
                meanValue={scoreMean}
                lang={lang}
                formatValue={formatPercent}
                variant={variant}
            />
        </ComparisonSection>
    );
}

export function ExplicitSection({ colors, lang, basisText, chartData, score, scoreMean, variant }) {
    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Explicitness" : "Explicitness"}
            description={lang === "de"
                ? "Anteil von Tracks mit explizitem Inhalt im Vergleich zum Survey-Mittel."
                : "Share of explicit tracks compared with the survey mean."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Mittel" : "Mean"} />
            </Box>
            <BarChart
                dataset={chartData}
                layout="horizontal"
                height={260}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Mittel" : "Mean", color: colors.mean },
                ]}
                yAxis={[{ scaleType: "band", dataKey: "metric" }]}
                xAxis={[{ min: 0, max: 100 }]}
                margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <ScoreCard
                color={colors.primary}
                label={lang === "de" ? "Explicitness Score" : "Explicitness score"}
                value={score}
                meanValue={scoreMean}
                lang={lang}
                formatValue={formatPercent}
                variant={variant}
            />
        </ComparisonSection>
    );
}

export function ReleaseYearSection({ colors, lang, basisText, chartData, score, scoreMean }) {
    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Release year bins" : "Release year bins"}
            description={lang === "de"
                ? "Anteil der Tracks pro Zeit-Bin im Vergleich zum Survey-Mittel."
                : "Share of tracks per time bin compared with the survey mean."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Mittel" : "Mean"} />
            </Box>
            <BarChart
                dataset={chartData}
                height={320}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Mittel" : "Mean", color: colors.mean },
                ]}
                xAxis={[{ scaleType: "band", dataKey: "bin" }]}
                yAxis={[{ min: 0, max: 100 }]}
                margin={{ left: 50, right: 30, top: 20, bottom: 70 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <ScoreCard
                color={colors.primary}
                label={lang === "de" ? "Median release year" : "Median release year"}
                value={score}
                meanValue={scoreMean}
                lang={lang}
                formatValue={formatYear}
            />
        </ComparisonSection>
    );
}

export function GenreSection({ colors, lang, basisText, genreWordData, genreCloudSize, isMobileLayout }) {
    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Ihre Spotify Genres" : "Your Spotify Genres"}
            description={lang === "de"
                ? "Ihre häufigsten Genres (Top 100), Größe entspricht Häufigkeit."
                : "Your most frequent genres (Top 100), size corresponds to frequency."}
        >
            <Box sx={{ width: "100%", minHeight: 420, overflow: "hidden" }}>
                <WordCloud
                    key={isMobileLayout ? "genre-cloud-mobile" : "genre-cloud-desktop"}
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
        </ComparisonSection>
    );
}