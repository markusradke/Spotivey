import React from "react";
import { LinearProgress } from "@mui/material";
import { CircularProgress } from "@mui/material";
import { Box } from "@mui/material";
import { Typography } from "@mui/material";

function getLoadingText({ language, currentType, isAuthChecking }) {
    if (isAuthChecking || !currentType) {
        return language !== "de"
            ? "Preparing Spotify connection..."
            : "Spotify-Verbindung wird vorbereitet...";
    }

    const en = {
        savedTracks: "Retrieving saved tracks...",
        recentTracks: "Retrieving recently played tracks...",
        topTracksShortTerm: "Retrieving short-term top tracks...",
        topTracksMediumTerm: "Retrieving medium-term top tracks...",
        topTracksLongTerm: "Retrieving long-term top tracks...",
        topArtistsShortTerm: "Retrieving short-term top artists...",
        topArtistsMediumTerm: "Retrieving medium-term top artists...",
        topArtistsLongTerm: "Retrieving long-term top artists...",
        followedArtists: "Retrieving followed artists...",
        currentPlaylists: "Retrieving current playlists...",
        participantProfile: "Retrieving participant profile...",
        savedShows: "Retrieving saved shows...",
        savedEpisodes: "Retrieving saved episodes...",
    };

    const de = {
        savedTracks: "Gespeicherte Tracks werden abgerufen...",
        recentTracks: "Kürzlich gespielte Tracks werden abgerufen...",
        topTracksShortTerm: "Kurzfristige Top-Tracks werden abgerufen...",
        topTracksMediumTerm: "Mittelfristige Top-Tracks werden abgerufen...",
        topTracksLongTerm: "Langfristige Top-Tracks werden abgerufen...",
        topArtistsShortTerm: "Kurzfristige Top-Künstler werden abgerufen...",
        topArtistsMediumTerm: "Mittelfristige Top-Künstler werden abgerufen...",
        topArtistsLongTerm: "Langfristige Top-Künstler werden abgerufen...",
        followedArtists: "Gefolgte Künstler werden abgerufen...",
        currentPlaylists: "Playlists werden abgerufen...",
        participantProfile: "Profil wird abgerufen...",
        savedShows: "Gespeicherte Podcasts werden abgerufen...",
        savedEpisodes: "Gespeicherte Episoden werden abgerufen...",
    };

    return (language !== "de" ? en : de)[currentType] ?? "";
}

export default function LinearRetrievalProgress({ language, progress, isAuthChecking }) {
    const percent = Math.round(progress?.percent ?? 0);
    const text = getLoadingText({
        language,
        currentType: progress?.currentType ?? null,
        isAuthChecking,
    });

    return (
        <div className="loading-container">
            <div className="loading-item">
                <div className="loading-inner" style={{ width: "85vw", maxWidth: 560, gap: 16 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            component="img"
                            src="../../../static/images/SpotiveyLogo2_Schrift.svg"
                            alt="Spotivey"
                            sx={{ height: 40, mr: 2 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h4" sx={{ color: 'var(--color-tu-berlin)' }} className="blink">
                            {language === "de" ?
                                "Bitte laden Sie die Seite nicht neu, schließen Sie das Fenster nicht und drücken Sie nicht den Zurück-Button Ihres Browsers!" :
                                "Please do not refresh the page, do not close the window, and do not press the back button of your browser!"}
                        </Typography>
                    </Box>
                    <CircularProgress style={{ margin: "auto" }} />
                    <LinearProgress variant="determinate" value={percent} sx={{ width: "100%", height: 10, borderRadius: 999 }} />
                    <div style={{ paddingTop: "24px", textAlign: "center" }}>
                        <div className="endPage-Stepper-body">{percent}%</div>
                        <div
                            className="endPage-Stepper-body"
                            style={{ paddingTop: "12px" }}
                        >
                            {text}
                            <br />
                        </div>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {language === "de" ?
                                "Je nach Anzahl der Tracks und Künstler in Ihrem Spotify Profil kann dies wenige Minuten dauern." :
                                "Depending on the number of tracks and artists in your Spotify profile, this may take a few minutes."}
                        </Typography>
                    </div>
                </div>
            </div>
        </div >
    );
}