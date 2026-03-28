import React from "react";
import { Checkbox } from '@mui/material';

export default function ArtistResultList({
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
            {items.map((artist, itemIndex) => (
                <div
                    key={artist.id ?? artist.spotify_id ?? itemIndex}
                    className="result-list-card-outer"
                >
                    <div className="result-list-card-outer-container">
                        <div className="result-list-card-container">
                            <img
                                className="result-list-img artist-img"
                                src={artist.image_url}
                                alt={artist.artist}
                            />
                            <div className="result-list-card-container-inner">
                                <body1 className="result-list-card-script-track-name">
                                    {artist.artist}
                                </body1>
                                <body1 className="result-list-card-script-artist-string">
                                    Genre: {artist.genre_string}
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