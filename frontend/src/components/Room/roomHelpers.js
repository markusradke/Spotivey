import { DATA_TYPE_ORDER } from "../../constants/dataTypes";
import { PAGE_TITLES_BY_INDEX } from "./roomConstants";

export function mapConfirmTextToIndices(confirmTextOnlyCheck, settings) {
    const empty = Array.from({ length: 6 }, () => ["", ""]);
    if (!Array.isArray(confirmTextOnlyCheck) || !settings) {
        return empty;
    }

    let pointer = 0;
    const mapped = [...empty];
    DATA_TYPE_ORDER.forEach((type, index) => {
        if (!settings[type]?.check) {
            return;
        }

        const value = confirmTextOnlyCheck[pointer];
        if (value) {
            mapped[index] = value;
        }
        pointer += 1;
    });

    return mapped;
}

export function buildWelcomeSettings(rawSettings) {
    if (!rawSettings) {
        return { de: [], en: [] };
    }

    const de = [];
    const en = [];

    const savedTracks = rawSettings.saved_tracks;
    const profile = rawSettings.profile;
    const topTracksShortTerm = rawSettings.top_tracks_shortterm;
    const topTracksMediumTerm = rawSettings.top_tracks_mediumterm;
    const topTracksLongTerm = rawSettings.top_tracks_longterm;
    const topArtistsShortTerm = rawSettings.top_artists_shortterm;
    const topArtistsMediumTerm = rawSettings.top_artists_mediumterm;
    const topArtistsLongTerm = rawSettings.top_artists_longterm;
    const followedArtists = rawSettings.followed_artists;
    const currentPlaylists = rawSettings.current_playlists;
    const recentlyPlayed = rawSettings.recently_played;
    const savedShows = rawSettings.saved_shows;
    const savedEpisodes = rawSettings.saved_episodes;

    if (savedTracks?.check) {
        de.push([true, "Ihrer gespeicherten Musik (Lieblingssongs)"]);
        en.push([true, "Your saved Tracks (Liked Songs)"]);
    }

    if (profile?.check) {
        de.push([
            true,
            "Ihrem Spotify Abonnement, Ihrem Herkunfsland und die Anzahl Ihrer Follower",
        ]);
        en.push([
            true,
            "Your Spotify subscription level, the total number of followers and your country",
        ]);
    }

    if (topTracksShortTerm?.check) {
        de.push([true, "Ihrer Kurzfristigen Top Tracks"]);
        en.push([true, "Your Short-Term Top Tracks"]);
    }

    if (topTracksMediumTerm?.check) {
        de.push([true, "Ihrer Mittelfristigen Top Tracks"]);
        en.push([true, "Your Medium-Term Top Tracks"]);
    }

    if (topTracksLongTerm?.check) {
        de.push([true, "Ihrer Langfristigen Top Tracks"]);
        en.push([true, "Your Long-Term Top Tracks"]);
    }

    if (topArtistsShortTerm?.check) {
        de.push([true, "Ihrer Kurzfristigen Top Künstler"]);
        en.push([true, "Your Short-Term Top Artists"]);
    }

    if (topArtistsMediumTerm?.check) {
        de.push([true, "Ihrer Mittelfristigen Top Künstler"]);
        en.push([true, "Your Medium-Term Top Artists"]);
    }

    if (topArtistsLongTerm?.check) {
        de.push([true, "Ihrer Langfristigen Top Künstler"]);
        en.push([true, "Your Long-Term Top Artists"]);
    }

    if (followedArtists?.check) {
        de.push([true, "Den Interpreten, die sie abboniert haben"]);
        en.push([true, "Your Followed Artists"]);
    }

    if (currentPlaylists?.check) {
        const deText = currentPlaylists.public
            ? "Ihrer Playlists"
            : "Ihren öffentlichen Playlists";
        de.push([true, deText]);

        const enText = currentPlaylists.public
            ? "Your Playlists"
            : "Your Public Playlists";
        en.push([true, enText]);
    }

    if (recentlyPlayed?.check) {
        de.push([true, "Ihrer kürzlich gehörten Musik"]);
        en.push([true, "Your recently listened music"]);
    }

    if (savedShows?.check) {
        de.push([true, "Ihren gespeicherten Podcasts"]);
        en.push([true, "Your saved shows"]);
    }

    if (savedEpisodes?.check) {
        de.push([true, "Ihren gespeicherten Podcast-Episoden"]);
        en.push([true, "Your saved episodes"]);
    }

    return { de, en };
}

export function buildInitialCheckArray(settings) {
    if (!settings) {
        return DATA_TYPE_ORDER.map(() => []);
    }

    return DATA_TYPE_ORDER.map((type) => {
        const config = settings[type];
        if (!config?.check || !config?.confirmCheck || !(config.limit > 0)) {
            return [];
        }
        return Array(config.limit).fill(true);
    });
}

