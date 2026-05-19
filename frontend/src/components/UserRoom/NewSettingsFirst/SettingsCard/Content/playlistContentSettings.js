import * as React from "react";
import { Checkbox } from "@mui/material";
import { marks } from './Components/settingsConst';
import PublicCheck, { PrivateTracksCheck, confirmCheck } from "./Components/ConfirmCheck";
import LimitComponent from "./Components/limitComponent";
import { BoundedNumberField } from "./Components/BoundedNumberField";

export function playlistContentSettings(
    currentPlaylistsChecked, setCurrentPlaylistsChecked,
    currentPlaylistsLimit, setCurrentPlaylistsLimit,
    confirmCurrentPlaylistsYes, setConfirmCurrentPlaylistsYes,
    checkPublic, setCheckPublic,
    checkPrivateTracks, setCheckPrivateTracks
) {
    return (
        <React.Fragment>
            <div>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Current User's Playlists
                </h2>
                <h2 class='figcaption-text'>
                    Get a list of the playlists owned or followed by the current Spotify user.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={currentPlaylistsChecked}
                            onChange={(e) => {
                                setCurrentPlaylistsChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <BoundedNumberField
                                label="Limit"
                                value={currentPlaylistsLimit}
                                onChange={setCurrentPlaylistsLimit}
                                min={1}
                                max={200}
                                step={1}
                            />
                            {confirmCheck(confirmCurrentPlaylistsYes, setConfirmCurrentPlaylistsYes)}
                            {PublicCheck(checkPublic, setCheckPublic)}
                            {checkPublic && PrivateTracksCheck(checkPrivateTracks, setCheckPrivateTracks)}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}