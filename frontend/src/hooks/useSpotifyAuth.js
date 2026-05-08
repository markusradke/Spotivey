import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import {
    checkAuthentication,
    getAuthUrl,
} from "../api/spotifyApi";

export function useSpotifyAuth() {
    const { surveyID } = useContext(ParticipantContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(false);


    const isAuthenticatedRef = useRef(false);
    const authInFlightRef = useRef(false);
    const isRedirectingRef = useRef(false);

    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    const authenticateSpotify = useCallback(async () => {
        if (!surveyID) return;
        if (isAuthenticatedRef.current) return;
        if (authInFlightRef.current) return;

        isRedirectingRef.current = false;
        authInFlightRef.current = true;
        try {
            setIsAuthChecking(true);
            const data = await checkAuthentication();

            if (!data.status) {
                const authUrlData = await getAuthUrl(surveyID);
                isRedirectingRef.current = true;
                window.location.replace(authUrlData.url);
                return;
            }

            setIsAuthenticated(true);
        } catch (error) {
            console.error("Authentication check failed:", error);
        } finally {
            if (!isRedirectingRef.current) {
                authInFlightRef.current = false;
                setIsAuthChecking(false);
            }
        }
    }, [surveyID]);

    return {
        isAuthenticated,
        isAuthChecking,
        authenticateSpotify,
    };
}