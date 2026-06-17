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

    const additionalURLParams = paramsObjectSession?.filter(
        ([key]) => key !== "participant" && key !== "surveyID"
    ) || [];
    if (paramsObjectSession?.find(([key]) => key === "surveyID")) {
        additionalURLParams.push(["entrySurveyID", paramsObjectSession?.find(([key]) => key === "surveyID")?.[1] || ""]);
    }
    const additionalURLParamsString = additionalURLParams.length
        ? "&" + additionalURLParams.map((item) => item.join("=")).join("&")
        : "";

    // always adds partID, language, and old survey ID for LimeSurvey integration
    if (followup.endUrl.includes("?")) {
        return [followup.endUrl, "&partID=", participant, additionalURLParamsString].join("");
    }
    else {
        return [followup.endUrl, "?partID=", participant, additionalURLParamsString].join("");
    }
}
