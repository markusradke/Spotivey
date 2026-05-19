import * as React from "react";
import { Checkbox, Slider } from "@mui/material";
import ISO3166_1 from './Components/iso';
import { marks } from './Components/settingsConst';
import { confirmCheck } from "./Components/ConfirmCheck";
import LimitComponent from "./Components/limitComponent";
import MarketComponent from "./Components/MarketComponent";
import { BoundedNumberField } from "./Components/BoundedNumberField";


export function tracksContentSettings(
    savedTracksChecked, setSavedTracksChecked,
    savedTracksLimit, setSavedTracksLimit,
    tracksMarket, setTracksMarket,
    confirmSavedTracksYes, setConfirmSavedTracksYes,
    recentlyTracksChecked, setRecentlyTracksChecked,
    recentlyTracksLimit, setRecentlyTracksLimit,
    confirmRecentlyTracksYes, setConfirmRecentlyTracksYes,
    setStateTextST, stateTextST, setStateTextRT, stateTextRT
) {
    return (
        <React.Fragment>
            <React.Fragment>
                <h2 class='settings-content-item-title'>
                    Get User's Saved Tracks
                </h2>
                <h2 class='figcaption-text'>
                    Get a list of the songs saved in the current Spotify user's 'Your Music' library.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            checked={savedTracksChecked}
                            onChange={(e) => {
                                setSavedTracksChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent maximum={1000} />
                            <BoundedNumberField
                                label="Limit"
                                value={savedTracksLimit}
                                onChange={setSavedTracksLimit}
                                min={1}
                                max={1000}
                                step={1}
                            />
                        </div>
                        <MarketComponent />
                        <div className={'autocomplete-container'}>
                            <ISO3166_1 props={[tracksMarket, setTracksMarket]} />
                        </div>
                        {confirmCheck(confirmSavedTracksYes, setConfirmSavedTracksYes)}
                    </div>
                </div>
                <div className="confirm-check-container-outer">

                </div>
                <h2 data-heading='true' class='settings-content-item-title'>
                    Get Recently Played Tracks
                </h2>
                <h2 class='figcaption-text'>
                    Get tracks from the current user's recently played tracks. <br></br> Note: Currently doesn't support podcast episodes.
                </h2>
                <div class='spotify-container'>
                    <div class='spotify-check'>
                        <Checkbox
                            color="primary"
                            checked={recentlyTracksChecked}
                            onChange={(e) => {
                                setRecentlyTracksChecked(e.target.checked);
                            }}
                            style={{
                                color: "#C40D1E"
                            }}
                        />
                    </div>
                    <div class='spotify-items'>
                        <div class='settings-slider-container'>
                            <LimitComponent maximum={50} />
                            <BoundedNumberField
                                label="Limit"
                                value={recentlyTracksLimit}
                                onChange={setRecentlyTracksLimit}
                                min={1}
                                max={50}
                                step={1}
                            />
                            {confirmCheck(confirmRecentlyTracksYes, setConfirmRecentlyTracksYes)}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        </React.Fragment>
    );
}