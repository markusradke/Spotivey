import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ParticipantContext } from "../../context/ParticipantContext";
import { DATA_TYPE_ORDER } from "../../constants/dataTypes";
import { finalizeParticipantData, saveCheckData, deleteParticipantData, fetchResultList } from "../../api/surveyApi";
import { saveParticipantSummary } from "../../api/spotifyApi";

import { getCompleteEndURL } from "./followupSurvey";
import { partitionConfirmedRejected, buildParamsString, navigateToScreenout, calculateTotalDataItems, calculateConfirmedDataItems } from "./roomHelpers";

function canonicalizeValue(value) {
    if (Array.isArray(value)) {
        return value.map(canonicalizeValue);
    }

    if (value && typeof value === "object") {
        return Object.keys(value)
            .sort()
            .reduce((accumulator, key) => {
                accumulator[key] = canonicalizeValue(value[key]);
                return accumulator;
            }, {});
    }

    return value;
}

function getComparableItems(type, items, checks, settings) {
    const typeConfig = settings?.[type];
    const sourceItems = Array.isArray(items) ? items : [];

    if (!sourceItems.length) {
        return [];
    }

    if (type === "recentTracks") {
        return [];
    }

    if (!typeConfig?.confirmCheck) {
        return sourceItems;
    }

    const confirmedChecks = Array.isArray(checks) ? checks : [];
    return partitionConfirmedRejected(sourceItems, confirmedChecks).confirmed;
}

function buildParticipantSignature(spotifyData, checkArray, settings) {
    return DATA_TYPE_ORDER.reduce((signatureMap, type, index) => {
        const comparableItems = getComparableItems(
            type,
            spotifyData?.[type],
            checkArray?.[index],
            settings
        );

        if (!comparableItems.length) {
            return signatureMap;
        }

        if (type === "participantProfile") {
            const profileSignature = comparableItems
                .map((item) => JSON.stringify(canonicalizeValue(item)))
                .sort()
                .join("|");

            if (profileSignature) {
                signatureMap.set(type, profileSignature);
            }
            return signatureMap;
        }

        const idSignature = comparableItems
            .map((item) => String(item?.spotify_id ?? "").trim())
            .filter(Boolean)
            .sort()
            .join("|");

        if (idSignature) {
            signatureMap.set(type, idSignature);
        }

        return signatureMap;
    }, new Map());
}

function getStoredSignatureForRows(type, rows) {
    if (!Array.isArray(rows) || !rows.length) {
        return null;
    }

    if (type === "participantProfile") {
        const profileSignature = rows
            .map((row) => {
                const { id, no, participant, ...profileData } = row;
                return JSON.stringify(canonicalizeValue(profileData));
            })
            .sort()
            .join("|");

        return profileSignature || null;
    }

    const idSignature = rows
        .map((row) => String(row?.spotify_id ?? "").trim())
        .filter(Boolean)
        .sort()
        .join("|");

    return idSignature || null;
}

async function participantHasIdenticalSpotifyData({
    surveyID,
    participant,
    spotifyData,
    checkArray,
    settings,
}) {
    if (!settings?.screenout_options?.screenout_check_identical) {
        return false;
    }

    const currentSignature = buildParticipantSignature(spotifyData, checkArray, settings);
    if (currentSignature.size === 0) {
        return false;
    }

    const response = await fetchResultList(surveyID);
    if (!response.ok || !response.data?.dataTypes) {
        throw new Error("Failed to load survey results for duplicate check");
    }

    const currentParticipant = String(participant ?? "");
    const participantSignatures = new Map();

    response.data.dataTypes.forEach((dataType) => {
        const type = dataType?.id;
        if (!currentSignature.has(type)) {
            return;
        }

        const rows = Array.isArray(dataType?.data) ? dataType.data : [];
        const rowsByParticipant = new Map();

        rows.forEach((row) => {
            const participantId = String(row?.participant ?? "");
            if (!participantId) {
                return;
            }

            if (!rowsByParticipant.has(participantId)) {
                rowsByParticipant.set(participantId, []);
            }
            rowsByParticipant.get(participantId).push(row);
        });

        rowsByParticipant.forEach((participantRows, participantId) => {
            const signature = getStoredSignatureForRows(type, participantRows);
            if (!signature) {
                return;
            }

            if (!participantSignatures.has(participantId)) {
                participantSignatures.set(participantId, new Map());
            }

            participantSignatures.get(participantId).set(type, signature);
        });
    });

    return Array.from(participantSignatures.entries()).some(([participantId, signatures]) => {
        if (participantId === currentParticipant) {
            return false;
        }

        return Array.from(currentSignature.entries()).every(
            ([type, signature]) => signatures.get(type) === signature
        );
    });
}

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
    }, [followup, participant, paramsObjectSession, spotifyData, checkArray, navigate, language, surveyID]);

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

            if (
                await participantHasIdenticalSpotifyData({
                    surveyID,
                    participant,
                    spotifyData,
                    checkArray,
                    settings,
                })
            ) {
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
        surveyID,
        participant,
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

                if (
                    await participantHasIdenticalSpotifyData({
                        surveyID,
                        participant,
                        spotifyData,
                        checkArray,
                        settings,
                    })
                ) {
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
    }, [shouldFinalizeWithoutConfirmation, language, navigate, navigateToEndpageOrEndURL, spotifyData, settings, paramsObjectSession, minDataThreshold, surveyID, participant, checkArray]);

    return { handleSaveAndFinalize, isSaving };
}
