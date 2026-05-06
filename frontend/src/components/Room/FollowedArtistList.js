import React from "react";
import ConfirmableCard from "./shared/ConfirmableCard";

export default function FollowedArtistList({
    artists,
    checked,
    onToggleItem,
}) {
    return (
        <>
            {artists.map((artist, index) => (
                <ConfirmableCard
                    key={artist.id}
                    imageUrl={artist.image_url}
                    title={artist.artist}
                    subtitle={`Genre: ${artist.genre_string}`}
                    checked={checked[index] || false}
                    onToggle={(e) => onToggleItem(index, e.target.checked)}
                />
            ))}
        </>
    );
}