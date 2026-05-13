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
    const topTracksShortTerm = rawSettings.top_tracks_shortterm ?? {};
    const topTracksMediumTerm = rawSettings.top_tracks_mediumterm ?? {};
    const topTracksLongTerm = rawSettings.top_tracks_longterm ?? {};
    const topArtistsShortTerm = rawSettings.top_artists_shortterm ?? {};
    const topArtistsMediumTerm = rawSettings.top_artists_mediumterm ?? {};
    const topArtistsLongTerm = rawSettings.top_artists_longterm ?? {};
    const followedArtists = rawSettings.followed_artists ?? {};
    const currentPlaylists = rawSettings.current_playlists ?? {};
    const recentlyPlayed = rawSettings.recently_played ?? {};
    const savedShows = rawSettings.saved_shows ?? {};
    const savedEpisodes = rawSettings.saved_episodes ?? {};

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

    normalized[DATA_TYPES.TOP_TRACKS_SHORTTERM] = {
        check: topTracksShortTerm.check || false,
        limit: topTracksShortTerm.limit || 20,
        confirmCheck: topTracksShortTerm.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_TRACKS_MEDIUMTERM] = {
        check: topTracksMediumTerm.check || false,
        limit: topTracksMediumTerm.limit || 20,
        confirmCheck: topTracksMediumTerm.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_TRACKS_LONGTERM] = {
        check: topTracksLongTerm.check || false,
        limit: topTracksLongTerm.limit || 20,
        confirmCheck: topTracksLongTerm.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_ARTISTS_SHORTTERM] = {
        check: topArtistsShortTerm.check || false,
        limit: topArtistsShortTerm.limit || 20,
        timeRange: topArtistsShortTerm.timeRange || "",
        confirmCheck: topArtistsShortTerm.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM] = {
        check: topArtistsMediumTerm.check || false,
        limit: topArtistsMediumTerm.limit || 20,
        timeRange: topArtistsMediumTerm.timeRange || "",
        confirmCheck: topArtistsMediumTerm.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_ARTISTS_LONGTERM] = {
        check: topArtistsLongTerm.check || false,
        limit: topArtistsLongTerm.limit || 20,
        timeRange: topArtistsLongTerm.timeRange || "",
        confirmCheck: topArtistsLongTerm.confirmCheck || false,
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
        privatetracks: currentPlaylists.privatetracks ?? false,
        confirmCheck: currentPlaylists.confirmCheck || false,
    };

    normalized[DATA_TYPES.RECENT_TRACKS] = {
        check: recentlyPlayed.check || false,
        limit: recentlyPlayed.limit || 20,
        confirmCheck: recentlyPlayed.confirmCheck || false,
    };

    normalized[DATA_TYPES.SAVED_SHOWS] = {
        check: savedShows.check || false,
        limit: savedShows.limit || 10,
        confirmCheck: savedShows.confirmCheck || false,
    };

    normalized[DATA_TYPES.SAVED_EPISODES] = {
        check: savedEpisodes.check || false,
        limit: savedEpisodes.limit || 10,
        confirmCheck: savedEpisodes.confirmCheck || false,
    };

    return normalized;
}