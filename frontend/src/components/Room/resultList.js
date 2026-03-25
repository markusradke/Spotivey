import React from "react";
import { Checkbox } from '@mui/material';

export default function TrackResultList({
    items,
    checkArray,
    setCheckArray,
    categoryIndex,
}) {

    function handleCheckboxClicked(e, itemIndex) {
        const next = [...checkArray];
        if (!next[categoryIndex]) {
            next[categoryIndex] = [];
        }
        next[categoryIndex][itemIndex] = e.target.checked;
        setCheckArray(next);
    }

    return (
        <React.Fragment>
            {items.map((track, itemIndex) => (
                <div key={track.id ?? track.spotify_id ?? itemIndex} className="result-list-card-outer">
                    <div className="result-list-card-outer-container">
                        <div className="result-list-card-container">
                            <img
                                className="result-list-img"
                                src={track.image_url}
                                alt={track.track_name}
                            />
                            <div className="result-list-card-container-inner">
                                <body1 className="result-list-card-script-track-name">
                                    {track.track_name}
                                </body1>
                                <body1 className="result-list-card-script-artist-string">
                                    by: {track.spotify_artist_string}
                                </body1>
                            </div>
                            <div className="result-list-checkbox">
                                <Checkbox
                                    checked={Boolean(checkArray?.[categoryIndex]?.[itemIndex])}
                                    onChange={(e) => handleCheckboxClicked(e, itemIndex)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </React.Fragment>
    );
}