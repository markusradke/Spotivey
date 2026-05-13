import React from "react";
import ConfirmableCard from "./shared/ConfirmableCard";

export default function CurrentPlaylistList({
    playlists,
    checked,
    onToggleItem,
}) {
    return (
        <>
            {playlists.map((playlist, index) => (
                <ConfirmableCard
                    key={playlist.spotify_id}
                    imageUrl={playlist.image_url}
                    title={playlist.playlist_name}
                    subtitle={`${playlist.n_tracks} tracks || Owner: ${playlist.is_self_owned ? "You" : "Other"
                        } || Collaborative: ${playlist.is_collaborative ? "Yes" : "No"}`}
                    checked={checked[index] || false}
                    onToggle={(e) => onToggleItem(index, e.target.checked)}
                />
            ))}
        </>
    );
}