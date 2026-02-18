import React, { Component } from "react";
import { Checkbox } from '@mui/material';
import { IndexKind } from "typescript";

export default function resultListPlaylist (
    list, title, checkArray, setCheckArray, i
    ) {

    function handleCheckboxClicked (e, index) {
        let items = [...checkArray];
        items[i][index] =  e.target.checked;
        setCheckArray(items)
    }

    return(
        <React.Fragment>
            {list.map((playlists, index) => { 
                return(
                    <React.Fragment key={index}>
                        <div className={"result-list-card-outer"}>
                            <div className="result-list-card-outer-container">
                                <div className="result-list-card-container">
                                    {playlists.playlist_cover && (
                                        <img class={"result-list-img"} src={playlists.playlist_cover} alt={playlists.playlist_name} />
                                    )}
                                    <div className="result-list-card-container-outer">
                                        <div className="result-list-card-container-inner">
                                            <body1 className="result-list-card-script-track-name">
                                                {playlists.playlist_name} 
                                            </body1>
                                            <body1 className="result-list-card-script-artist-string"> 
                                                {playlists.n_tracks} tracks || Owner: {playlists.is_self_owned ? "You" : "Other"} || Collaborative: {playlists.is_collaborative ? "Yes" : "No"}
                                            </body1>
                                        </div>
                                    </div>
                                    <div className={"result-list-checkbox"}>
                                        <Checkbox
                                            checked={checkArray[i][index]}
                                            onClick={(e) => {
                                                handleCheckboxClicked(e, index)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            )}
        </React.Fragment>
    )
}