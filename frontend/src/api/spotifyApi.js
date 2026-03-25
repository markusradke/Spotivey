const BASE_HEADERS = {
  "Content-Type": "application/json",
};

function buildPostOptions(body) {
  return {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(body),
    credentials: "include",
  };
}

export async function checkAuthentication() {
  const response = await fetch("/spotify/is-authenticated");
  return response.json();
}

export async function getAuthUrl(surveyId) {
  const response = await fetch("/spotify/get-auth-url?surveyid=" + surveyId);
  return response.json();
}

export async function fetchParticipantProfile(participant, surveyId, roomCode) {
  const response = await fetch(
    "/spotify/users-profile",
    buildPostOptions({ participant, surveyID: surveyId, roomCode })
  );
  return response.json();
}

export async function fetchSavedTracks(participant, surveyId, roomCode, limit, marketCode, confirm) {
  const url = `/spotify/saved-tracks?limit=${limit}&market=${marketCode}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}

export async function fetchTopTracks(participant, surveyId, roomCode, limit, timeRange, confirm) {
  const url = `/spotify/top-tracks?limit=${limit}&timeRange=${timeRange}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}

export async function fetchRecentTracks(participant, surveyId, roomCode, limit, confirm) {
  const url = `/spotify/recently-played-tracks?limit=${limit}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}

export async function fetchTopArtists(participant, surveyId, roomCode, limit, timeRange, confirm) {
  const url = `/spotify/top-artists?limit=${limit}&timeRange=${timeRange}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}

export async function fetchFollowedArtists(participant, surveyId, roomCode, limit, confirm) {
  const url = `/spotify/followed-artists?limit=${limit}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}

export async function fetchCurrentPlaylists(participant, surveyId, roomCode, limit, isPublic, confirm) {
  const url = `/spotify/current-playlists?limit=${limit}&public=${isPublic}`;
  const response = await fetch(
    url,
    buildPostOptions({ participant, surveyID: surveyId, roomCode, confirm })
  );
  return response.json();
}