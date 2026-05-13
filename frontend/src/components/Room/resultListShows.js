import React from "react";
import { Checkbox } from '@mui/material';

export default function ShowResultList({
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
            {items.map((show, itemIndex) => (
                <div
                    key={show.id ?? show.spotify_id ?? itemIndex}
                    className="result-list-card-outer"
                >
                    <div className="result-list-card-outer-container">
                        <div className="result-list-card-container">
                            {show.image_url && (
                                <img
                                    className="result-list-img"
                                    src={show.image_url}
                                    alt={show.show_name}
                                />
                            )}
                            <div className="result-list-card-container-outer">
                                <div className="result-list-card-container-inner">
                                    <body1 className="result-list-card-script-track-name">
                                        {show.show_name}
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