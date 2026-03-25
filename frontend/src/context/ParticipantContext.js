import { createContext } from "react";

export const ParticipantContext = createContext({
    participant: null,
    roomCode: null,
    surveyID: null,
    language: null,
});