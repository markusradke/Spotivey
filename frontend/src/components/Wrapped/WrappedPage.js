import React from "react";
import { useParams } from "react-router-dom";

export default function WrappedPage() {
    let { lang } = useParams();

    return (
        <React.Fragment>
            <div class="room-header">
                <header class="room-header-inner">
                    <div class="room-header-content-container">
                        <div class="room-header-content-container-inner">
                            <span class="logo-tu-berlin">
                                <img src="../../../static/images/SpotiveyLogo2_Schrift.svg" width="100%" height="100%" />
                            </span>
                        </div>
                    </div>
                </header>
            </div>
            <div class='version-page-main'>
                <div class="room-content-main">
                    <div class='room-content-wrapper'>
                        <div class="room-content-wrapper-inner">
                            <div class="room-two-content-outer">
                                <div class='card-two-content-inner-container'>
                                    <div class='card-content'>
                                        <div className={"render-InfoplusErgebnis-container"}>
                                            <h1 class='settings-title'>
                                                {lang == 'de' ?
                                                    'Deine Daten' :
                                                    'Your Data'
                                                }
                                            </h1>
                                            {lang == 'de' ?
                                                <p>
                                                    Hier entsteht gerade eine Auswertung Deiner Daten.
                                                </p> :
                                                <p>
                                                    An evaluation of your data is being created here.
                                                </p>
                                            }
                                        </div>
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