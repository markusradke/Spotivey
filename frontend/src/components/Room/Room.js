import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ParticipantContext } from "../../context/ParticipantContext";
import { DATA_TYPE_ORDER } from "../../constants/dataTypes";

import { useSurveySettings } from "../../hooks/useSurveySettings";
import { useSpotifyAuth } from "../../hooks/useSpotifyAuth";
import { useSpotifyData } from "../../hooks/useSpotifyData";

import WelcomePage from "./WelcomePage";
import ConfirmStepper from "./ConfirmStepper";
import LinearRetrievalProgress from "./LinearRetrievalProgress";
import RoomHeader from "./RoomHeader";
import RoomStepContent from "./RoomStepContent";
import { useRoomFinalize } from "./useRoomFinalize";
import CircularSaving from "./CircularSaving";
import {
    getEndConfig,
    buildInitialCheckArray,
    buildSteps,
    buildWelcomeSettings,
    mapConfirmTextToIndices,
} from "./roomHelpers";

export default function Room(props) {
    const navigate = useNavigate();
    const { participant, language } = useContext(ParticipantContext);

    const {
        rawSettings,
        settings,
        isLoading: isSettingsLoading,
        error: settingsError,
    } = useSurveySettings();

    const { isAuthenticated, isAuthChecking, authenticateSpotify } = useSpotifyAuth();

    const { data: spotifyData, isLoading: isSpotifyLoading, progress } = useSpotifyData(
        settings,
        isAuthenticated,
        props.welcomePageOK
    );

    const [checkArray, setCheckArray] = useState(DATA_TYPE_ORDER.map(() => []));
    const [confirmTextArray, setConfirmTextArray] = useState(
        Array.from({ length: 6 }, () => ["", ""])
    );

    const [followup, setFollowup] = useState({
        endUrl: null,
        questionTypeCheck: null,
        dataFieldsCheck: null,
        selectedOption: null,
        passLang: false,
    });

    const welcomeSettings = useMemo(
        () => buildWelcomeSettings(rawSettings),
        [rawSettings]
    );

    const steps = useMemo(() => buildSteps(settings), [settings]);
    const [isShowingPrivacy, setIsShowingPrivacy] = useState(false);



    useEffect(() => {
        if (!props.welcomePageOK) return;
        if (isAuthChecking || isSpotifyLoading) {
            setIsShowingPrivacy(false);
        }
    }, [props.welcomePageOK, isAuthChecking, isSpotifyLoading]);

    useEffect(() => {
        if (props.welcomePageOK && participant) {
            authenticateSpotify();
        }
    }, [props.welcomePageOK, participant, authenticateSpotify]);

    useEffect(() => {
        if (!rawSettings) return;

        setConfirmTextArray(
            mapConfirmTextToIndices(rawSettings.confirmTextOnlyCheck, settings)
        );

        setFollowup(getEndConfig(rawSettings, props.paramsObjectSession, language));
    }, [rawSettings, settings, props.paramsObjectSession, language]);

    useEffect(() => {
        if (!settings) return;
        setCheckArray(buildInitialCheckArray(settings));
    }, [settings]);

    const { handleSaveAndFinalize, isSaving } = useRoomFinalize({
        welcomePageOK: props.welcomePageOK,
        isAuthenticated,
        steps,
        followup,
        paramsObjectSession: props.paramsObjectSession,
        spotifyData,
        checkArray,
        settings,
    });

    function handleToggleAllCurrentStep(step, checked) {
        if (!step) return;

        const index = step.index;

        setCheckArray((prev) => {
            const next = [...prev];
            const current = prev?.[index] ?? [];
            next[index] = Array(current.length).fill(checked);
            return next;
        });
    }


    const renderStepContent = (step) => (
        <RoomStepContent
            step={step}
            language={language}
            spotifyData={spotifyData}
            settings={settings}
            checkArray={checkArray}
            setCheckArray={setCheckArray}
        />
    );

    if (settingsError) {
        navigate("/error");
        return null;
    }

    const isLoading = isShowingPrivacy || isSettingsLoading || isAuthChecking || isSpotifyLoading;

    return (
        <React.Fragment>
            <RoomHeader />

            <div className="room-page-main">
                {!props.welcomePageOK ? (
                    <WelcomePage
                        setWelcomePageOK={props.setWelcomePageOK}
                        welcomeSettingsDeutschArray={welcomeSettings.de}
                        welcomeSettingsEnglishArray={welcomeSettings.en}
                        surveyID={props.surveyID}
                        participantID={props.participant}
                        language={language}
                        paramsObjectSession={props.paramsObjectSession}
                        settings={settings}
                        onAcceptStart={() => setIsShowingPrivacy(true)}
                        onAcceptError={() => setIsShowingPrivacy(false)}
                    />
                ) : (
                    <React.Fragment>
                        {isLoading ? (
                            <LinearRetrievalProgress language={language} progress={progress} />
                        ) : (
                            <div className="room-content-main">
                                <div className="render-result-container-outer">
                                    <div className="render-result-result-container-inner">
                                        <ConfirmStepper
                                            steps={steps}
                                            language={language}
                                            confirmTextArray={confirmTextArray}
                                            renderStepContent={renderStepContent}
                                            onFinish={handleSaveAndFinalize}
                                            onToggleAllCurrentStep={handleToggleAllCurrentStep}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                )}
            </div>
            {isSaving && (
                <CircularSaving language={language} />
            )}
        </React.Fragment>
    );
}
