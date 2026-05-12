import * as React from "react";
import { usersContentSettings } from "./Content/usersContentSettings";

export function usersSettingsCard(
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
            <div class='card-content-inner-container'>
                <div class='card-content'>
                    <h1 data-heading='true' class='settings-title'>
                        User's Settings
                    </h1>
                    <h3 className='figcaption-text'>
                        Indicate which Spotify information you are interested in.
                        On the following slides, you have the choice of track, artist and playlist information.
                        You can also select the correct setting for user information.
                        To do this, confirm the checkbox for the corresponding setting.
                    </h3>
                    <h3 className='figcaption-text' style={{ paddingTop: '1em' }}>
                        On this slide, the options 'Get Current User's Profile', 'Get User's Top Items (Tracks)',
                        'Get User's Top Items (Artists)' and 'Get Followed Artists' can be selected.
                        <br></br>
                        If you do not prefer either option, slide to the next page.
                    </h3>
                    {usersContentSettings(
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
                    )}
                </div>
            </div>
        </React.Fragment>
    )
}