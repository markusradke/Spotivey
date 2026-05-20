import React from 'react';
import { CircularProgress } from '@mui/material';

export default function CircularSaving({ language }) {
    return (
        <div className="loading-container" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
        }} >
            <div className="loading-item">
                <div className="loading-inner">
                    <CircularProgress style={{ margin: "auto" }} />
                    {language !== "de" ? (
                        <p
                            style={{ paddingTop: "48px", textAlign: "center" }}
                            className="endPage-Stepper-body"
                        >
                            Saving data... <br />
                            Please do not refresh the page.
                        </p>
                    ) : (
                        <p
                            style={{ paddingTop: "48px", textAlign: "center" }}
                            className="endPage-Stepper-body"
                        >
                            Daten werden gespeichert... <br />
                            Bitte laden Sie die Seite nicht neu.
                        </p>
                    )}
                </div>
            </div>
        </ div>
    );
}