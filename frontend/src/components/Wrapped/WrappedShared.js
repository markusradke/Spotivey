import React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { BarChart } from "@mui/x-charts/BarChart";
import { WhatsappShareButton, WhatsappIcon, XShareButton, XIcon } from "react-share";
import { formatCount, getUsageAxisMax } from "./wrappedHelpers";

export function WrappedShareActions({
    lang,
    shareSurveyUrl,
    shareTargetUrl,
    onSharePng,
    onDownloadPng,
}) {
    return (
        <Stack spacing={1.5}>
            {shareSurveyUrl ? (
                <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => navigator.clipboard.writeText(shareSurveyUrl)}
                    aria-label={lang === "de" ? "Link zur Befragung kopieren" : "Copy link to survey"}
                    startIcon={<ContentCopyIcon />}
                >
                    {lang === "de"
                        ? "Teilen Sie den Link zur Befragung, um Ihre Ergebnisse mit Freund*innen zu vergleichen!"
                        : "Share the survey link to compare your wrapped with your friends!"}
                </Button>
            ) : null}

            <Typography variant="body2" sx={{ color: "var(--color-black)" }}>
                {lang === "de"
                    ? "Teilen Sie Ihr Wrapped mit Freund*innen oder laden Sie es herunter!"
                    : "Share your Wrapped with your friends or download it!"}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <XShareButton
                    url={shareTargetUrl}
                    openShareDialogOnClick={false}
                    onClick={() => onSharePng()}
                    style={shareButtonStyle}
                >
                    <Box component="span" sx={shareButtonContentStyle}>
                        <XIcon size={18} round />
                        <span>X</span>
                    </Box>
                </XShareButton>
                <WhatsappShareButton
                    url={shareTargetUrl}
                    openShareDialogOnClick={false}
                    onClick={() => onSharePng()}
                    style={shareButtonStyle}
                >
                    <Box component="span" sx={shareButtonContentStyle}>
                        <WhatsappIcon size={18} round />
                        <span>WhatsApp</span>
                    </Box>
                </WhatsappShareButton>
                <Button variant="outlined" onClick={onSharePng}>
                    TikTok
                </Button>
                <Button variant="outlined" onClick={onSharePng}>
                    Instagram
                </Button>
                <Button variant="outlined" onClick={onDownloadPng}>
                    Download
                </Button>
            </Stack>
        </Stack>
    );
}

export function ComparisonSection({ title, description, noticeText, children }) {
    return (
        <>
            <NoticeCard text={noticeText} />
            <SectionCard title={title} description={description}>
                {children}
            </SectionCard>
        </>
    );
}

export function SectionCard({ title, description, children }) {
    return (
        <Card elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.08)", borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" component="h2" sx={{ color: "var(--color-tu-berlin)", mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-black)", mb: 1.5 }}>
                    {description}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
}

export function NoticeCard({ text }) {
    return (
        <Box sx={{ px: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#6f6f6f" }}>
                {text}
            </Typography>
        </Box>
    );
}

export function LegendKey({ color, label }) {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: color }} />
            <Typography variant="body2" sx={{ color: "var(--color-black)" }}>
                {label}
            </Typography>
        </Box>
    );
}

export function ScoreCard({ color, label, value, meanValue, lang, formatValue, variant }) {
    return (
        <Box sx={{ mt: 2, p: 2, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.72)", border: "1px solid rgba(0, 0, 0, 0.08)" }}>
            <Typography variant="overline" sx={{ color: "#6f6f6f" }}>
                {label}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 700 }}>
                {formatValue(value)}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-black)" }}>
                {lang === "de"
                    ? `Mittelwert der Survey-Antworten: ${formatValue(meanValue)}`
                    : `Survey mean: ${formatValue(meanValue)}`}
            </Typography>
            {variant ? <ScoreVariantBlock variant={variant} /> : null}
        </Box>
    );
}

function ScoreVariantBlock({ variant }) {
    return (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 2 }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: 2,
                    border: "1px dashed rgba(0, 0, 0, 0.28)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.68))",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <Typography variant="caption" sx={{ color: "#6f6f6f", fontWeight: 700, letterSpacing: 0.5 }}>
                    {variant.placeholderLabel || "Logo"}
                </Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ color: "var(--color-tu-berlin)", fontWeight: 700, lineHeight: 1.2 }}>
                    {variant.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-black)", mt: 0.4 }}>
                    {variant.description}
                </Typography>
            </Box>
        </Box>
    );
}

export function UsageChartCard({ item, colors, lang }) {
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
                    { dataKey: "value", label: lang === "de" ? "Sie" : "You", color: colors.primary },
                    { dataKey: "mean", label: lang === "de" ? "Mittel" : "Mean", color: colors.mean },
                ]}
                yAxis={[{ scaleType: "band", dataKey: "metric", tickLabelStyle: { display: "none" } }]}
                xAxis={[{ min: 0, max: xAxisMax }]}
                margin={{ left: 20, right: 20, top: 10, bottom: 20 }}
                slotProps={{ legend: { hidden: true } }}
            />
        </Box>
    );
}

const shareButtonStyle = {
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: 999,
    background: "transparent",
    padding: "8px 16px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
};

const shareButtonContentStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
};