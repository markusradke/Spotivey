import React from "react";
import { goBackToLogin } from '../NewSettingsFirst/Button/BackButtonFunction';
import headerSettings from '../Header/headerSettings';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
    fetchSurveySettingsById,
    fetchUserSession,
    updateConfirmText,
} from "../../../api/surveyApi";

export default function ConfirmTextDesign() {

    const [confirmArray, setConfirmArray] = useState([])
    const [surveyID, setSurveyID] = useState(null)
    const [username, setUsername] = useState(null)

    const navigate = useNavigate()

    const location = useLocation()

    const dataFieldsNameArray = [
        'User\'s Saved Tracks', 'User\'s Top Items (Tracks)', 'Last Played Tracks', 'User\'s Top Items (Artists)',
        'User\'s Followed Artists', 'User\'s Playlists'
    ]

    const [confirmTextArray, setConfirmTextArray] = useState(Array(6).fill(['', '']))

    useEffect(() => {
        async function getParticipantSession() {
            fetchUserSession().then(({ ok, data }) => {
                if (!ok || !data || data.username === null) {
                    goBackToLogin(navigate)
                    return;
                }
                setUsername(data.username)

                fetchSurveySettingsById(location.state?.surveyID)
                    .then((settingsData) => {
                        if (!settingsData || settingsData.error) {
                            return;
                        }

                        const raw = settingsData.data[0]
                        const savedTracks = raw.saved_tracks
                        const topTracks = raw.top_tracks
                        const recentlyPlayed = raw.recently_played
                        const topArtists = raw.top_artists
                        const followedArtists = raw.followed_artists
                        const currentPlaylists = raw.current_playlists

                        console.log(raw.confirmText)
                        setSurveyID(raw.umfrageID)
                        setConfirmTextArray(raw.confirmText)

                        setConfirmArray([
                            savedTracks.check ? savedTracks.confirmCheck : false,
                            topTracks.check ? topTracks.confirmCheck : false,
                            recentlyPlayed.check ? recentlyPlayed.confirmCheck : false,
                            topArtists.check ? topArtists.confirmCheck : false,
                            followedArtists.check ? followedArtists.confirmCheck : false,
                            currentPlaylists.check ? currentPlaylists.confirmCheck : false,
                        ])
                    });
            });
        }
        getParticipantSession();
    }, [])

    function renderTextFieldConfirmation(title, label, setStateVar, value, index, index2, labelLang) {
        return (
            <div>
                <h2 data-heading='true' class='settings-content-item-title'>
                    {title}
                </h2>
                <TextField
                    multiline
                    fullWidth
                    label={label + labelLang[0]}
                    id="filled-size-normal"
                    variant="filled"
                    onChange={(e) => {
                        let items = [...confirmTextArray];
                        items[index][0] = e.target.value;
                        setStateVar(items);
                    }}
                    value={value[0]}
                />
                <div style={{ paddingBottom: '24px' }}></div>
                <TextField
                    multiline
                    fullWidth
                    label={label + labelLang[1]}
                    id="filled-size-normal"
                    variant="filled"
                    onChange={(e) => {
                        let items = [...confirmTextArray];
                        items[index][1] = e.target.value;
                        setStateVar(items);
                    }}
                    value={value[1]}
                />
            </div>
        )
    }



    return (
        <React.Fragment>
            <div class="setting-header">
                <header class="setting-header-inner">
                    <div class="setting-header-content-container">
                        <div class="setting-header-content-container-inner">
                            {headerSettings()}
                        </div>
                    </div>
                </header>
            </div>
            <div className='confirm-text-page-container'>
                <div class='card-content-second' style={{ paddingBottom: '70px' }}>
                    <h1 data-heading='true' class='settings-title'>
                        Change Confirm Text
                    </h1>
                    {confirmArray.length > 0 ?
                        <React.Fragment>
                            {confirmArray.map((confirmItem, confirmIndex) => {
                                return (
                                    <React.Fragment>
                                        {confirmItem ?
                                            <React.Fragment>
                                                <div>
                                                    {renderTextFieldConfirmation(dataFieldsNameArray[confirmIndex], 'Change Confirmation Text',
                                                        setConfirmTextArray, confirmTextArray[confirmIndex], confirmIndex, 0, [' (German)', ' (English)'])}
                                                </div>
                                            </React.Fragment>
                                            : null}
                                    </React.Fragment>
                                )
                            })}
                        </React.Fragment> :
                        null
                    }
                    <div className="save-button-confirm-text-change-container">
                        <div className="save-button-confirm-text-change">
                            <Button
                                variant="outlined"
                                endIcon={<SaveOutlinedIcon />}
                                onClick={() => {
                                    updateConfirmText({
                                        surveyID: surveyID,
                                        username: username,
                                        confirmTextArray: confirmTextArray,
                                    }).then(() => {
                                        navigate('/user/settings')
                                    })
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}