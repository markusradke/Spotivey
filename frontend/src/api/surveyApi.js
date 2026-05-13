const BASE_HEADERS = { "Content-Type": "application/json" };

function buildPostOptions(body, includeCredentials = false) {
  const options = {
    method: "POST",
    headers: BASE_HEADERS,
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  if (includeCredentials) {
    options.credentials = "include";
  }
  return options;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_e) {
    return null;
  }
}

async function getJson(url, includeCredentials = false) {
  const options = {};
  if (includeCredentials) {
    options.credentials = "include";
  }
  const response = await fetch(url, options);
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function fetchSurveySettingsById(surveyId) {
  const response = await fetch("/api/get-settingsfromid?surveyid=" + surveyId);
  return response.json();
}

export async function fetchSettingsSecondSurvey(username) {
  return getJson(
    "/api/get-settings-second-survey?username=" +
    encodeURIComponent(username)
  );
}

export async function createSettingsSecondSurvey(payload) {
  const response = await fetch(
    "/api/create-settings-second-survey",
    buildPostOptions(payload)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function updateSettingsSecondSurvey(payload) {
  const response = await fetch(
    "/api/update-settings-second-survey",
    buildPostOptions(payload)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function updateSettingsSecondSurveyEndUrl(payload) {
  const response = await fetch(
    "/api/update-settings-second-survey-end-url",
    buildPostOptions(payload)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function deleteSettingsSecondSurvey(surveyId) {
  const response = await fetch(
    "/api/delete-settings-second-survey?surveyid=" +
    encodeURIComponent(surveyId)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function fetchUserSession() {
  return getJson("/api/get-user-session", true);
}

export async function fetchSettingsList(username) {
  return getJson("/api/get-settingslist?username=" + encodeURIComponent(username));
}

export async function fetchParticipantCount(surveyId) {
  return getJson(
    "/api/get-participant-count?surveyID=" + encodeURIComponent(surveyId)
  );
}

export async function deleteSettings(surveyId) {
  const response = await fetch(
    "/api/delete-settings?surveyid=" + encodeURIComponent(surveyId)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
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

export async function fetchResultList(surveyId) {
  return getJson(
    "/api/get-resultlist?surveyid=" + encodeURIComponent(surveyId)
  );
}

export async function deleteOnlyResults(surveyId) {
  const response = await fetch(
    "/api/delete-only-results?surveyid=" + encodeURIComponent(surveyId)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function saveRepertoireToCsvFile(surveyId) {
  return getJson(
    "/api/save-repertoire-to-csv-file?surveyID=" + encodeURIComponent(surveyId)
  );
}

export async function saveParticipantsToCsvFile(surveyId) {
  return getJson(
    "/api/save-participants-to-csv-file?surveyID=" + encodeURIComponent(surveyId)
  );
}

export async function acceptPrivacyPolicy(payload) {
  const response = await fetch(
    "/api/accept-privacy-policy",
    buildPostOptions(payload, true)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function loginSettingsUser(payload) {
  const response = await fetch(
    "/api/login-settings-user",
    buildPostOptions(payload, true)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function createSettingsUser(payload) {
  console.log("Creating settings user with payload:", payload);
  const response = await fetch(
    "/api/create-settings-user",
    buildPostOptions(payload)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function fetchParticipantSession() {
  return getJson("/api/get-participant-session", true);
}

export async function updateConfirmText(payload) {
  const response = await fetch(
    "/api/update-confirm-text",
    buildPostOptions(payload)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function logoutUser() {
  const response = await fetch(
    "/api/logout-user",
    buildPostOptions(undefined, true)
  );
  return { ok: response.ok, status: response.status, data: await safeJson(response) };
}

export async function checkSurveyId(surveyId) {
  return getJson(
    "/api/check-survey-id?surveyID=" + encodeURIComponent(surveyId)
  );
}

export async function createRetrievalSettings(payload) {
  const response = await fetch(
    "/api/create-settings",
    buildPostOptions(payload)
  );

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function updateRetrievalSettings(payload) {
  const response = await fetch(
    "/api/update-settings",
    buildPostOptions(payload)
  );

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}