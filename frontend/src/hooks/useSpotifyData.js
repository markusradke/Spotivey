import { useContext, useEffect, useRef, useState } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import { DATA_TYPES } from "../constants/dataTypes";
import {
    fetchCurrentPlaylists,
    fetchFollowedArtists,
    fetchParticipantProfile,
    fetchRecentTracks,
    fetchSavedTracks,
    fetchTopArtists,
    fetchTopTracks,
} from "../api/spotifyApi";

export function useSpotifyData(settings, isAuthenticated, welcomePageOK) {
    const { participant, roomCode, surveyID } = useContext(ParticipantContext);

    const lastFetchKeyRef = useRef(null);

    const [data, setData] = useState({
        [DATA_TYPES.SAVED_TRACKS]: [],
        [DATA_TYPES.TOP_TRACKS]: [],
        [DATA_TYPES.RECENT_TRACKS]: [],
        [DATA_TYPES.TOP_ARTISTS]: [],
        [DATA_TYPES.FOLLOWED_ARTISTS]: [],
        [DATA_TYPES.CURRENT_PLAYLISTS]: [],
        [DATA_TYPES.PARTICIPANT_PROFILE]: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!settings || !isAuthenticated || !welcomePageOK) return;

        const fetchKey = `${participant}|${surveyID}|${roomCode}`;
        if (lastFetchKeyRef.current === fetchKey) {
            return;
        }
        lastFetchKeyRef.current = fetchKey;

        let isCancelled = false;

        async function fetchAllData() {
            setIsLoading(true);
            const fetchPromises = [];

            if (
                settings[DATA_TYPES.SAVED_TRACKS]?.check &&
                settings[DATA_TYPES.SAVED_TRACKS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchSavedTracks(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.SAVED_TRACKS].limit,
                        settings[DATA_TYPES.SAVED_TRACKS].marketCode,
                        settings[DATA_TYPES.SAVED_TRACKS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.SAVED_TRACKS, result }))
                );
            }

            if (settings[DATA_TYPES.PARTICIPANT_PROFILE]?.check) {
                fetchPromises.push(
                    fetchParticipantProfile(participant, surveyID, roomCode).then((result) => ({
                        type: DATA_TYPES.PARTICIPANT_PROFILE,
                        result,
                    }))
                );
            }

            if (
                settings[DATA_TYPES.TOP_TRACKS]?.check &&
                settings[DATA_TYPES.TOP_TRACKS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchTopTracks(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.TOP_TRACKS].limit,
                        settings[DATA_TYPES.TOP_TRACKS].timeRange,
                        settings[DATA_TYPES.TOP_TRACKS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.TOP_TRACKS, result }))
                );
            }

            if (
                settings[DATA_TYPES.TOP_ARTISTS]?.check &&
                settings[DATA_TYPES.TOP_ARTISTS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchTopArtists(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.TOP_ARTISTS].limit,
                        settings[DATA_TYPES.TOP_ARTISTS].timeRange,
                        settings[DATA_TYPES.TOP_ARTISTS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.TOP_ARTISTS, result }))
                );
            }

            if (
                settings[DATA_TYPES.FOLLOWED_ARTISTS]?.check &&
                settings[DATA_TYPES.FOLLOWED_ARTISTS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchFollowedArtists(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.FOLLOWED_ARTISTS].limit,
                        settings[DATA_TYPES.FOLLOWED_ARTISTS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.FOLLOWED_ARTISTS, result }))
                );
            }

            if (
                settings[DATA_TYPES.CURRENT_PLAYLISTS]?.check &&
                settings[DATA_TYPES.CURRENT_PLAYLISTS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchCurrentPlaylists(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.CURRENT_PLAYLISTS].limit,
                        settings[DATA_TYPES.CURRENT_PLAYLISTS].public,
                        settings[DATA_TYPES.CURRENT_PLAYLISTS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.CURRENT_PLAYLISTS, result }))
                );
            }

            if (
                settings[DATA_TYPES.RECENT_TRACKS]?.check &&
                settings[DATA_TYPES.RECENT_TRACKS]?.limit > 0
            ) {
                fetchPromises.push(
                    fetchRecentTracks(
                        participant,
                        surveyID,
                        roomCode,
                        settings[DATA_TYPES.RECENT_TRACKS].limit,
                        settings[DATA_TYPES.RECENT_TRACKS].confirmCheck
                    ).then((result) => ({ type: DATA_TYPES.RECENT_TRACKS, result }))
                );
            }

            try {
                const results = await Promise.all(fetchPromises);
                if (isCancelled) return;

                setData((prev) => {
                    const next = { ...prev };
                    results.forEach(({ type, result }) => {
                        next[type] = result;
                    });
                    return next;
                });
            } catch (error) {
                console.error("Error fetching Spotify data:", error);
                lastFetchKeyRef.current = null;
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchAllData();

        return () => {
            isCancelled = true;
        };
    }, [settings, isAuthenticated, welcomePageOK, participant, surveyID, roomCode]);

    return { data, isLoading };
}