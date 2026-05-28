export const colors = {
    primary: "var(--color-tu-berlin)",
    mean: "#c7c7c7",
    text: "var(--color-black)",
    muted: "#6f6f6f",
    border: "rgba(0, 0, 0, 0.08)",
    panel: "rgba(255, 255, 255, 0.72)",
};

export function getGenreWordRotation(word) {
    const rotations = [0, -30, 30];
    return rotations[getWordHash(word.text) % rotations.length];
}

export function getGenreWordFontSize(words, isMobileLayout = false) {
    if (!words.length) {
        return () => (isMobileLayout ? 12 : 22);
    }

    const values = words.map((word) => word.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return (word) => {
        const minSize = isMobileLayout ? 12 : 22;
        const maxSize = isMobileLayout ? 34 : 72;

        if (min === max) {
            return (minSize + maxSize) / 2;
        }

        const scaled = minSize + ((word.value - min) / (max - min)) * (maxSize - minSize);
        return Math.max(minSize, Math.min(maxSize, scaled));
    };
}

export function getGenreWordFill(words) {
    const palette = [
        "var(--color-tu-berlin)",
        "#a34c4c",
        "#a88181",
        "#b89e9e",
        "#aaaaaa",
    ];
    const positions = new Map(words.map((word, index) => [word.text, index]));

    return (word) => {
        const position = positions.get(word.text) ?? 0;
        const ratio = words.length > 1 ? position / (words.length - 1) : 0;
        const paletteIndex = Math.min(palette.length - 1, Math.floor(ratio * palette.length));
        return palette[paletteIndex];
    };
}

export function hasMetricValue(value) {
    return value !== null && value !== undefined && !Number.isNaN(value);
}

export function getUsageAxisMax(value, mean) {
    const values = [value, mean].filter(hasMetricValue);
    const maxValue = values.length ? Math.max(...values) : 1;
    return Math.max(1, Math.ceil(maxValue * 1.1));
}

export function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "NA";
    }

    return `${Number(value).toFixed(0)}%`;
}

export function formatCount(value, lang = "en") {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "NA";
    }

    const formatted = Number(value).toFixed(0);
    return lang === "de"
        ? formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatYear(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "NA";
    }

    return String(Math.round(Number(value)));
}

export function buildBasisText(entries, prefix) {
    const parts = entries
        .filter(([count]) => Number(count) > 1)
        .map(([count, label]) => `${count} ${label}`);

    if (!parts.length) {
        return prefix;
    }

    if (parts.length === 1) {
        return `${prefix} ${parts[0]}`;
    }

    const last = parts.pop();
    return `${prefix} ${parts.join(", ")} and ${last}`;
}

export function getMainstreamScoreVariant(score, lang) {
    if (!hasMetricValue(score)) {
        return null;
    }

    if (score < 20) {
        return lang === "de"
            ? {
                title: "Pionier",
                description: "Sie entdecken Musik vor dem Algorithmus. Ihre Musik ist ein kuratierter Mix aus Underground-Juwelen, Indie-Lieblingen und Artists, die nur wenige kennen.",
                image_path: "static/images/participantsummary/trailblazer.svg",
            }
            : {
                title: "Trailblazer",
                description: "You're the friend who discovers music before the algorithm does. Your music is a curated mix of underground gems, indie darlings, and artists that most people have never heard of.",
                image_path: "static/images/participantsummary/trailblazer.svg",
            };
    }

    if (score <= 50) {
        return lang === "de"
            ? {
                title: "Ausgewogene Entdecker",
                description: "Sie haben das Beste aus beiden Welten: Chartstürmer gemischt mit Underground-Juwelen. Ihre Musik ist interessant und abwechslungsreich, aber zugänglich genug, dass Freunde Songs wiedererkennen würden.",
                image_path: "static/images/participantsummary/balanced_explorer.svg",
            }
            : {
                title: "Balanced Explorer",
                description: "You've got the best of both worlds: chart-toppers mixed with hidden treasures. Your taste is eclectic enough to keep things interesting, but accessible enough that your friends would actually recognize songs.",
                image_path: "static/images/participantsummary/balanced_explorer.svg",
            };
    }

    return lang === "de"
        ? {
            title: "Chart Champion",
            description: "Sie lieben, was die Massen lieben, und um ehrlich zu sein: Es gibt ja auch einen Grund, warum Hits nun mal Hits sind. Ihre Musik reflektiert aktuelle Trends, und Sie können jeden aktuellen Banger mitsingen.",
            image_path: "static/images/participantsummary/chart_champion.svg",
        }
        : {
            title: "Chart Champion",
            description: "You're vibing with what the masses are vibing with, and honestly, that's because the hits are hits for a reason. Your music is a reflection of what's trending, and you're always ready to sing along to the latest banger.",
            image_path: "static/images/participantsummary/chart_champion.svg",
        };
}

export function getExplicitScoreVariant(score, lang) {
    if (!hasMetricValue(score)) {
        return null;
    }

    if (score < 5) {
        return lang === "de"
            ? {
                title: "Sauber",
                description: "Ihre Musik kann man ohne Weiteres im Radio spielen oder mit Kindern singen. Ein Glück - Sie können Ihre Musik immer und überall hören, ohne auf Probleme zu stoßen!",
                image_path: "static/images/participantsummary/clean_slate.svg",
            }
            : {
                title: "Clean Slate",
                description: "Your music is radio-friendly and parent-approved. Lucky you, you can listen to your favorite music in any situation without any problems!",
                image_path: "static/images/participantsummary/clean_slate.svg",
            };
    }

    if (score <= 15) {
        return lang === "de"
            ? {
                title: "Gelegentliches Fluchen",
                description: "Sie haben kein Problem mit ein wenig Würze in Ihren Lyrics. Manchmal sind explizite Inhalte schon okay. Sie sind pragmatisch: Der Vibe ist wichtiger als die Sprache, und ein guter Song bleibt ein guter Song, egal ob ein wenig geflucht wird.",
                image_path: "static/images/participantsummary/casual_curser.svg",
            }
            : {
                title: "Casual Curser",
                description: "You're comfortable with a little spice in your lyrics - sometimes, explicit content is just fine. You're pragmatic: the vibe matters more than the language, and a great song is a great song regardless of a few choice words.",
                image_path: "static/images/participantsummary/casual_curser.svg",
            };
    }

    return lang === "de"
        ? {
            title: "Unzensiert-Enthusiast",
            description: "Explizite Inhalte stören Sie kein bisschen - es ist einfach Teil des künstlerischen Ausdrucks. Ihre Lieblingstracks scheuen sich nicht vor rauer Sprache, und Sie lieben die ungefilterte Authentizität, die explizite Musik oft mit sich bringt.",
            image_path: "static/images/participantsummary/uncensored_enthusiast.svg",
        }
        : {
            title: "Uncensored Enthusiast",
            description: "Explicit content doesn't bother you one bit - it's just part of the artistic expression. Your favorite tracks don't shy away from raw language, and you appreciate the unfiltered authenticity that explicit music often brings.",
            image_path: "static/images/participantsummary/uncensored_enthusiast.svg",
        };
}

function getWordHash(text) {
    let hash = 0;

    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }

    return hash;
}