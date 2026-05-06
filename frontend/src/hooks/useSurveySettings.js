import { useState, useEffect, useContext } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import { fetchSurveySettingsById } from "../api/surveyApi";
import { DATA_TYPES, DATA_TYPE_ORDER } from "../constants/dataTypes";

export function useSurveySettings() {
    const { surveyID } = useContext(ParticipantContext);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rawSettings, setRawSettings] = useState(null);

    useEffect(() => {
        if (!surveyID) return;

        async function loadSettings() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchSurveySettingsById(surveyID);
                if (response.error) {
                    setError("Failed to load survey settings");
                    return;
                }

                const rawSettings = response.data[0];
                setRawSettings(rawSettings);
                const normalizedSettings = normalizeSettings(rawSettings);
                setSettings(normalizedSettings);
            } catch (err) {
                console.error("Error loading settings:", err);
                setError("Network error loading settings");
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings();
    }, [surveyID]);

    return { rawSettings, settings, isLoading, error };
}

function normalizeSettings(rawSettings) {
    const normalized = {};

    const savedTracks = rawSettings.saved_tracks ?? {};
    const profile = rawSettings.profile ?? {};
    const topTracks = rawSettings.top_tracks ?? {};
    const topArtists = rawSettings.top_artists ?? {};
    const followedArtists = rawSettings.followed_artists ?? {};
    const currentPlaylists = rawSettings.current_playlists ?? {};
    const recentlyPlayed = rawSettings.recently_played ?? {};

    normalized[DATA_TYPES.SAVED_TRACKS] = {
        check: savedTracks.check || false,
        limit: savedTracks.limit || 10,
        timeRange: savedTracks.timeRange || "",
        marketCode: savedTracks.marketCode || "DE",
        confirmCheck: savedTracks.confirmCheck || false,
    };

    normalized[DATA_TYPES.PARTICIPANT_PROFILE] = {
        check: profile.check || false,
        confirmCheck: profile.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_TRACKS] = {
        check: topTracks.check || false,
        limit: topTracks.limit || 20,
        timeRange: topTracks.timeRange || "",
        confirmCheck: topTracks.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_ARTISTS] = {
        check: topArtists.check || false,
        limit: topArtists.limit || 20,
        timeRange: topArtists.timeRange || "",
        confirmCheck: topArtists.confirmCheck || false,
    };

    normalized[DATA_TYPES.FOLLOWED_ARTISTS] = {
        check: followedArtists.check || false,
        limit: followedArtists.limit || 20,
        confirmCheck: followedArtists.confirmCheck || false,
    };

    normalized[DATA_TYPES.CURRENT_PLAYLISTS] = {
        check: currentPlaylists.check || false,
        limit: currentPlaylists.limit || 20,
        public: currentPlaylists.public ?? true,
        confirmCheck: currentPlaylists.confirmCheck || false,
    };

    normalized[DATA_TYPES.RECENT_TRACKS] = {
        check: recentlyPlayed.check || false,
        limit: recentlyPlayed.limit || 20,
        confirmCheck: recentlyPlayed.confirmCheck || false,
    };

    return normalized;
}