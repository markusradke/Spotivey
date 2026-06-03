import * as React from "react";
import { Button } from '@mui/material';
import { useNavigate } from "react-router";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import {
    createRetrievalSettings,
    updateRetrievalSettings,
} from "../../../../api/surveyApi";

function getMarketCode(market) {
    if (!market) {
        return "DE";
    }
    if (typeof market === "string") {
        return market || "DE";
    }
    if (typeof market === "object") {
        return market.Code || "DE";
    }
    return "DE";
}

function getTimeRange(timeRange) {
    if (!timeRange) {
        return "medium_term";
    }
    if (typeof timeRange === "string") {
        return timeRange;
    }
    if (typeof timeRange === "object") {
        return timeRange.name || "medium_term";
    }
    return "medium_term";
}

export default function SettingsDialog(props) {

    const textSpotify = ["Saved Tracks", "User Profile", "Top Tracks (Short Term)", "Top Tracks (Medium Term)", "Top Tracks (Long Term)",
        "Top Artists (Short Term)", "Top Artists (Medium Term)", "Top Artists (Long Term)", "Followed Artists", "Playlists",
        "Recently Played Tracks", "Saved Shows", "Saved Episodes"]

    const handleCloseDialog = () => {
        props.props[0][1](false)
    }

    const navigate = useNavigate();

    async function handleOkayDialog() {
        const checkArray = props.props[1];
        const limitArray = props.props[2];
        const confirmArray = props.props[5];
        const endSettings = props.props[8];
        const screenoutSettings = props.props[9];

        const body = {
            data: null,
            umfrageName: props.props[3][0],
            umfrageID: props.props[3][1],
            umfrageEndUrl: '',
            username: props.props[4],

            saved_tracks_enabled: checkArray[0],
            saved_tracks_confirm: confirmArray[0],
            saved_tracks_limit: limitArray[0][0],
            saved_tracks_market_code: getMarketCode(limitArray[0][1]),
            saved_tracks_followup: endSettings.savedTracksFollowUp,

            profile_enabled: checkArray[1],
            profile_confirm: confirmArray[1],

            top_tracks_shortterm_enabled: checkArray[2],
            top_tracks_shortterm_confirm: confirmArray[2],
            top_tracks_shortterm_limit: limitArray[2][0],
            top_tracks_shortterm_time_range: getTimeRange(limitArray[2][1]),
            top_tracks_shortterm_followup: endSettings.topTracksShortTermFollowUp,

            top_tracks_mediumterm_enabled: checkArray[3],
            top_tracks_mediumterm_confirm: confirmArray[3],
            top_tracks_mediumterm_limit: limitArray[3][0],
            top_tracks_mediumterm_time_range: getTimeRange(limitArray[3][1]),
            top_tracks_mediumterm_followup: endSettings.topTracksMediumTermFollowUp,

            top_tracks_longterm_enabled: checkArray[4],
            top_tracks_longterm_confirm: confirmArray[4],
            top_tracks_longterm_limit: limitArray[4][0],
            top_tracks_longterm_time_range: getTimeRange(limitArray[4][1]),
            top_tracks_longterm_followup: endSettings.topTracksLongTermFollowUp,

            top_artists_shortterm_enabled: checkArray[5],
            top_artists_shortterm_confirm: confirmArray[5],
            top_artists_shortterm_limit: limitArray[5][0],
            top_artists_shortterm_time_range: getTimeRange(limitArray[5][1]),
            top_artists_shortterm_followup: endSettings.topArtistsShortTermFollowUp,

            top_artists_mediumterm_enabled: checkArray[6],
            top_artists_mediumterm_confirm: confirmArray[6],
            top_artists_mediumterm_limit: limitArray[6][0],
            top_artists_mediumterm_time_range: getTimeRange(limitArray[6][1]),
            top_artists_mediumterm_followup: endSettings.topArtistsMediumTermFollowUp,

            top_artists_longterm_enabled: checkArray[7],
            top_artists_longterm_confirm: confirmArray[7],
            top_artists_longterm_limit: limitArray[7][0],
            top_artists_longterm_time_range: getTimeRange(limitArray[7][1]),
            top_artists_longterm_followup: endSettings.topArtistsLongTermFollowUp,

            followed_artists_enabled: checkArray[8],
            followed_artists_confirm: confirmArray[8],
            followed_artists_limit: limitArray[8][0],
            followed_artists_followup: endSettings.followedArtistsFollowUp,

            current_playlists_enabled: checkArray[9],
            current_playlists_confirm: confirmArray[9],
            current_playlists_limit: limitArray[9][0],
            current_playlists_public: limitArray[9][1],
            current_playlists_privatetracks: limitArray[9][2],
            current_playlists_followup: endSettings.currentPlaylistsFollowUp,

            recent_tracks_enabled: checkArray[10],
            recent_tracks_confirm: confirmArray[10],
            recent_tracks_limit: limitArray[10][0],
            recent_tracks_followup: endSettings.recentlyTracksFollowUp,

            saved_shows_enabled: checkArray[11],
            saved_shows_confirm: confirmArray[11],
            saved_shows_limit: limitArray[11][0],
            saved_shows_followup: endSettings.savedShowsFollowUp,

            saved_episodes_enabled: checkArray[12],
            saved_episodes_confirm: confirmArray[12],
            saved_episodes_limit: limitArray[12][0],
            saved_episodes_followup: endSettings.savedEpisodesFollowUp,

            end_option: endSettings.endOption,
            end_url: endSettings.endURL,
            share_survey_url: endSettings.shareSurveyUrl,
            conditional_end_url_parameter: endSettings.conditionalEndURLParameter,
            conditional_end_url_option: endSettings.conditionalEndURLOption,
            collect_emails: endSettings.collectEmails,
            email_text_en: endSettings.emailTextEn,
            email_text_de: endSettings.emailTextDe,

            screenout_option: screenoutSettings.screenoutOption,
            screenout_url: screenoutSettings.screenoutURL,
            conditional_screenout_url_parameter: screenoutSettings.conditionalScreenoutURLParameter,
            screenout_min_data: screenoutSettings.screenoutMinData,
            screenout_check_identical: screenoutSettings.screenoutCheckIdentical

        };
        try {
            if (props.props[6]) {
                body.updateID = props.props[7];
                const result = await updateRetrievalSettings(body);
                if (!result.ok) {
                    const errorMsg = result.data?.msg || result.data?.error || 'Failed to update settings';
                    alert(`Error: ${errorMsg}`);
                    return;
                }
                navigate('/user/settings', { state: { push: true } })
                return;
            }

            const result = await createRetrievalSettings(body);
            if (!result.ok) {
                const errorMsg = result.data?.msg || result.data?.error || 'Failed to create settings';
                alert(`Error: ${errorMsg}`);
                return;
            }
            navigate('/user/settings', { state: { push: true } })
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    function getSpotifyText() {

        return (
            <React.Fragment>
                {props.props[1].map(function (item, i) {
                    if (item) {
                        return (
                            <h3 className="settings-dialog-text">
                                {textSpotify[i]} <br></br> {props.props[2][i].map(function (item2, j) {
                                    if (j === 0 && item2.length !== 0) {
                                        if (props.props[2][i].length === 1) {
                                            return ('(limit: ' + item2 + ')')
                                        }
                                        else { return ('(limit: ' + item2) }
                                    } else {
                                        if (item2) {
                                            if (item2 === '' || item2.name === 'medium_term' || item2.name === 'short_term' ||
                                                item2.name === 'long_term') {
                                                if (item2 === 'medium_term') {
                                                    return ('; time_range: ' + item2 + ')')
                                                } else if (item2 === '') {
                                                    return (')')
                                                } else {
                                                    return ('; time_range: ' + item2.name + ')')
                                                }
                                            } else {
                                                if (item2.Code === '') {
                                                    return (')')
                                                }
                                                else {
                                                    return ('; market: ' + item2.Code + ')')
                                                }
                                            }
                                        } else {
                                            return (')')
                                        }
                                    }
                                })}
                            </h3>
                        )
                    }
                })}
            </React.Fragment>
        )
    }

    function renderSpotifyText() {
        return (
            <React.Fragment>
                <h5 className="settings-dialog-text-title">
                    Spotify API Settings:
                </h5>
                {getSpotifyText()}
            </React.Fragment>
        )
    }

    function renderTextSettings() {
        return (
            <React.Fragment>
                <div className="settings-dialog-container">
                    <div className='settings-dialog-content-outer'>
                        <h3 className="settings-dialog-text-title" >
                            Settings Name:
                        </h3>
                        <h3 className="settings-dialog-text" >
                            {props.props[3][0]}
                        </h3>
                        <h3 className="settings-dialog-text-title" >
                            Survey ID:
                        </h3>
                        <h3 className="settings-dialog-text" >
                            {props.props[3][1]}
                        </h3>
                        <h3 className="settings-dialog-text-title" >
                            Screenout Option:
                        </h3>
                        <h3 className="settings-dialog-text" >
                            {props.props[9].screenoutOption == 'page' ? 'Screenout page' : ''}
                            {props.props[9].screenoutOption == 'end_url' ? 'Screenout end URL' : ''}
                            {props.props[9].screenoutOption == 'conditional_end_url' ? 'Screenout conditional end URL' : ''}
                        </h3>
                        <h3 className="settings-dialog-text-title" >
                            End Option:
                        </h3>
                        <h3 className="settings-dialog-text" >
                            {props.props[8].endOption === 'plain' ? 'Plain end page' : ''}
                            {props.props[8].endOption === 'summary' ? 'Summary end page' : ''}
                            {props.props[8].endOption === 'end_url' ? `Redirect custom URL` : ''}
                            {props.props[8].endOption === 'conditional_end_url' ? `Conditional redirect custom URL` : ''} <br></br>
                            {props.props[8].endOption === 'end_url' || props.props[8].endOption === 'conditional_end_url' ? `${props.props[8].endURL}` : ''} <br></br>
                            {props.props[8].endOption === 'conditional_end_url' ? `Parameter: ${props.props[8].conditionalEndURLParameter}` : ''}  <br></br>
                            {props.props[8].endOption === 'conditional_end_url' ? `No-redirect option: ${props.props[8].conditionalEndURLOption}` : ''}  <br></br>
                            {props.props[8].collectEmails ? `Collect Emails: Yes` : `Collect Emails: No`} <br></br>
                        </h3>
                    </div>
                    <Divider
                        orientation="vertical"
                        variant="middle"
                        flexItem
                        style={{ margin: '0 1rem' }}
                    />
                    <div className='spotify-settings'>
                        {renderSpotifyText()}
                    </div>
                </div>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <h1 className="settings-dialog-title">
                Settings Overview
            </h1>
            <DialogContent dividers={scroll === 'paper'}>
                <h3 className="settings-overview-text" >
                    Please check your settings details
                </h3>
                <Divider variant="middle" style={{ margin: '1rem 0' }} />
                {renderTextSettings()}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>
                    Cancel
                </Button>
                <Button onClick={handleOkayDialog}>
                    Okay
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}