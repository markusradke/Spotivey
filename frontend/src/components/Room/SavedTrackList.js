import React from "react";
import ConfirmableCard from "./shared/ConfirmableCard";

export default function SavedTrackList({
    tracks,
    checked,
    onToggleItem,
}) {
    return (
        <>
            {tracks.map((track, index) => (
                <ConfirmableCard
                    key={track.spotify_id}
                    imageUrl={track.image_url}
                    title={track.track_name}
                    subtitle={`by: ${track.spotify_artist_string}`}
                    checked={checked[index] || false}
                    onToggle={(e) => onToggleItem(index, e.target.checked)}
                />
            ))}
        </>
    );
}