import React from "react";
import { CircularProgress } from "@mui/material";

export default function LoadingPanel({ language }) {
    return (
        <div className="loading-container">
            <div className="loading-item">
                <div className="loading-inner">
                    <CircularProgress style={{ margin: "auto" }} />
                    {language !== "de" ? (
                        <body1
                            style={{ paddingTop: "48px" }}
                            className="endPage-Stepper-body"
                        >
                            Spotify data is loading. <br />
                            Please do not refresh the page.
                        </body1>
                    ) : (
                        <body1
                            style={{ paddingTop: "48px" }}
                            className="endPage-Stepper-body"
                        >
                            Spotify-Daten werden geladen. <br />
                            Bitte laden Sie die Seite nicht neu.
                        </body1>
                    )}
                </div>
            </div>
        </div>
    );
}