export function buildSteps(settings) {
    if (!settings) {
        return [];
    }

    return DATA_TYPE_ORDER.map((type, index) => ({ type, index }))
        .filter(({ type }) => settings[type]?.check && settings[type]?.confirmCheck)
        .filter(({ type }) => (settings[type]?.limit ?? 0) > 0)
        .map(({ index }) => ({ index, label: PAGE_TITLES_BY_INDEX[index] }));
}

export function getEndConfig(rawSettings, paramsObjectSession, language) {
    const participant = paramsObjectSession[1][1];
    if (!rawSettings || rawSettings.end_options.option === 'plain') {
        return {
            endUrl: '/end-room' + (language ? `?lang=${language}` + (rawSettings.umfrageID ? `&surveyID=${rawSettings.umfrageID}` : '') : ''),
        };
    }

    if (rawSettings.end_options.option === 'summary') {
        return {
            endUrl: '/participant-summary' + (language ? `?lang=${language}` + (rawSettings.umfrageID ? `&surveyID=${rawSettings.umfrageID}` : '') + (participant ? `&participant=${participant}` : '') : ''),
        };
    }

    if (rawSettings.end_options.option === 'conditional_end_url') {
        const mandatory_url_param = rawSettings.end_options.conditional_end_url_parameter;
        if (!paramsObjectSession?.some(([key]) => key === mandatory_url_param)) {
            if (rawSettings.end_options.conditional_end_url_option === 'summary') {
                return {
                    endUrl: '/participant-summary' + (language ? `?lang=${language}` + (rawSettings.umfrageID ? `&surveyID=${rawSettings.umfrageID}` : '') + (participant ? `&participant=${participant}` : '') : '')
                };
            }
            else {
                return {
                    endUrl: '/end-room' + (language ? `?lang=${language}` + (rawSettings.umfrageID ? `&surveyID=${rawSettings.umfrageID}` : '') : ''),
                };
            }
        }
    }


    const endUrl = rawSettings.end_options.end_url !== "" ? rawSettings.end_options.end_url : null;

    return {
        endUrl: endUrl,
        // questionTypeCheck: endUrl ? rawSettings.questionTypeCheck : null,
        // dataFieldsCheck: endUrl ? rawSettings.dataFieldsCheck : null,
        // selectedOption: endUrl ? rawSettings.selectedOption : null,
    };
}

export function partitionConfirmedRejected(items, checks) {
    const confirmed = [];
    const rejected = [];

    for (let i = 0; i < items.length; i += 1) {
        if (checks?.[i]) {
            confirmed.push(items[i]);
        } else {
            rejected.push(items[i]);
        }
    }

    return { confirmed, rejected };
}

export function buildParamsString(paramsArray) {
    const params = new URLSearchParams();
    if (Array.isArray(paramsArray)) {
        paramsArray.forEach(([key, value]) => {
            params.append(key, value);
        });
    }
    return params.toString();
}

export function navigateToScreenout(screenoutSettings, paramsString, navigate) {
    const screenoutOption = screenoutSettings?.option || 'page';

    switch (screenoutOption) {
        case 'end_url': {
            const url = screenoutSettings.screenout_url;
            window.location.href = paramsString
                ? `${url}?${paramsString}`
                : url;
            break;
        }
        case 'conditional_end_url': {
            const paramName = screenoutSettings.conditional_screenout_url_parameter;
            const paramExists = paramsString
                .split('&')
                .some((param) => param.startsWith(paramName + '='));

            if (paramExists) {
                const url = screenoutSettings.screenout_url;
                window.location.href = paramsString
                    ? `${url}?${paramsString}`
                    : url;
            } else {
                navigate(`/screenout?${paramsString}`);
            }
            break;
        }
        case 'page':
        default:
            navigate(`/screenout?${paramsString}`);
            break;
    }
}

export function calculateTotalDataItems(spotifyData) {
    if (!spotifyData) {
        return 0;
    }

    return DATA_TYPE_ORDER.reduce((total, type) => {
        const items = spotifyData[type];
        return total + (Array.isArray(items) ? items.length : 0);
    }, 0);
}

export function calculateConfirmedDataItems(spotifyData, checkArray, settings) {
    if (!spotifyData || !settings) {
        return 0;
    }

    return DATA_TYPE_ORDER.reduce((total, type, index) => {
        const typeConfig = settings[type];
        if (!typeConfig?.check) {
            return total;
        }

        const items = spotifyData[type] ?? [];
        if (items.length === 0) {
            return total;
        }

        if (!typeConfig?.confirmCheck) {
            return total + items.length;
        }

        const checks = checkArray?.[index] ?? [];
        const { confirmed } = partitionConfirmedRejected(items, checks);
        return total + confirmed.length;
    }, 0);
}
