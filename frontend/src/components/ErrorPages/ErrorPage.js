import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { errorMessages } from "./ErrorMessages";
import Button from '@mui/material/Button';

export default function ErrorPage() {
    const { errorType } = useParams();
    const navigate = useNavigate();

    const currentError = errorMessages[errorType] || errorMessages['generic'];

    const handleRetry = () => {
        window.location.reload();
    }

    const handleBackToLogin = () => {
        navigate('/login');
    }

    return (
        <React.Fragment>
            <div className="room-header">
                <header className="room-header-inner">
                    <div className="room-header-content-container">
                        <div className="room-header-content-container-inner">
                            <span className="logo-tu-berlin">
                                <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="100%" />
                            </span>
                        </div>
                    </div>
                </header>
            </div>

            <div className='room-page-main'>
                <div className="room-content-main">
                    <div className='room-content-wrapper'>
                        <div className="room-content-wrapper-inner">
                            <div className="room-two-content-outer">
                                <div className='card-two-content-inner-container'>
                                    <div className='card-content'>
                                        <h1 className='settings-title'>
                                            {currentError.titleEN}
                                        </h1>
                                        <h1 className='settings-title' style={{ marginTop: '0.5rem', opacity: 0.6 }}>
                                            {currentError.titleDE}
                                        </h1>
                                        <hr style={{ margin: '2rem 0', opacity: 0.3 }} />

                                        <body1 classname='endPage-Stepper-body'>
                                            {currentError.bodyEN}
                                        </body1>

                                        <br /><br />

                                        <body1 className='endPage-Stepper-body' style={{ opacity: 0.5 }}>
                                            {currentError.bodyDE}
                                        </body1>

                                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {currentError.showRetry && (
                                                <Button
                                                    variant='contained'
                                                    onClick={handleRetry}
                                                    style={{ minWidth: '150px' }}
                                                >
                                                    Try Again / Erneut versuchen
                                                </Button>
                                            )}

                                            {currentError.showLogin && (
                                                <Button
                                                    variant='outlined'
                                                    onClick={handleBackToLogin}
                                                    style={{ minWidth: '150px' }}
                                                >
                                                    Back to Login / Zurück zum Login
                                                </Button>
                                            )}

                                            {currentError.showContact && ( //TODO: NEEDS TO BE UPDATED LATER WITH ACTUAL CONTACT METHOD
                                                <Button
                                                    variant='outlined'
                                                    onClick={() => window.open('mailto:contact@spotivey.com', '_blank')}
                                                    style={{ minWidth: '150px' }}
                                                >
                                                    Contact Support / Support kontaktieren
                                                </Button>
                                            )}
                                        </div>
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