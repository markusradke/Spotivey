import getGetParams from "./getGetParams";
import { ID_ARTISTS, ID_NAME, ID_PLAYLISTS, ID_TRACKS } from "./roomConstants";

export function getCompleteEndURL({
    followup,
    participant,
    paramsObjectSession,
    dataAll,
    checkArray,
}) {
    if (!followup?.endUrl) {
        return null;
    }
    if ("/end-room" === followup.endUrl.substring(0, 9) || "/participant-summary" === followup.endUrl.substring(0, 20)) {
        return followup.endUrl
    }

    // TODO: Get all the data for follow up survey
    // const paramsURL = followup.selectedOption
    //     ? getGetParams(
    //         followup.questionTypeCheck,
    //         followup.selectedOption,
    //         followup.dataFieldsCheck,
    //         ID_NAME,
    //         ID_TRACKS,
    //         ID_ARTISTS,
    //         ID_PLAYLISTS,
    //         dataAll,
    //         followup.endUrl,
    //         checkArray
    //     )
    //     : "";

    const additionalURLParams = paramsObjectSession?.filter(
        ([key]) => key !== "participant" && key !== "surveyID"
    ) || [];
    const additionalURLParamsString = additionalURLParams.length
        ? "&" + additionalURLParams.map((item) => item.join("=")).join("&")
        : "";

    // always adds partID and language for LimeSurvey integration
    return [followup.endUrl, "?partID=", participant, additionalURLParamsString].join("");
}
