import { useState, useEffect, useContext } from "react";
import { ParticipantContext } from "../context/ParticipantContext";
import { fetchSurveySettingsById } from "../api/surveyApi";
import { DATA_TYPES, DATA_TYPE_ORDER } from "../constants/dataTypes";

export function useSurveySettings() {
    const { surveyID } = useContext(ParticipantContext);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    return { settings, isLoading, error };
}

function normalizeSettings(rawSettings) {
    const normalized = {};

    normalized[DATA_TYPES.SAVED_TRACKS] = {
        check: rawSettings.text1?.check || false,
        limit: rawSettings.text1?.limit || 10,
        timeRange: rawSettings.text1?.timeRange || "",
        marketCode: rawSettings.text1?.marketCode || "",
        confirmCheck: rawSettings.text1?.confirmCheck || false,
    };

    normalized[DATA_TYPES.PARTICIPANT_PROFILE] = {
        check: rawSettings.text2?.check || false,
        confirmCheck: rawSettings.text2?.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_TRACKS] = {
        check: rawSettings.text3?.check || false,
        limit: rawSettings.text3?.limit || 20,
        timeRange: rawSettings.text3?.timeRange || "",
        confirmCheck: rawSettings.text3?.confirmCheck || false,
    };

    normalized[DATA_TYPES.TOP_ARTISTS] = {
        check: rawSettings.text4?.check || false,
        limit: rawSettings.text4?.limit || 20,
        confirmCheck: rawSettings.text4?.confirmCheck || false,
    };

    normalized[DATA_TYPES.FOLLOWED_ARTISTS] = {
        check: rawSettings.text5?.check || false,
        limit: rawSettings.text5?.limit || 20,
        confirmCheck: rawSettings.text5?.confirmCheck || false,
    };

    normalized[DATA_TYPES.CURRENT_PLAYLISTS] = {
        check: rawSettings.text6?.check || false,
        limit: rawSettings.text6?.limit || 20,
        public: rawSettings.text6?.public || true,
        confirmCheck: rawSettings.text6?.confirmCheck || false,
    };

    normalized[DATA_TYPES.RECENT_TRACKS] = {
        check: rawSettings.text7?.check || false,
        limit: rawSettings.text7?.limit || 20,
        confirmCheck: rawSettings.text7?.confirmCheck || false,
    };

    return normalized;
}