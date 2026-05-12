import React from "react";
import { LinearProgress } from "@mui/material";
import { CircularProgress } from "@mui/material";

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
                            {language !== "de"
                                ? "Please do not refresh the page."
                                : "Bitte laden Sie die Seite nicht neu."}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}