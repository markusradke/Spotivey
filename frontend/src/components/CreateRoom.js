import React from "react";
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

export default function CreateRoom() {
    const navigate = useNavigate();
    const [showLandingPage, setShowLandingPage] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setShowLandingPage(true)
        }, 2000);
    }, []);

    const handleBackToLogin = () => {
        navigate('/login');
    }


    return (
        <React.Fragment>
            <div class="room-header">
                <header class="room-header-inner">
                    <div class="room-header-content-container">
                        <div class="room-header-content-container-inner">
                            <span class="logo-tu-berlin">
                                {/* <img src="../../../static/images/logo_grau-schwarz.png" width="25.755" height="25" />
                            <img src="../../../static/images/TU-Berlin-Logo.svg" width="34.09" height="25" /> */}
                                <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="100%" />
                            </span>
                        </div>
                    </div>
                </header>
            </div>
            <div class='room-page-main'>
                <div class="room-content-main">
                    <div class='room-content-wrapper'>
                        <div class="room-content-wrapper-inner">
                            <div class="room-two-content-outer">
                                <div class='card-two-content-inner-container'>
                                    <div class='card-content'>
                                        {showLandingPage ?
                                            <div className={"render-InfoplusErgebnis-container"}>
                                                <h1 className='settings-title'>
                                                    {"Session Expired"}
                                                </h1>
                                                <h1 className='settings-title' style={{ marginTop: '0.5rem', opacity: 0.6 }}>
                                                    {"Sitzung Abgelaufen"}
                                                </h1>
                                                <hr style={{ margin: '2rem 0', opacity: 0.3 }} />

                                                <body1 classname='endPage-Stepper-body'>
                                                    {"Your session has expired or could not be found. Please log in again."}
                                                </body1>

                                                <br /><br />

                                                <body1 className='endPage-Stepper-body' style={{ opacity: 0.5 }}>
                                                    {"Ihre Sitzung ist abgelaufen oder konnte nicht gefunden werden. Bitte melden Sie sich erneut an."}
                                                </body1>

                                                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <Button variant='outlined' onClick={handleBackToLogin} style={{ minWidth: '150px' }}>
                                                        Back to Login / Zurück zum Login
                                                    </Button>
                                                </div>

                                            </div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}