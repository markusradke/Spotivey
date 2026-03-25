import React from "react";

import { DATA_TYPE_ORDER } from "../../constants/dataTypes";

import LoadingPanel from "./LoadingPanel";
import TrackResultList from "./resultList";
import ArtistResultList from "./resultListArtists";
import PlaylistResultList from "./resultListPlaylists";

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
                    {index <= 2 ? (
                        list.length > 0 ? (
                            <TrackResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <LoadingPanel language={language} />
                        )
                    ) : null}

                    {index === 3 || index === 4 ? (
                        list.length > 0 ? (
                            <ArtistResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <LoadingPanel language={language} />
                        )
                    ) : null}

                    {index === 5 ? (
                        list.length > 0 ? (
                            <PlaylistResultList
                                items={items}
                                checkArray={checkArray}
                                setCheckArray={setCheckArray}
                                categoryIndex={index}
                            />
                        ) : (
                            <LoadingPanel language={language} />
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
