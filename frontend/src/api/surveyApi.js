const BASE_HEADERS = { "Content-Type": "application/json" };

function buildPostOptions(body, includeCredentials = false) {
  const options = {
    method: "POST",
    headers: BASE_HEADERS,
  };
  if (body !== undefined) {
    options.body = JON.stringify(body);
  }
  if (includeCredentials) {
    options.credentials = "include";
  }
  return options;
}

export async function fetchSurveySettingsById(surveyId) {
  const response = await fetch("/api/get-settingsfromid?surveyid=" + surveyId);
  return response.json();
}

export async function saveCheckData(index, participant, surveyId, checkData, noData) {
  const response = await fetch(
    "/api/save-check-data",
    buildPostOptions({
      index,
      participant,
      surveyID: surveyId,
      checkData,
      noData,
    })
  );
  return response;
}

export async function finalizeParticipantData() {
  const response = await fetch(
    "/api/finalize-participant-data",
    buildPostOptions(undefined, true)
  );
  return response.json();
}