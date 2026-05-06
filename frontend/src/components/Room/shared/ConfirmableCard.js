import React from "react";
import { Checkbox } from "@mui/material";

export default function ConfirmableCard({
    imageUrl,
    title,
    subtitle,
    checked,
    onToggle,
}) {
    return (
        <div className="result-list-card-outer">
            <div className="result-list-card-outer-container">
                <div className="result-list-card-container">
                    <img
                        className="result-list-img"
                        src={imageUrl}
                        alt={title}
                    />
                    <div className="result-list-card-container-inner">
                        <div className="result-list-card-script-track-name">
                            {title}
                        </div>
                        <div className="result-list-card-script-artist-string">
                            {subtitle}
                        </div>
                    </div>
                    <div className="result-list-checkbox">
                        <Checkbox
                            checked={checked}
                            onChange={onToggle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}