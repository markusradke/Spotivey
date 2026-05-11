import * as React from "react";
import { showsContentSettings } from "./Content/showsContentSettings";

export function showsSettingsCard(
    savedShowsChecked, setSavedShowsChecked,
    savedShowsLimit, setSavedShowsLimit,
    confirmSavedShowsYes, setConfirmSavedShowsYes,
    savedEpisodesChecked, setSavedEpisodesChecked,
    savedEpisodesLimit, setSavedEpisodesLimit,
    confirmSavedEpisodesYes, setConfirmSavedEpisodesYes
) {
    return (
        <React.Fragment>
            <div class='card-content-inner-container'>
                <div class='card-content'>
                    <h1 data-heading='true' class='settings-title'>
                        Shows Settings
                    </h1>
                    <h3 className='figcaption-text'>
                        Indicate which Spotify information you are interested in.
                        On the following slides, you have the choice of track, artist and playlist information.
                        You can also select the correct setting for user information.
                        To do this, confirm the checkbox for the corresponding setting.
                    </h3>
                    <h3 className='figcaption-text' style={{ paddingTop: '1em' }}>
                        On this slide, the options 'Get User's Saved Shows' and 'Get User's Saved Episodes' can be selected.
                        <br></br>
                        If you do not prefer either option, slide to the next page.
                    </h3>
                    {showsContentSettings(
                        savedShowsChecked, setSavedShowsChecked,
                        savedShowsLimit, setSavedShowsLimit,
                        confirmSavedShowsYes, setConfirmSavedShowsYes,
                        savedEpisodesChecked, setSavedEpisodesChecked,
                        savedEpisodesLimit, setSavedEpisodesLimit,
                        confirmSavedEpisodesYes, setConfirmSavedEpisodesYes
                    )}
                </div>
            </div>
        </React.Fragment>
    )
}