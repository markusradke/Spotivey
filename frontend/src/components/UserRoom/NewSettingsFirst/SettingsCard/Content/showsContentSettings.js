import * as React from "react";
import { Checkbox, Slider } from "@mui/material";
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
                            <Slider
                                aria-label="SliderSavedShows"
                                value={savedShowsLimit}
                                onChange={(e, newValue) => {
                                    setSavedShowsLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
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
                            <Slider
                                aria-label="SliderSavedEpisodes"
                                value={savedEpisodesLimit}
                                onChange={(e, newValue) => {
                                    setSavedEpisodesLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                            />
                        </div>
                        {confirmCheck(confirmSavedEpisodesYes, setConfirmSavedEpisodesYes)}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
} 