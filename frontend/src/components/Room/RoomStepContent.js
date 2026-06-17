import React from "react";

import { DATA_TYPE_ORDER, DATA_TYPES } from "../../constants/dataTypes";

import TrackResultList from "./resultList";
import ArtistResultList from "./resultListArtists";
import PlaylistResultList from "./resultListPlaylists";
import ShowResultList from "./resultListShows";
import EpisodeResultList from "./resultListEpisodes";
import { Typography } from "@mui/material";

export default function RoomStepContent({
    step,
    language,
    spotifyData,
    settings,
    checkArray,
    setCheckArray,
}) {
    const index = step.index;
    const type = DATA_TYPE_ORDER[index];
    const list = spotifyData[type] ?? [];
    const count = settings?.[type]?.limit ?? list.length;
    const items = list.slice(0, count);

    return (
        <div className="render-result-container">
            <div className="render-result-container-inner">
                <div className="render-result">
                    {type === DATA_TYPES.SAVED_TRACKS || type === DATA_TYPES.TOP_TRACKS_SHORTTERM || type === DATA_TYPES.TOP_TRACKS_MEDIUMTERM || type === DATA_TYPES.TOP_TRACKS_LONGTERM || type === DATA_TYPES.RECENT_TRACKS ? (
                        list.length > 0 ? (
                            <TrackResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <Typography variant="body1" align="center">
                                {language === "de"
                                    ? "Keine Tracks gefunden."
                                    : "No tracks found."}
                            </Typography>
                        )
                    ) : null}

                    {type === DATA_TYPES.TOP_ARTISTS_SHORTTERM || type === DATA_TYPES.TOP_ARTISTS_MEDIUMTERM || type === DATA_TYPES.TOP_ARTISTS_LONGTERM || type === DATA_TYPES.FOLLOWED_ARTISTS ? (
                        list.length > 0 ? (
                            <ArtistResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <Typography variant="body1" align="center">
                                {language === "de"
                                    ? "Keine Artists gefunden."
                                    : "No artists found."}
                            </Typography>
                        )
                    ) : null}

                    {type === DATA_TYPES.CURRENT_PLAYLISTS ? (
                        list.length > 0 ? (
                            <PlaylistResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <Typography variant="body1" align="center">
                                {language === "de"
                                    ? "Keine Playlists gefunden."
                                    : "No playlists found."}
                            </Typography>
                        )
                    ) : null}

                    {type === DATA_TYPES.SAVED_SHOWS ? (
                        list.length > 0 ? (
                            <ShowResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <Typography variant="body1" align="center">
                                {language === "de"
                                    ? "Keine gespeicherten Shows gefunden."
                                    : "No saved shows found."}
                            </Typography>
                        )
                    ) : null}

                    {type === DATA_TYPES.SAVED_EPISODES ? (
                        list.length > 0 ? (
                            <EpisodeResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <Typography variant="body1" align="center">
                                {language === "de"
                                    ? "Keine gespeicherten Episoden gefunden."
                                    : "No saved episodes found."}
                            </Typography>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
