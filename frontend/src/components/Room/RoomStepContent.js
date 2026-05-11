import React from "react";

import { DATA_TYPE_ORDER, DATA_TYPES } from "../../constants/dataTypes";

import CircularLoading from "./CircularLoading";
import TrackResultList from "./resultList";
import ArtistResultList from "./resultListArtists";
import PlaylistResultList from "./resultListPlaylists";
import ShowResultList from "./resultListShows";
import EpisodeResultList from "./resultListEpisodes";

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
                    {type === DATA_TYPES.SAVED_TRACKS || type === DATA_TYPES.TOP_TRACKS || type === DATA_TYPES.RECENT_TRACKS ? (
                        list.length > 0 ? (
                            <TrackResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <CircularLoading language={language} />
                        )
                    ) : null}

                    {type === DATA_TYPES.TOP_ARTISTS || type === DATA_TYPES.FOLLOWED_ARTISTS ? (
                        list.length > 0 ? (
                            <ArtistResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <CircularLoading language={language} />
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
                            <CircularLoading language={language} />
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
                            <CircularLoading language={language} />
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
                            <CircularLoading language={language} />
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
