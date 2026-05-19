import * as React from "react";
import { MenuItem, Select, TextField } from "@mui/material";

export function EndSettingsCard({
    endOption,
    setEndOption,
    endUrl,
    setEndUrl,
    conditionalEndURLParameter,
    setConditionalEndURLParameter,
    conditionalEndURLOption,
    setConditionalEndURLOption,
    savedTracksFollowUp,
    setSavedTracksFollowUp,
    topTracksShortTermFollowUp,
    setTopTracksShortTermFollowUp,
    topTracksMediumTermFollowUp,
    setTopTracksMediumTermFollowUp,
    topTracksLongTermFollowUp,
    setTopTracksLongTermFollowUp,
    topArtistsShortTermFollowUp,
    setTopArtistsShortTermFollowUp,
    topArtistsMediumTermFollowUp,
    setTopArtistsMediumTermFollowUp,
    topArtistsLongTermFollowUp,
    setTopArtistsLongTermFollowUp,
    followedArtistsFollowUp,
    setFollowedArtistsFollowUp,
    currentPlaylistsFollowUp,
    setCurrentPlaylistsFollowUp,
    recentlyTracksFollowUp,
    setRecentlyTracksFollowUp,
    savedShowsFollowUp,
    setSavedShowsFollowUp,
    savedEpisodesFollowUp,
    setSavedEpisodesFollowUp,
}) {
    const trimmed_end_url = (endUrl ?? "").trim();
    const trimmed_conditional_parameter = (
        conditionalEndURLParameter ?? ""
    ).trim();
    const end_url_required =
        endOption === "end_url" || endOption === "conditional_end_url";
    const conditional_parameter_required =
        endOption === "conditional_end_url";
    const end_url_missing = end_url_required && trimmed_end_url === "";
    const conditional_parameter_missing =
        conditional_parameter_required && trimmed_conditional_parameter === "";

    const followUpFields = [
        {
            key: "savedTracksFollowUp",
            label: "Saved Tracks",
            value: savedTracksFollowUp,
            setValue: setSavedTracksFollowUp,
        },
        {
            key: "topTracksShortTermFollowUp",
            label: "Top Tracks (Short Term)",
            value: topTracksShortTermFollowUp,
            setValue: setTopTracksShortTermFollowUp,
        },
        {
            key: "topTracksMediumTermFollowUp",
            label: "Top Tracks (Medium Term)",
            value: topTracksMediumTermFollowUp,
            setValue: setTopTracksMediumTermFollowUp,
        },
        {
            key: "topTracksLongTermFollowUp",
            label: "Top Tracks (Long Term)",
            value: topTracksLongTermFollowUp,
            setValue: setTopTracksLongTermFollowUp,
        },
        {
            key: "topArtistsShortTermFollowUp",
            label: "Top Artists (Short Term)",
            value: topArtistsShortTermFollowUp,
            setValue: setTopArtistsShortTermFollowUp,
        },
        {
            key: "topArtistsMediumTermFollowUp",
            label: "Top Artists (Medium Term)",
            value: topArtistsMediumTermFollowUp,
            setValue: setTopArtistsMediumTermFollowUp,
        },
        {
            key: "topArtistsLongTermFollowUp",
            label: "Top Artists (Long Term)",
            value: topArtistsLongTermFollowUp,
            setValue: setTopArtistsLongTermFollowUp,
        },
        {
            key: "followedArtistsFollowUp",
            label: "Followed Artists",
            value: followedArtistsFollowUp,
            setValue: setFollowedArtistsFollowUp,
        },
        {
            key: "currentPlaylistsFollowUp",
            label: "Current Playlists",
            value: currentPlaylistsFollowUp,
            setValue: setCurrentPlaylistsFollowUp,
        },
        {
            key: "recentlyTracksFollowUp",
            label: "Recently Played Tracks",
            value: recentlyTracksFollowUp,
            setValue: setRecentlyTracksFollowUp,
        },
        {
            key: "savedShowsFollowUp",
            label: "Saved Shows",
            value: savedShowsFollowUp,
            setValue: setSavedShowsFollowUp,
        },
        {
            key: "savedEpisodesFollowUp",
            label: "Saved Episodes",
            value: savedEpisodesFollowUp,
            setValue: setSavedEpisodesFollowUp,
        },
    ];

    const followUpTotal = followUpFields.reduce(
        (sum, field) => sum + (Number.isFinite(field.value) ? field.value : 0),
        0
    );

    const [rawFollowUps, setRawFollowUps] = React.useState(() => ({
        savedTracksFollowUp: String(savedTracksFollowUp ?? 0),
        topTracksShortTermFollowUp: String(topTracksShortTermFollowUp ?? 0),
        topTracksMediumTermFollowUp: String(topTracksMediumTermFollowUp ?? 0),
        topTracksLongTermFollowUp: String(topTracksLongTermFollowUp ?? 0),
        topArtistsShortTermFollowUp: String(topArtistsShortTermFollowUp ?? 0),
        topArtistsMediumTermFollowUp: String(topArtistsMediumTermFollowUp ?? 0),
        topArtistsLongTermFollowUp: String(topArtistsLongTermFollowUp ?? 0),
        followedArtistsFollowUp: String(followedArtistsFollowUp ?? 0),
        currentPlaylistsFollowUp: String(currentPlaylistsFollowUp ?? 0),
        recentlyTracksFollowUp: String(recentlyTracksFollowUp ?? 0),
        savedShowsFollowUp: String(savedShowsFollowUp ?? 0),
        savedEpisodesFollowUp: String(savedEpisodesFollowUp ?? 0),
    }));

    React.useEffect(() => {
        setRawFollowUps({
            savedTracksFollowUp: String(savedTracksFollowUp ?? 0),
            topTracksShortTermFollowUp: String(topTracksShortTermFollowUp ?? 0),
            topTracksMediumTermFollowUp: String(topTracksMediumTermFollowUp ?? 0),
            topTracksLongTermFollowUp: String(topTracksLongTermFollowUp ?? 0),
            topArtistsShortTermFollowUp: String(topArtistsShortTermFollowUp ?? 0),
            topArtistsMediumTermFollowUp: String(topArtistsMediumTermFollowUp ?? 0),
            topArtistsLongTermFollowUp: String(topArtistsLongTermFollowUp ?? 0),
            followedArtistsFollowUp: String(followedArtistsFollowUp ?? 0),
            currentPlaylistsFollowUp: String(currentPlaylistsFollowUp ?? 0),
            recentlyTracksFollowUp: String(recentlyTracksFollowUp ?? 0),
            savedShowsFollowUp: String(savedShowsFollowUp ?? 0),
            savedEpisodesFollowUp: String(savedEpisodesFollowUp ?? 0),
        });
    }, [
        savedTracksFollowUp,
        topTracksShortTermFollowUp,
        topTracksMediumTermFollowUp,
        topTracksLongTermFollowUp,
        topArtistsShortTermFollowUp,
        topArtistsMediumTermFollowUp,
        topArtistsLongTermFollowUp,
        followedArtistsFollowUp,
        currentPlaylistsFollowUp,
        recentlyTracksFollowUp,
        savedShowsFollowUp,
        savedEpisodesFollowUp,
    ]);

    const parseNonNegativeInteger = (rawValue) => {
        if (rawValue === "") {
            return 0;
        }

        if (!/^\d+$/.test(rawValue)) {
            return null;
        }

        const parsed = Number.parseInt(rawValue, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    };

    const updateRawFollowUp = (key, rawValue) => {
        if (!/^\d*$/.test(rawValue)) {
            return;
        }

        setRawFollowUps((prev) => ({ ...prev, [key]: rawValue }));
    };

    const commitFollowUp = (field) => {
        const rawValue = rawFollowUps[field.key] ?? "";
        const nextValue = parseNonNegativeInteger(rawValue);
        const otherSum = followUpTotal - field.value;
        const wouldExceedMax = nextValue === null
            ? true
            : nextValue + otherSum > 30;

        if (nextValue === null || wouldExceedMax) {
            setRawFollowUps((prev) => ({
                ...prev,
                [field.key]: String(field.value ?? 0),
            }));
            return;
        }

        field.setValue(nextValue);
        setRawFollowUps((prev) => ({
            ...prev,
            [field.key]: String(nextValue),
        }));
    };

    return (
        <React.Fragment>
            <div className="card-content-inner-container">
                <div className="card-content">
                    <h1 data-heading="true" className="settings-title">
                        End / Follow-Up Settings
                    </h1>
                    <p style={{ paddingTop: '1em', marginBottom: '1.5rem' }}>
                        Here you can specify what should happen after the data donation has been completed.
                        <br /> <br />

                        You can either choose to end the donation with a simple thank you message or to redirect the participants to a website of your choice. All URL parameters that were present in the starting URL (except for the survey ID) will be automatically forwarded to the end URL, so you can for example use them to create personalized end pages.
                        <br /> <br />

                        If you wish to redirect the participants to a follow-up survey, please enter the follow-up survey URL. In addition to the URL parameters mentioned above, you can then choose to automatically forward the Spotify data that the participants have agreed to share. You can forward a maximum of 30 data points in total, which you can freely distribute among the different data types. <br /> <br />

                        If you choose the conditional redirect option, participants will only be redirected to the specified URL if a certain URL parameter is present in the starting URL. This allows you to, for example, only redirect participants from a specific panel provider to a landing page, while participants from other panel providers will see either a simple thank you message or a statistical summary of their results at the end of the donation.
                        <br />
                    </p>

                    <div
                        className="follow-up-settings-container"
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                        <h2
                            className="follow-up-settings-title"
                            style={{ margin: 0 }}
                        >
                            End Option
                        </h2>
                        <Select
                            value={endOption}
                            onChange={(e) => setEndOption(e.target.value)}
                            width="50%"
                        >
                            <MenuItem value="plain">Plain Thank You Message</MenuItem>
                            <MenuItem value="wrapped">Sharable Spotivey Wrapped</MenuItem>
                            <MenuItem value="end_url">Redirect to URL</MenuItem>
                            <MenuItem value="conditional_end_url">Conditional Redirect to URL</MenuItem>
                        </Select>
                        {endOption === "end_url" || endOption === "conditional_end_url" ? (
                            <div
                                className="end-url-input-container"
                                style={{ marginTop: '0.25rem' }}
                            >
                                <TextField
                                    label="End URL"
                                    type="url"
                                    value={endUrl}
                                    onChange={(e) => setEndUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    fullWidth
                                    required={end_url_required}
                                    error={end_url_missing}
                                    helperText={
                                        end_url_missing
                                            ? "End URL is required for this option."
                                            : ""
                                    }
                                />
                                {endOption === "conditional_end_url" && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <TextField
                                            label="Single URL Parameter that triggers conditional redirect"
                                            type="text"
                                            value={conditionalEndURLParameter}
                                            onChange={(e) => setConditionalEndURLParameter(e.target.value)}
                                            placeholder="e.g., 'panelprovider_id'"
                                            fullWidth
                                            style={{ marginTop: '0.75rem' }}
                                            required={conditional_parameter_required}
                                            error={conditional_parameter_missing}
                                            helperText={
                                                conditional_parameter_missing
                                                    ? "This field is required for conditional redirect."
                                                    : ""
                                            }
                                        />
                                        <br />
                                        <h2
                                            className="follow-up-settings-title"
                                            style={{ margin: '1.5rem 0 0.75rem 0' }}>
                                            Endpage for non-redirected participants
                                        </h2>
                                        <Select
                                            value={conditionalEndURLOption}
                                            onChange={(e) => setConditionalEndURLOption(e.target.value)}
                                            fullWidth
                                            style={{ marginTop: '0.75rem' }}
                                        >
                                            <MenuItem value="plain">Plain Thank You Message</MenuItem>
                                            <MenuItem value="wrapped">Sharable Spotivey Wrapped</MenuItem>
                                        </Select>
                                    </div>
                                )}
                                <h2
                                    className="follow-up-settings-title"
                                    style={{ margin: '1rem 0 0 0' }}
                                >
                                    Forward Spotify Data to Redirected URL (Optional)
                                </h2>
                                <p style={{ margin: '1rem 0 0 0' }}>
                                    <strong>Data points left to distribute:</strong>{" "}
                                    {Math.max(0, 30 - followUpTotal)}
                                </p>

                                <div
                                    className="follow-up-number-fields"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        marginTop: '1rem',
                                    }}
                                >
                                    {followUpFields.map((field) => (
                                        <TextField
                                            key={field.label}
                                            label={field.label}
                                            type="number"
                                            value={rawFollowUps[field.key] ?? ""}
                                            onChange={(e) =>
                                                updateRawFollowUp(field.key, e.target.value)
                                            }
                                            onBlur={() => commitFollowUp(field)}
                                            inputProps={{
                                                min: 0,
                                                step: 1,
                                                inputMode: "numeric",
                                                pattern: "[0-9]*",
                                            }}
                                            size="small"
                                            style={{ width: '100%', maxWidth: '320px' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export function endSettingsCard(
    endOption, setEndOption,
    endUrl, setEndUrl,
    conditionalEndURLParameter, setConditionalEndURLParameter,
    conditionalEndURLOption, setConditionalEndURLOption,
    savedTracksFollowUp, setSavedTracksFollowUp,
    topTracksShortTermFollowUp, setTopTracksShortTermFollowUp,
    topTracksMediumTermFollowUp, setTopTracksMediumTermFollowUp,
    topTracksLongTermFollowUp, setTopTracksLongTermFollowUp,
    topArtistsShortTermFollowUp, setTopArtistsShortTermFollowUp,
    topArtistsMediumTermFollowUp, setTopArtistsMediumTermFollowUp,
    topArtistsLongTermFollowUp, setTopArtistsLongTermFollowUp,
    followedArtistsFollowUp, setFollowedArtistsFollowUp,
    currentPlaylistsFollowUp, setCurrentPlaylistsFollowUp,
    recentlyTracksFollowUp, setRecentlyTracksFollowUp,
    savedShowsFollowUp, setSavedShowsFollowUp,
    savedEpisodesFollowUp, setSavedEpisodesFollowUp
) {
    return (
        <EndSettingsCard
            endOption={endOption}
            setEndOption={setEndOption}
            endUrl={endUrl}
            setEndUrl={setEndUrl}
            conditionalEndURLParameter={conditionalEndURLParameter}
            setConditionalEndURLParameter={setConditionalEndURLParameter}
            conditionalEndURLOption={conditionalEndURLOption}
            setConditionalEndURLOption={setConditionalEndURLOption}
            savedTracksFollowUp={savedTracksFollowUp}
            setSavedTracksFollowUp={setSavedTracksFollowUp}
            topTracksShortTermFollowUp={topTracksShortTermFollowUp}
            setTopTracksShortTermFollowUp={setTopTracksShortTermFollowUp}
            topTracksMediumTermFollowUp={topTracksMediumTermFollowUp}
            setTopTracksMediumTermFollowUp={setTopTracksMediumTermFollowUp}
            topTracksLongTermFollowUp={topTracksLongTermFollowUp}
            setTopTracksLongTermFollowUp={setTopTracksLongTermFollowUp}
            topArtistsShortTermFollowUp={topArtistsShortTermFollowUp}
            setTopArtistsShortTermFollowUp={setTopArtistsShortTermFollowUp}
            topArtistsMediumTermFollowUp={topArtistsMediumTermFollowUp}
            setTopArtistsMediumTermFollowUp={setTopArtistsMediumTermFollowUp}
            topArtistsLongTermFollowUp={topArtistsLongTermFollowUp}
            setTopArtistsLongTermFollowUp={setTopArtistsLongTermFollowUp}
            followedArtistsFollowUp={followedArtistsFollowUp}
            setFollowedArtistsFollowUp={setFollowedArtistsFollowUp}
            currentPlaylistsFollowUp={currentPlaylistsFollowUp}
            setCurrentPlaylistsFollowUp={setCurrentPlaylistsFollowUp}
            recentlyTracksFollowUp={recentlyTracksFollowUp}
            setRecentlyTracksFollowUp={setRecentlyTracksFollowUp}
            savedShowsFollowUp={savedShowsFollowUp}
            setSavedShowsFollowUp={setSavedShowsFollowUp}
            savedEpisodesFollowUp={savedEpisodesFollowUp}
            setSavedEpisodesFollowUp={setSavedEpisodesFollowUp}
        />
    );
}