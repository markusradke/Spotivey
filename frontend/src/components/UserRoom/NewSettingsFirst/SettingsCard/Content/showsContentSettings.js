import * as React from "react";
import { Checkbox, Slider } from "@mui/material";
import { BoundedNumberField } from "./Components/BoundedNumberField";
import { marks } from './Components/settingsConst';
import { confirmCheck } from "./Components/ConfirmCheck";
import PublicCheck from "./Components/ConfirmCheck";
import LimitComponent from "./Components/limitComponent";

export function showsContentSettings(
    savedShowsChecked, setSavedShowsChecked,
    savedShowsLimit, setSavedShowsLimit,
    confirmSavedShowsYes, setConfirmSavedShowsYes,
    savedEpisodesChecked, setSavedEpisodesChecked,
    savedEpisodesLimit, setSavedEpisodesLimit,
    confirmSavedEpisodesYes, setConfirmSavedEpisodesYes
) {
    return (
        <React.Fragment>
            <div>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Saved Shows
                </h2>
                <h2 class='figcaption-text'>
                    Get a list of the shows saved in the current Spotify user's library.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={savedShowsChecked}
                            onChange={(e) => setSavedShowsChecked(e.target.checked)}
                            style={{ color: "#c40D1E" }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <BoundedNumberField
                                label="Limit"
                                value={savedShowsLimit}
                                onChange={setSavedShowsLimit}
                                min={1}
                                max={1000}
                                step={1}
                            />
                        </div>
                        {confirmCheck(confirmSavedShowsYes, setConfirmSavedShowsYes)}
                    </div>
                </div>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Saved Episodes
                </h2>
                <h2 class='figcaption-text'>
                    Get a list of the episodes saved in the current Spotify user's library.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={savedEpisodesChecked}
                            onChange={(e) => setSavedEpisodesChecked(e.target.checked)}
                            style={{ color: "#c40D1E" }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <BoundedNumberField
                                label="Limit"
                                value={savedEpisodesLimit}
                                onChange={setSavedEpisodesLimit}
                                min={1}
                                max={1000}
                                step={1}
                            />
                        </div>
                        {confirmCheck(confirmSavedEpisodesYes, setConfirmSavedEpisodesYes)}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
} 