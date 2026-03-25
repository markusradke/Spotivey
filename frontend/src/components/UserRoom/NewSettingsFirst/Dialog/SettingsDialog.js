import * as React from "react";
import { Button } from '@mui/material';
import { useNavigate } from "react-router";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import { createSettings } from './CreateSettingsButtonPressed';
import updateSettings from './CreateSettingsButtonPressed';

function getMarketCode(market) {
    if (!market) {
        return "";
    }
    if (typeof market === "string") {
        return market;
    }
    if (typeof market === "object") {
        return market.Code || "";
    }
    return "";
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

    const textSpotify = ["Get User's Saved Tracks", "Get User's Profile", "Get User's Top Items (Tracks)",
        "Get User's Top Items (Artists)", "Get User's Followed Artists", "Get User's Playlists",
        "Get Last Played Tracks"]

    const handleCloseDialog = () => {
        props.props[0][1](false)
    }

    const navigate = useNavigate();

    function handleOkayDialog() {
        const checkArray = props.props[1];
        const limitArray = props.props[2];
        const confirmArray = props.props[5];

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

            profile_enabled: checkArray[1],
            profile_confirm: confirmArray[1],

            top_tracks_enabled: checkArray[2],
            top_tracks_confirm: confirmArray[2],
            top_tracks_limit: limitArray[2][0],
            top_tracks_time_range: getTimeRange(limitArray[2][1]),

            top_artists_enabled: checkArray[3],
            top_artists_confirm: confirmArray[3],
            top_artists_limit: limitArray[3][0],
            top_artists_time_range: getTimeRange(limitArray[3][1]),

            followed_artists_enabled: checkArray[4],
            followed_artists_confirm: confirmArray[4],
            followed_artists_limit: limitArray[4][0],

            current_playlists_enabled: checkArray[5],
            current_playlists_confirm: confirmArray[5],
            current_playlists_limit: limitArray[5][0],
            current_playlists_public: limitArray[5][1],

            recent_tracks_enabled: checkArray[6],
            recent_tracks_confirm: confirmArray[6],
            recent_tracks_limit: limitArray[6][0],
        };

        if (props.props[6]) {
            body.updateID = props.props[7];
            updateSettings(body, navigate);
        } else {
            createSettings(body, navigate);
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
                            Survey ID (1st Survey):
                        </h3>
                        <h3 className="settings-dialog-text" >
                            {props.props[3][1]}
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
                    Change
                </Button>
                <Button onClick={handleOkayDialog}>
                    Okay
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}