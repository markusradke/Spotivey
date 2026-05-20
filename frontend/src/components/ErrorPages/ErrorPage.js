import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

export default function ErrorPage() {
    const { errorType } = useParams();
    const navigate = useNavigate();

    const errorMessages = {
        titleEN: 'Something Went Wrong',
        titleDE: 'Etwas Ist Schiefgelaufen',
        bodyEN: 'An unexpected error occurred. Please retry using your original survey link or contact your study administrator for assistance. If you are a study administrator, please go to the login page.',
        bodyDE: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut mit Ihrem ursprünglichen Umfragelink oder wenden Sie sich an Ihren Studienadministrator. Wenn Sie ein Studienadministrator sind, gehen Sie bitte zur Login-Seite.',
    };


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
                                        <h1 className='settings-title' style={{ fontSize: '36pt' }}>
                                            {errorMessages.titleEN}
                                        </h1>
                                        <h1 className='settings-title' style={{ marginTop: '0.5rem', opacity: 0.6, fontSize: '36pt' }}>
                                            {errorMessages.titleDE}
                                        </h1>
                                        <hr style={{ margin: '2rem 0', opacity: 0.3 }} />

                                        <p>
                                            {errorMessages.bodyEN}
                                        </p>

                                        <br /><br />

                                        <p style={{ opacity: 0.5 }}>
                                            {errorMessages.bodyDE}
                                        </p>

                                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <Button
                                                variant='outlined'
                                                onClick={handleBackToLogin}
                                                style={{ minWidth: '150px' }}
                                            >
                                                Go to Login / Gehe zum Login
                                            </Button>
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