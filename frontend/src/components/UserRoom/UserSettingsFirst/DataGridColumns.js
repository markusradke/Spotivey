import * as React from "react";
import { Tooltip, Typography } from '@mui/material';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

function renderCellSpotifyText(params) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {
        params.value.check ?
          params.field !== "profile" ?
            <Tooltip
              title={
                params.field === "saved_tracks" && params.value.market != '' ?
                  <Typography>
                    limit: {params.value.limit} <br></br> market: {params.value.market} <br></br> confirm: {params.value.confirmCheck.toString()}
                  </Typography> :
                  params.field === "current_playlists" ?
                    <Typography>
                      limit: {params.value.limit} <br></br> {params.value.public ? 'Any Playlists' : 'Public Playlists'} <br></br> confirm: {params.value.confirmCheck.toString()}
                    </Typography> :
                    <Typography>
                      limit: {params.value.limit} <br></br> confirm: {params.value.confirmCheck.toString()}
                    </Typography>
              }
              placement="top"
            >
              <CheckBoxOutlinedIcon />
            </Tooltip> :
            <CheckBoxOutlinedIcon /> :
          null
      }
    </div>
  )
}

export const columns = [
  { field: 'id', headerName: 'Profile ID', width: 140 },
  {
    field: 'nameUmfrage',
    headerName: 'Survey Name',
    width: 150,
  },
  {
    field: 'umfrageID',
    headerName: 'Survey ID',
    width: 150,
  },
  {
    field: 'saved_tracks',
    width: 200,
    height: 100,
    headerName: 'Saved Tracks',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'recently_played',
    width: 200,
    headerName: 'Recently Played Tracks',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'profile',
    width: 150,
    headerName: 'User Profile',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_tracks_shortterm',
    width: 200,
    headerName: "Top Tracks (Short Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_tracks_mediumterm',
    width: 200,
    headerName: "Top Tracks (Medium Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_tracks_longterm',
    width: 200,
    headerName: "Top Tracks (Long Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },

  {
    field: 'top_artists_shortterm',
    width: 200,
    headerName: "Top Artists (Short Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_artists_mediumterm',
    width: 200,
    headerName: "Top Artists (Medium Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_artists_longterm',
    width: 200,
    headerName: "Top Artists (Long Term)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'followed_artists',
    width: 200,
    headerName: "Followed Artists",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'current_playlists',
    width: 200,
    headerName: "Playlists",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'saved_shows',
    width: 200,
    headerName: "Saved Shows",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'saved_episodes',
    width: 200,
    headerName: "Saved Episodes",
    renderCell: (params) => renderCellSpotifyText(params),
  }

];

export const columnsSecondSurvey = [
  { field: 'id', headerName: 'Profile ID', width: 140 },
  {
    field: 'nameSettings',
    headerName: 'Survey Name',
    width: 150,
  },
  {
    field: 'umfrageIDsecond',
    headerName: 'Umfrage-ID (2nd Survey)',
    width: 150,
    hide: true,
  },
  {
    field: 'secondSurveyServer',
    headerName: 'Server Name (2nd Survey)',
    width: 200,
    height: 100,
    hide: true,
  },
  {
    field: 'secondSurveyLanguage',
    headerName: 'Language (2nd Survey)',
    width: 200,
    height: 100,
    hide: true,
  },
  {
    field: 'umfrageID',
    hide: true,
  },
  {
    field: 'endURL',
    headerName: 'Follow-Up URL',
    width: 500,
  }
];