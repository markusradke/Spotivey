import React from "react";
import { Checkbox } from '@mui/material';

export default function EpisodeResultList({
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
            {items.map((episode, itemIndex) => (
                <div
                    key={episode.id ?? episode.spotify_id ?? itemIndex}
                    className="result-list-card-outer"
                >
                    <div className="result-list-card-outer-container">
                        <div className="result-list-card-container">
                            {episode.show_image_url && (
                                <img
                                    className="result-list-img"
                                    src={episode.show_image_url}
                                    alt={episode.show_name}
                                />
                            )}
                            <div className="result-list-card-container-outer">
                                <div className="result-list-card-container-inner">
                                    <body1 className="result-list-card-script-track-name">
                                        {episode.name}
                                    </body1>
                                    <body1 className="result-list-card-script-track-name">
                                        {episode.show_name}
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