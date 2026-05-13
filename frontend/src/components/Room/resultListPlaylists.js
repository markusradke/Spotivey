import React from "react";
import { Checkbox } from '@mui/material';

export default function PlaylistResultList({
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
            {items.map((playlist, itemIndex) => (
                <div
                    key={playlist.id ?? playlist.spotify_id ?? itemIndex}
                    className="result-list-card-outer"
                >
                    <div className="result-list-card-outer-container">
                        <div className="result-list-card-container">
                            {playlist.image_url && (
                                <img
                                    className="result-list-img"
                                    src={playlist.image_url}
                                    alt={playlist.playlist_name}
                                />
                            )}
                            <div className="result-list-card-container-outer">
                                <div className="result-list-card-container-inner">
                                    <body1 className="result-list-card-script-track-name">
                                        {playlist.playlist_name}
                                    </body1>
                                    <body1 className="result-list-card-script-artist-string">
                                        {playlist.n_tracks} tracks || Owner:{" "}
                                        {playlist.is_self_owned ? "You" : "Other"} || Collaborative:{" "}
                                        {playlist.is_collaborative ? "Yes" : "No"}
                                    </body1>
                                </div>
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