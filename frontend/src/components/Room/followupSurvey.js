import getGetParams from "./getGetParams";
import { ID_ARTISTS, ID_NAME, ID_PLAYLISTS, ID_TRACKS } from "./roomConstants";

export function buildFollowupSurveyUrl({
    followup,
    participant,
    paramsObjectSession,
    dataAll,
    checkArray,
}) {
    if (!followup?.endUrl) {
        return null;
    }

    const paramsURL = followup.selectedOption
        ? getGetParams(
            followup.questionTypeCheck,
            followup.selectedOption,
            followup.dataFieldsCheck,
            ID_NAME,
            ID_TRACKS,
            ID_ARTISTS,
            ID_PLAYLISTS,
            dataAll,
            followup.endUrl,
            checkArray
        )
        : "";

    const allParams = paramsObjectSession?.length
        ? "&" + paramsObjectSession.map((item) => item.join("=")).join("&")
        : "";

    return !followup.passLang
        ? [followup.endUrl, paramsURL, "&partID=", participant].join("")
        : [followup.endUrl, paramsURL, "&partID=", participant, allParams].join("");
}
