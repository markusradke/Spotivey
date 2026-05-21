import * as React from "react";
import { EndContentSettings } from "./Content/endContentSettings";

export function endSettingsCard(
    endOption, setEndOption,
    endUrl, setEndUrl,
    shareSurveyUrl, setShareSurveyUrl,
    collectEmails, setCollectEmails,
    emailTextEn, setEmailTextEn,
    emailTextDe, setEmailTextDe,
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
    savedEpisodesFollowUp, setSavedEpisodesFollowUp,
) {
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

                    <EndContentSettings
                        endOption={endOption}
                        setEndOption={setEndOption}
                        endUrl={endUrl}
                        setEndUrl={setEndUrl}
                        shareSurveyUrl={shareSurveyUrl}
                        setShareSurveyUrl={setShareSurveyUrl}
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
                        collectEmails={collectEmails}
                        setCollectEmails={setCollectEmails}
                        emailTextEn={emailTextEn}
                        setEmailTextEn={setEmailTextEn}
                        emailTextDe={emailTextDe}
                        setEmailTextDe={setEmailTextDe}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}