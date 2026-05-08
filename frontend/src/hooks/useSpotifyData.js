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

    const [progress, setProgress] = useState({
        percent: 0,
        currentType: null,
        completedSteps: 0,
        totalSteps: 0,
    });

    useEffect(() => {
        if (!settings || !isAuthenticated || !welcomePageOK) return;

        const fetchKey = `${participant}|${surveyID}|${roomCode}`;
        if (lastFetchKeyRef.current === fetchKey) {
            return;
        }
        lastFetchKeyRef.current = fetchKey;

        let isCancelled = false;

        async function fetchAllData() {
            const steps = [];

            if (settings[DATA_TYPES.PARTICIPANT_PROFILE]?.check) {
                steps.push({
                    type: DATA_TYPES.PARTICIPANT_PROFILE,
                    run: () => fetchParticipantProfile(participant, surveyID, roomCode),
                });
            }

            if (
                settings[DATA_TYPES.SAVED_TRACKS]?.check &&
                settings[DATA_TYPES.SAVED_TRACKS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.SAVED_TRACKS,
                    run: () =>
                        fetchSavedTracks(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.SAVED_TRACKS].limit,
                            settings[DATA_TYPES.SAVED_TRACKS].marketCode,
                            settings[DATA_TYPES.SAVED_TRACKS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_TRACKS]?.check &&
                settings[DATA_TYPES.TOP_TRACKS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_TRACKS,
                    run: () =>
                        fetchTopTracks(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_TRACKS].limit,
                            settings[DATA_TYPES.TOP_TRACKS].timeRange,
                            settings[DATA_TYPES.TOP_TRACKS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.RECENT_TRACKS]?.check &&
                settings[DATA_TYPES.RECENT_TRACKS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.RECENT_TRACKS,
                    run: () =>
                        fetchRecentTracks(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.RECENT_TRACKS].limit,
                            settings[DATA_TYPES.RECENT_TRACKS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_ARTISTS]?.check &&
                settings[DATA_TYPES.TOP_ARTISTS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_ARTISTS,
                    run: () =>
                        fetchTopArtists(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_ARTISTS].limit,
                            settings[DATA_TYPES.TOP_ARTISTS].timeRange,
                            settings[DATA_TYPES.TOP_ARTISTS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.FOLLOWED_ARTISTS]?.check &&
                settings[DATA_TYPES.FOLLOWED_ARTISTS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.FOLLOWED_ARTISTS,
                    run: () =>
                        fetchFollowedArtists(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.FOLLOWED_ARTISTS].limit,
                            settings[DATA_TYPES.FOLLOWED_ARTISTS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.CURRENT_PLAYLISTS]?.check &&
                settings[DATA_TYPES.CURRENT_PLAYLISTS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.CURRENT_PLAYLISTS,
                    run: () =>
                        fetchCurrentPlaylists(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.CURRENT_PLAYLISTS].limit,
                            settings[DATA_TYPES.CURRENT_PLAYLISTS].public,
                            settings[DATA_TYPES.CURRENT_PLAYLISTS].confirmCheck
                        ),
                });
            }

            const totalSteps = steps.length + 1; // for the authentication step

            if (totalSteps === 1) {
                return;
            }

            setIsLoading(true);
            setProgress({
                percent: (1 / totalSteps) * 100,
                currentType: steps[0].type,
                completedSteps: 1,
                totalSteps,
            });

            try {
                for (let i = 1; i < totalSteps; i += 1) {
                    if (isCancelled) return;

                    const step = steps[i - 1];
                    const percent = (i / totalSteps) * 100;

                    setProgress({
                        percent,
                        currentType: step.type,
                        completedSteps: i,
                        totalSteps,
                    });

                    const result = await step.run();
                    if (isCancelled) return;

                    setData((prev) => ({ ...prev, [step.type]: result }));
                }

                if (!isCancelled) {
                    setProgress({
                        percent: 100,
                        currentType: null,
                        completedSteps: totalSteps,
                        totalSteps,
                    });
                }
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

    return { data, isLoading, progress };
}