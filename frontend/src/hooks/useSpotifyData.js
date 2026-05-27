import { useContext, useEffect, useRef, useState } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import { DATA_TYPES } from "../constants/dataTypes";
import {
    fetchCurrentPlaylists,
    fetchFollowedArtists,
    fetchParticipantProfile,
    fetchRecentTracks,
    fetchSavedTracks,
    fetchTopArtistsShortTerm,
    fetchTopArtistsMediumTerm,
    fetchTopArtistsLongTerm,
    fetchTopTracksShortTerm,
    fetchTopTracksMediumTerm,
    fetchTopTracksLongTerm,
    fetchSavedShows,
    fetchSavedEpisodes
} from "../api/spotifyApi";

const EMPTY_DATA = {
    [DATA_TYPES.SAVED_TRACKS]: [],
    [DATA_TYPES.TOP_TRACKS_SHORTTERM]: [],
    [DATA_TYPES.TOP_TRACKS_MEDIUMTERM]: [],
    [DATA_TYPES.TOP_TRACKS_LONGTERM]: [],
    [DATA_TYPES.RECENT_TRACKS]: [],
    [DATA_TYPES.TOP_ARTISTS_SHORTTERM]: [],
    [DATA_TYPES.TOP_ARTISTS_MEDIUMTERM]: [],
    [DATA_TYPES.TOP_ARTISTS_LONGTERM]: [],
    [DATA_TYPES.FOLLOWED_ARTISTS]: [],
    [DATA_TYPES.CURRENT_PLAYLISTS]: [],
    [DATA_TYPES.PARTICIPANT_PROFILE]: [],
    [DATA_TYPES.SAVED_SHOWS]: [],
    [DATA_TYPES.SAVED_EPISODES]: [],
};

export function useSpotifyData(settings, isAuthenticated, welcomePageOK) {
    const { participant, roomCode, surveyID } = useContext(ParticipantContext);

    const lastFetchKeyRef = useRef(null);

    const [data, setData] = useState(EMPTY_DATA);

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

        setData(EMPTY_DATA);

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
                settings[DATA_TYPES.TOP_TRACKS_SHORTTERM]?.check &&
                settings[DATA_TYPES.TOP_TRACKS_SHORTTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_TRACKS_SHORTTERM,
                    run: () =>
                        fetchTopTracksShortTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_TRACKS_SHORTTERM].limit,
                            settings[DATA_TYPES.TOP_TRACKS_SHORTTERM].timeRange,
                            settings[DATA_TYPES.TOP_TRACKS_SHORTTERM].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_TRACKS_MEDIUMTERM]?.check &&
                settings[DATA_TYPES.TOP_TRACKS_MEDIUMTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_TRACKS_MEDIUMTERM,
                    run: () =>
                        fetchTopTracksMediumTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_TRACKS_MEDIUMTERM].limit,
                            settings[DATA_TYPES.TOP_TRACKS_MEDIUMTERM].timeRange,
                            settings[DATA_TYPES.TOP_TRACKS_MEDIUMTERM].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_TRACKS_LONGTERM]?.check &&
                settings[DATA_TYPES.TOP_TRACKS_LONGTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_TRACKS_LONGTERM,
                    run: () =>
                        fetchTopTracksLongTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_TRACKS_LONGTERM].limit,
                            settings[DATA_TYPES.TOP_TRACKS_LONGTERM].timeRange,
                            settings[DATA_TYPES.TOP_TRACKS_LONGTERM].confirmCheck
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
                settings[DATA_TYPES.TOP_ARTISTS_SHORTTERM]?.check &&
                settings[DATA_TYPES.TOP_ARTISTS_SHORTTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_ARTISTS_SHORTTERM,
                    run: () =>
                        fetchTopArtistsShortTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_ARTISTS_SHORTTERM].limit,
                            settings[DATA_TYPES.TOP_ARTISTS_SHORTTERM].timeRange,
                            settings[DATA_TYPES.TOP_ARTISTS_SHORTTERM].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM]?.check &&
                settings[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_ARTISTS_MEDIUMTERM,
                    run: () =>
                        fetchTopArtistsMediumTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM].limit,
                            settings[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM].timeRange,
                            settings[DATA_TYPES.TOP_ARTISTS_MEDIUMTERM].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.TOP_ARTISTS_LONGTERM]?.check &&
                settings[DATA_TYPES.TOP_ARTISTS_LONGTERM]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.TOP_ARTISTS_LONGTERM,
                    run: () =>
                        fetchTopArtistsLongTerm(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.TOP_ARTISTS_LONGTERM].limit,
                            settings[DATA_TYPES.TOP_ARTISTS_LONGTERM].timeRange,
                            settings[DATA_TYPES.TOP_ARTISTS_LONGTERM].confirmCheck
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
                            settings[DATA_TYPES.CURRENT_PLAYLISTS].privatetracks,
                            settings[DATA_TYPES.CURRENT_PLAYLISTS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.SAVED_SHOWS]?.check &&
                settings[DATA_TYPES.SAVED_SHOWS]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.SAVED_SHOWS,
                    run: () =>
                        fetchSavedShows(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.SAVED_SHOWS].limit,
                            settings[DATA_TYPES.SAVED_SHOWS].confirmCheck
                        ),
                });
            }

            if (
                settings[DATA_TYPES.SAVED_EPISODES]?.check &&
                settings[DATA_TYPES.SAVED_EPISODES]?.limit > 0
            ) {
                steps.push({
                    type: DATA_TYPES.SAVED_EPISODES,
                    run: () =>
                        fetchSavedEpisodes(
                            participant,
                            surveyID,
                            roomCode,
                            settings[DATA_TYPES.SAVED_EPISODES].limit,
                            settings[DATA_TYPES.SAVED_EPISODES].confirmCheck
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
                    setData((prev) => ({
                        ...prev,
                        [step.type]: Array.isArray(result)
                            ? result
                            : Array.isArray(result?.items)
                                ? result.items
                                : Array.isArray(result?.data)
                                    ? result.data
                                    : [],
                    }));
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