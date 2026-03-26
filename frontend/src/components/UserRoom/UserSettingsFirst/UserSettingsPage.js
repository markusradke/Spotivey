import * as React from "react";
import headerSettings from '../Header/headerSettings';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import SettingsContent from './SettingsContent';
import { fetchUserSession } from "../../../api/surveyApi";


export default function UserSettingsPage(props) {

    const navigate = useNavigate()

    const [username, setUsername] = useState(null)

    useEffect(() => {
        async function getParticipantSession() {
            fetchUserSession().then(({ ok, data }) => {
                if (!ok || !data || data.username === null) {
                    navigate('/login')
                    return;
                }
                setUsername(data.username)
            });
        }
        getParticipantSession();
    }, [])

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
            <div class='setting-page-main'>
                <div class="setting-content-main">
                    <div class='setting-content-wrapper'>
                        <div class="setting-content-wrapper-inner">
                            <div class="setting-two-content-outer">
                                <div class='card-two-content-inner-container'>
                                    <div class='card-content'>
                                        {username ? <SettingsContent username={username} /> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>

    )
}