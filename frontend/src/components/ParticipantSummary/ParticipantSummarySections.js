import React from "react";
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import WordCloud from "react-d3-cloud";
import {
    ComparisonSection,
    LegendKey,
    ScoreCard,
    UsageChartCard,
} from "./ParticipantSummaryShared";
import {
    formatPercent,
    formatYear,
    getGenreWordFill,
    getGenreWordFontSize,
    getGenreWordRotation,
} from "./participantSummaryHelpers";

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
                <LegendKey color={colors.mean} label={lang === "de" ? "Andere Teilnehmende" : "Average Participant"} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {usageChartData.map((item) => (
                    <UsageChartCard key={item.key} item={item} colors={colors} lang={lang} />
                ))}
            </Box>
            {playlistDetail.length > 0 ? (
                <Typography variant="body2" sx={{ mt: 1.5, color: colors.text }}>
                    {lang === "de"
                        ? `Analysierte Playlists: ${playlistDetail.join(" · ")}.`
                        : `Analyzed Playlists: ${playlistDetail.join(" · ")}.`}
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
                ? "Popularität gehörter Musik im Vergleich zu anderen Teilnehmenden."
                : "Popularity of music listened to, compared to other participants."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Andere Teilnehmende" : "Average Participant"} />
            </Box>
            <BarChart
                dataset={chartData}
                layout="horizontal"
                height={260}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Andere Teilnehmende" : "Average Participant", color: colors.mean },
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
            title={lang === "de" ? "Anrüchigkeit" : "Explicitness"}
            description={lang === "de"
                ? "Anteil von Songs mit anrüchigem Inhalt im Vergleich zu anderen Teilnehmenden."
                : "Share of explicit songs compared with other participants."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Andere Teilnehmende" : "Average Participant"} />
            </Box>
            <BarChart
                dataset={chartData}
                layout="horizontal"
                height={260}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Andere Teilnehmende" : "Average Participant", color: colors.mean },
                ]}
                yAxis={[{ scaleType: "band", dataKey: "metric" }]}
                xAxis={[{ min: 0, max: 100 }]}
                margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <ScoreCard
                color={colors.primary}
                label={lang === "de" ? "Anrüchigkeit-Score" : "Explicitness score"}
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
    const xAxisLabels = lang === "de"
        ? ["vor 1950", "1950er", "1960er", "1970er", "1980er", "1990er", "2000er", "2010er", "2020er"]
        : ["before 1950s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

    const chartDataLocalized = chartData.map((d, i) => ({
        ...d,
        binLabel: xAxisLabels[i] ?? d.bin,
    }));

    return (
        <ComparisonSection
            noticeText={basisText}
            title={lang === "de" ? "Aktualität Ihres Musikgeschmacks" : "Recency of your music taste"}
            description={lang === "de"
                ? "Veröffentlichungsjahr Ihrer Musik im Vergleich zu anderen Teilnehmenden."
                : "Release year of your music compared with other participants."}
        >
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <LegendKey color={colors.primary} label={lang === "de" ? "Sie" : "You"} />
                <LegendKey color={colors.mean} label={lang === "de" ? "Andere Teilnehmende" : "Average Participant"} />
            </Box>
            <BarChart
                dataset={chartDataLocalized}
                height={320}
                series={[
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Andere Teilnehmende" : "Average Participant", color: colors.mean },
                ]}
                xAxis={[{ scaleType: "band", dataKey: "binLabel" }]}
                yAxis={[{ min: 0, max: 100 }]}
                margin={{ left: 50, right: 30, top: 20, bottom: 70 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <ScoreCard
                color={colors.primary}
                label={lang === "de" ? "Mittleres Erscheinungsjahr" : "Median release year"}
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
            title={lang === "de" ? "Ihre Lieblings-Spotify-Genres" : "Your Favorite Spotify Genres"}
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