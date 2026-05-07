from django.urls import path
from .views import (
    AuthURL, spotify_callback, IsAuthenticated, TopArtists, GetFollowedArtistsSpotify,
    GetTopTracks, GetSavedTracksSpotify, GetRecentlyPlayedTracksSpotify,
    GetPlaylistsSpotify, GetUsersProfileSpotify
)

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('top-artists', TopArtists.as_view()),
    path('top-tracks', GetTopTracks.as_view()),
    path('saved-tracks', GetSavedTracksSpotify.as_view()),
    path('users-profile', GetUsersProfileSpotify.as_view()),
    path('followed-artists', GetFollowedArtistsSpotify.as_view()),
    path('current-playlists', GetPlaylistsSpotify.as_view()),
    path('recently-played-tracks', GetRecentlyPlayedTracksSpotify.as_view()),
]