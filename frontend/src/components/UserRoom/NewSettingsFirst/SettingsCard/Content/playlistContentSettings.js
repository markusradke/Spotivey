import * as React from "react";
import { Checkbox, Stack, Slider, Typography } from "@mui/material";
import { marks } from './Components/settingsConst';
import PublicCheck, { PrivateTracksCheck, confirmCheck } from "./Components/ConfirmCheck";
import LimitComponent from "./Components/limitComponent";
import { BoundedNumberField } from "./Components/BoundedNumberField";

export function playlistContentSettings(
    currentPlaylistsChecked, setCurrentPlaylistsChecked,
    currentPlaylistsLimit, setCurrentPlaylistsLimit,
    confirmCurrentPlaylistsYes, setConfirmCurrentPlaylistsYes,
    checkPublic, setCheckPublic,
    checkPrivateTracks, setCheckPrivateTracks,
    privatetracksMaxPlaylists, setPrivatetracksMaxPlaylists,
    privatetracksMaxTracks, setPrivatetracksMaxTracks
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
                        {checkPrivateTracks && (
                            <div class='settings-slider-container'>
                                <Stack direction="column" spacing={1.25} alignItems="center">
                                    <h3 className='figcaption-text'>
                                        If you want to get private tracks, you can specify the maximum number of playlists and tracks per playlist to be retrieved.
                                    </h3>
                                    <BoundedNumberField
                                        label="Max Playlists"
                                        value={privatetracksMaxPlaylists}
                                        onChange={setPrivatetracksMaxPlaylists}
                                        min={1}
                                        max={200}
                                        step={1}
                                    />
                                    <Typography id="max-tracks-per-playlist-label" variant="body2">
                                        Max Tracks per Playlist
                                    </Typography>
                                    {/* make slider for max tracks per playlist */}
                                    <Slider
                                        aria-label="Max Tracks per Playlist"
                                        valueLabelDisplay="auto"
                                        value={privatetracksMaxTracks}
                                        onChange={(e, value) => setPrivatetracksMaxTracks(value)}
                                        step={50}
                                        marks
                                        min={50}
                                        max={500}
                                    />
                                </Stack>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}