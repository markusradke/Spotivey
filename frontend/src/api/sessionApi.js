const BASE_HEADERS = {
  "Content-Type": "application/json",
};

export async function getParticipantSession() {
  const response = await fetch("/api/get-participant-session");
  return response.json();
}

export async function initParticipantSession(payload) {
  return fetch("/api/init-participant-session", {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(payload),
  });
}

export async function saveEmail(payload) {
  return fetch("/api/save-participant-email", {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(payload),
  });
}

export async function checkEmailSubmitted() {
  const response = await fetch("/api/check-email-submitted");
  return response.json();
}