import { useState, useEffect, useContext } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import {
    checkAuthentication,
    getAuthUrl,
} from "../api/spotifyApi";

export function useSpotifyAuth() {
    const { surveyID } = useContext(ParticipantContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(false);

    async function authenticateSpotify() {
        try {
            setIsAuthChecking(true);
            const data = await checkAuthentication();

            if (!data.status) {
                const authUrlData = await getAuthUrl(surveyID);
                window.location.replace(authUrlData.url);
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
        } finally {
            setIsAuthChecking(false);
        }
    }

    return {
        isAuthenticated,
        isAuthChecking,
        authenticateSpotify,
    };
}