import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ParticipantContext } from "../../context/ParticipantContext";
import { DATA_TYPE_ORDER } from "../../constants/dataTypes";
import { finalizeParticipantData, saveCheckData, deleteParticipantData } from "../../api/surveyApi";
import { saveParticipantSummary } from "../../api/spotifyApi";

import { getCompleteEndURL } from "./followupSurvey";
import { partitionConfirmedRejected, buildParamsString, navigateToScreenout, calculateTotalDataItems, calculateConfirmedDataItems } from "./roomHelpers";

export function useRoomFinalize({
    welcomePageOK,
    isAuthenticated,
    steps,
    followup,
    paramsObjectSession,
    spotifyData,
    checkArray,
    settings,
}) {
    const navigate = useNavigate();
    const { participant, surveyID, language } = useContext(ParticipantContext);
    const [isSaving, setIsSaving] = useState(false);

    const didAutoFinalizeRef = useRef(false);

    const shouldFinalizeWithoutConfirmation = useMemo(() => {
        if (!welcomePageOK) return false;
        if (!isAuthenticated) return false;
        if (!settings) return false;
        return (steps?.length ?? 0) === 0;
    }, [welcomePageOK, isAuthenticated, settings, steps]);

    const minDataThreshold = useMemo(() => {
        const rawMinData =
            settings?.screenout_options?.screenout_min_data ??
            settings?.screenout_min_data ??
            0;
        const parsed = Number(rawMinData);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }, [settings]);

    const navigateToEndpageOrEndURL = useCallback(async () => {
        const dataAll = DATA_TYPE_ORDER.map((type) => spotifyData?.[type] ?? []);
        const url = getCompleteEndURL({
            followup,
            participant,
            paramsObjectSession,
            dataAll,
            checkArray,
        });
        navigate(url ?? `/end-room?lang=${language}&surveyID=${surveyID}`); // including fallback
    }, [followup, participant, paramsObjectSession, spotifyData, checkArray]);

    const handleSaveAndFinalize = useCallback(async () => {
        setIsSaving(true);
        try {
            const dataAll = DATA_TYPE_ORDER.map((type) => spotifyData?.[type] ?? []);

            const savePromises = dataAll.map((items, index) => {
                const confirmedConfig = settings?.[DATA_TYPE_ORDER[index]];
                if (!confirmedConfig?.confirmCheck) {
                    return null;
                }

                const checks = checkArray?.[index] ?? [];
                const { confirmed, rejected } = partitionConfirmedRejected(items, checks);
                return saveCheckData(index, participant, surveyID, confirmed, rejected);
            });

            await Promise.all(savePromises.filter(Boolean));

            const totalConfirmedItems = calculateConfirmedDataItems(
                spotifyData,
                checkArray,
                settings
            );

            if (totalConfirmedItems < minDataThreshold) {
                await deleteParticipantData();
                const paramsString = buildParamsString(paramsObjectSession);
                navigateToScreenout(settings?.screenout_options, paramsString, navigate);
                return;
            }

            await finalizeParticipantData();
            await saveParticipantSummary();
            await navigateToEndpageOrEndURL();
        } catch (error) {
            console.error("Error in confirmation process:", error);
            navigate("/error");
        } finally {
            setIsSaving(false);
        }
    }, [
        spotifyData,
        settings,
        checkArray,
        participant,
        surveyID,
        language,
        navigate,
        navigateToEndpageOrEndURL,
        paramsObjectSession,
        minDataThreshold,
    ]);

    useEffect(() => {
        if (!shouldFinalizeWithoutConfirmation) return;
        if (didAutoFinalizeRef.current) return;

        didAutoFinalizeRef.current = true;

        async function finalize() {
            try {
                const totalDataItems = calculateTotalDataItems(spotifyData);

                if (totalDataItems < minDataThreshold) {
                    await deleteParticipantData();
                    const paramsString = buildParamsString(paramsObjectSession);
                    navigateToScreenout(settings?.screenout_options, paramsString, navigate);
                    return;
                }

                await finalizeParticipantData();
                await saveParticipantSummary();
                await navigateToEndpageOrEndURL();
            } catch (error) {
                console.error("Finalize failed (no confirmation):", error);
                navigate("/error");
            }
        }

        finalize();
    }, [shouldFinalizeWithoutConfirmation, language, navigate, navigateToEndpageOrEndURL, spotifyData, settings, paramsObjectSession, minDataThreshold]);

    return { handleSaveAndFinalize, isSaving };
}
