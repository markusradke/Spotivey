import { DATA_TYPES } from "./dataTypes";

export const UI_LABELS = {
    [DATA_TYPES.SAVED_TRACKS]: {
        en: "Saved Tracks",
        de: "Gespeicherte Titel",
        enFull: "Your saved Tracks (Liked Songs)",
        deFull: "Ihre gespeicherten Titel (Lieblingssongs)",
    },
    [DATA_TYPES.PARTICIPANT_PROFILE]: {
        en: "Your Profile",
        de: "Ihr Profil",
        enFull: "Your Spotify subscription level, the total number of followers and your country",
        deFull: "Ihr Spotify Abonnement, Ihr Herkunfsland und die Anzahl Ihrer Follower",
    },
    [DATA_TYPES.TOP_TRACKS]: {
        en: "Top Tracks",
        de: "Top Tracks",
        enFull: "Your Top Tracks",
        deFull: "Ihre Top Tracks",
    },
    [DATA_TYPES.TOP_ARTISTS]: {
        en: "Top Artists",
        de: "Top Interpreten",
        enFull: "Your Top Artists",
        deFull: "Ihre Top Interpreten",
    },
    [DATA_TYPES.FOLLOWED_ARTISTS]: {
        en: "Followed Artists",
        de: "Befolgte Künstler",
        enFull: "Your Followed Artists",
        deFull: "Die Künstler, den Sie folgen",
    },
    [DATA_TYPES.CURRENT_PLAYLISTS]: {
        en: "Current Playlists",
        de: "Aktuelle Playlists",
        enFull: "Your Playlists",
        deFull: "Ihre Playlists",
    },
    [DATA_TYPES.RECENT_TRACKS]: {
        en: "Last Tracks",
        de: "Kürzlich gehörte Musik",
        enFull: "Your last heard music",
        deFull: "Ihre kürzlich gehörte Musik",
    },
};

export function getLabel(dataType, language = "en", full = false) {
    const key = full ? `${language}Full` : language;
    return UI_LABELS[dataType]?.[key] || dataType;
}