import React from "react";
import { goBackToLogin } from '../NewSettingsFirst/Button/BackButtonFunction';
import Header from "../Header/Header";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
    fetchSurveySettingsById,
    fetchUserSession,
    updateConfirmText,
} from "../../../api/surveyApi";
import { use } from "react";



export default function ConfirmTextDesign() {
    const [confirmArray, setConfirmArray] = useState([])
    const [surveyID, setSurveyID] = useState(null)
    const [username, setUsername] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const [confirmTextArray, setConfirmTextArray] = useState(['', ''])


    function getCurrentState() {
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
                    setSurveyID(raw.umfrageID)
                    setConfirmTextArray([raw.confirmText[0][0], raw.confirmText[0][1]])
                })
        })
    }

    function renderTextFieldConfirmation(setStateVar, labelLang) {
        return (
            <div>
                <TextField
                    multiline
                    fullWidth
                    label={labelLang[0]}
                    id="filled-size-normal"
                    variant="filled"
                    onChange={(e) => {
                        let items = [...confirmTextArray];
                        items[0] = e.target.value;
                        setStateVar(items);
                    }}
                    value={confirmTextArray[0]}
                />
                <div style={{ paddingBottom: '24px' }}></div>
                <TextField
                    multiline
                    fullWidth
                    label={labelLang[1]}
                    id="filled-size-normal"
                    variant="filled"
                    onChange={(e) => {
                        let items = [...confirmTextArray];
                        items[1] = e.target.value;
                        setStateVar(items);
                    }}
                    value={confirmTextArray[1]}
                />
            </div>
        )
    }

    useEffect(() => { getCurrentState(); }, [])

    return (
        <React.Fragment>
            <Header />
            <div className='confirm-text-page-container'>
                <div class='card-content-second' style={{ paddingBottom: '70px' }}>
                    <h3 data-heading='true' class='settings-title'>
                        Change (Optional) Confirm Texts
                    </h3>
                    <React.Fragment>
                        <div>
                            {renderTextFieldConfirmation(setConfirmTextArray, ['English', 'German'])}
                        </div>
                    </React.Fragment>
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