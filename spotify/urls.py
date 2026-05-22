from django.urls import path
from .views import (
    AuthURL, spotify_callback, IsAuthenticated, GetTopArtistsShortTerm, GetTopArtistsMediumTerm, GetTopArtistsLongTerm, GetFollowedArtistsSpotify,
    GetTopTracksShortTerm, GetTopTracksMediumTerm, GetTopTracksLongTerm, GetSavedTracksSpotify, GetRecentlyPlayedTracksSpotify,
    GetPlaylistsSpotify, GetUsersProfileSpotify, GetSavedShowsSpotify, GetSavedEpisodesSpotify,
    WrappedSummary, WrappedSummarySave
)

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('top-artists/short-term', GetTopArtistsShortTerm.as_view()),
    path('top-artists/medium-term', GetTopArtistsMediumTerm.as_view()),
    path('top-artists/long-term', GetTopArtistsLongTerm.as_view()),
    path('top-tracks/short-term', GetTopTracksShortTerm.as_view()),
    path('top-tracks/medium-term', GetTopTracksMediumTerm.as_view()),
    path('top-tracks/long-term', GetTopTracksLongTerm.as_view()),
    path('saved-tracks', GetSavedTracksSpotify.as_view()),
    path('users-profile', GetUsersProfileSpotify.as_view()),
    path('followed-artists', GetFollowedArtistsSpotify.as_view()),
    path('current-playlists', GetPlaylistsSpotify.as_view()),
    path('recently-played-tracks', GetRecentlyPlayedTracksSpotify.as_view()),
    path('saved-shows', GetSavedShowsSpotify.as_view()),
    path('saved-episodes', GetSavedEpisodesSpotify.as_view()),
    path('wrapped/summary/save', WrappedSummarySave.as_view()),
    path('wrapped/summary', WrappedSummary.as_view()),
]