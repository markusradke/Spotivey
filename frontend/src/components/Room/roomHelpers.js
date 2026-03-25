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

    if (rawSettings.text1?.check) {
        de.push([true, "Ihrer gespeicherten Musik (Lieblingssongs)"]);
        en.push([true, "Your saved Tracks (Liked Songs)"]);
    }

    if (rawSettings.text2?.check) {
        de.push([
            true,
            "Ihrem Spotify Abonnement, Ihrem Herkunfsland und die Anzahl Ihrer Follower",
        ]);
        en.push([
            true,
            "Your Spotify subscription level, the total number of followers and your country",
        ]);
    }

    if (rawSettings.text3?.check) {
        de.push([true, "Ihrer Top Tracks"]);
        en.push([true, "Your Top Tracks"]);
    }

    if (rawSettings.text4?.check) {
        de.push([true, "Ihrer Top Interpreten"]);
        en.push([true, "Your Top Artists"]);
    }

    if (rawSettings.text5?.check) {
        de.push([true, "Den Interpreten den Sie folgen"]);
        en.push([true, "Your Followed Artists"]);
    }

    if (rawSettings.text6?.check) {
        const deText = rawSettings.text6.public
            ? "Ihrer Playlists"
            : "Ihren öffentlichen Playlists";
        de.push([true, deText]);

        const enText = rawSettings.text6.public
            ? "Your Playlists"
            : "Your public Playlists";
        en.push([true, enText]);
    }

    if (rawSettings.text7?.check) {
        de.push([true, "Ihrer kürzlich gehörten Musik"]);
        en.push([true, "Your last heard music"]);
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

export function buildFollowupConfig(rawSettings) {
    if (!rawSettings) {
        return {
            endUrl: null,
            questionTypeCheck: null,
            dataFieldsCheck: null,
            selectedOption: null,
            passLang: false,
        };
    }

    const endUrl = rawSettings.secondEndUrl !== "" ? rawSettings.secondEndUrl : null;

    return {
        endUrl,
        questionTypeCheck: endUrl ? rawSettings.questionTypeCheck : null,
        dataFieldsCheck: endUrl ? rawSettings.dataFieldsCheck : null,
        selectedOption: endUrl ? rawSettings.selectedOption : null,
        passLang: endUrl ? rawSettings.passLang : false,
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
