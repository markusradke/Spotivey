import * as React from "react";
import { Checkbox, Slider } from "@mui/material";
import { marks } from './Components/settingsConst';
import { confirmCheck } from "./Components/ConfirmCheck";
import LimitComponent from "./Components/limitComponent";
import TimeRangeComponent from "./Components/TimeRangeComponent";

export function usersContentSettings(
    currentUsersChecked, setCurrentUsersChecked,
    topItemsTracksShortTermChecked, setTopItemsTracksShortTermChecked,
    topItemsTracksShortTermLimit, setTopItemsTracksShortTermLimit,
    topItemsTracksMediumTermChecked, setTopItemsTracksMediumTermChecked,
    topItemsTracksMediumTermLimit, setTopItemsTracksMediumTermLimit,
    topItemsTracksLongTermChecked, setTopItemsTracksLongTermChecked,
    topItemsTracksLongTermLimit, setTopItemsTracksLongTermLimit,
    topItemsArtistsShortTermChecked, setTopItemsArtistsShortTermChecked,
    topItemsArtistsShortTermLimit, setTopItemsArtistsShortTermLimit,
    topItemsArtistsMediumTermChecked, setTopItemsArtistsMediumTermChecked,
    topItemsArtistsMediumTermLimit, setTopItemsArtistsMediumTermLimit,
    topItemsArtistsLongTermChecked, setTopItemsArtistsLongTermChecked,
    topItemsArtistsLongTermLimit, setTopItemsArtistsLongTermLimit,
    followedArtistsChecked, setFollowedArtistsChecked,
    followedArtistsLimit, setFollowedArtistsLimit,
    confirmTopItemsTracksShortTermYes, setConfirmTopItemsTracksShortTermYes,
    confirmTopItemsTracksMediumTermYes, setConfirmTopItemsTracksMediumTermYes,
    confirmTopItemsTracksLongTermYes, setConfirmTopItemsTracksLongTermYes,
    confirmTopItemsArtistsShortTermYes, setConfirmTopItemsArtistsShortTermYes,
    confirmTopItemsArtistsMediumTermYes, setConfirmTopItemsArtistsMediumTermYes,
    confirmTopItemsArtistsLongTermYes, setConfirmTopItemsArtistsLongTermYes,
    confirmFollowedArtistsYes, setConfirmFollowedArtistsYes
) {
    return (
        <React.Fragment>
            <React.Fragment>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Current User's Profile
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={currentUsersChecked}
                            onChange={(e) => {
                                setCurrentUsersChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <h2 class='figcaption-text'>
                                Select this option to get profile information about the current user (only the information about the user's Spotify subscription level, the total number of followers and the user's country.).
                            </h2>
                        </div>
                    </div>
                </div>
            </React.Fragment>
            <React.Fragment>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get User's Top Items (Tracks)
                </h2>
                <h2 class='figcaption-text'>
                    Select these options to get the current user's top tracks based on calculated affinity.
                </h2>
                <br></br>
                <h3>Short Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsTracksShortTermChecked}
                            onChange={(e) => {
                                setTopItemsTracksShortTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-valuetext='tracks'
                                aria-label="SliderTopItemsShortTermTracks"
                                value={topItemsTracksShortTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsTracksShortTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsTracksShortTermYes, setConfirmTopItemsTracksShortTermYes)}
                    </div>
                </div>
                <h3>Medium Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsTracksMediumTermChecked}
                            onChange={(e) => {
                                setTopItemsTracksMediumTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-valuetext='tracks'
                                aria-label="SliderTopItemsMediumTermTracks"
                                value={topItemsTracksMediumTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsTracksMediumTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsTracksMediumTermYes, setConfirmTopItemsTracksMediumTermYes)}
                    </div>
                </div>
                <h3>Long Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsTracksLongTermChecked}
                            onChange={(e) => {
                                setTopItemsTracksLongTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-valuetext='tracks'
                                aria-label="SliderTopItemsLongTermTracks"
                                value={topItemsTracksLongTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsTracksLongTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsTracksLongTermYes, setConfirmTopItemsTracksLongTermYes)}
                    </div>
                </div>
            </React.Fragment>
            <React.Fragment>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get User's Top Items (Artists)
                </h2>
                <h2 class='figcaption-text'>
                    Select these options to get the current user's top artists based on calculated affinity.
                </h2>
                <br></br>
                <h3>Short Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsArtistsShortTermChecked}
                            onChange={(e) => {
                                setTopItemsArtistsShortTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-label="SliderTopItemsShortTermArtist"
                                value={topItemsArtistsShortTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsArtistsShortTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsArtistsShortTermYes, setConfirmTopItemsArtistsShortTermYes)}
                    </div>
                </div>
                <h3>Medium Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsArtistsMediumTermChecked}
                            onChange={(e) => {
                                setTopItemsArtistsMediumTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-label="SliderTopItemsMediumTermArtist"
                                value={topItemsArtistsMediumTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsArtistsMediumTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsArtistsMediumTermYes, setConfirmTopItemsArtistsMediumTermYes)}
                    </div>
                </div>
                <h3>Long Term</h3>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={topItemsArtistsLongTermChecked}
                            onChange={(e) => {
                                setTopItemsArtistsLongTermChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-label="SliderTopItemsLongTermArtists"
                                value={topItemsArtistsLongTermLimit}
                                onChange={(e, newValue) => {
                                    setTopItemsArtistsLongTermLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                        </div>
                        {confirmCheck(confirmTopItemsArtistsLongTermYes, setConfirmTopItemsArtistsLongTermYes)}
                    </div>
                </div>
            </React.Fragment>
            <React.Fragment>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Followed Artists
                </h2>
                <h2 class='figcaption-text'>
                    Select this option to get the current user's followed artists.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={followedArtistsChecked}
                            onChange={(e) => {
                                setFollowedArtistsChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent />
                            <Slider
                                aria-label="SliderFollowedArtists"
                                value={followedArtistsLimit}
                                onChange={(e, newValue) => {
                                    setFollowedArtistsLimit(newValue);
                                }}
                                min={1}
                                max={50}
                                step={1}
                                marks={marks}
                                valueLabelDisplay='auto'
                            />
                            {confirmCheck(confirmFollowedArtistsYes, setConfirmFollowedArtistsYes)}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        </React.Fragment>
    );
}