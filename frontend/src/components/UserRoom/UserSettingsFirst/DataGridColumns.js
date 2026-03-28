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
                  params.field === "top_tracks" || params.field === "top_artists" ?
                    <Typography>
                      limit: {params.value.limit} <br></br> time_range: {params.value.timeRange} <br></br> confirm: {params.value.confirmCheck.toString()}
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
    headerName: 'Get User\'s Saved Tracks',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'recently_played',
    width: 200,
    headerName: 'Get Last Played Tracks',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'profile',
    width: 150,
    headerName: 'Get User\'s Profile',
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_tracks',
    width: 200,
    headerName: "Get User's Top Items (Tracks)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'top_artists',
    width: 200,
    headerName: "Get User's Top Items (Artists)",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'followed_artists',
    width: 200,
    headerName: "Get User's Followed Artists",
    renderCell: (params) => renderCellSpotifyText(params),
  },
  {
    field: 'current_playlists',
    width: 200,
    headerName: "Get User's Playlists",
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