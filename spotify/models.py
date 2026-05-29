import json
from turtle import mode
from django.db import models
from api.models import RetrievalSetting

class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

    def __str__(self):
        return self.user

class Participant(models.Model):
    participant = models.IntegerField(default=None)
    settings = models.ForeignKey(RetrievalSetting, on_delete=models.PROTECT)
    retrieval_session_key = models.CharField(max_length=50, unique=True, default='')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='in_progress')
    email_saved = models.BooleanField(default=False)
    total_saved_tracks = models.IntegerField(null=True, default=None)
    total_top_tracks_shortterm = models.IntegerField(null=True, default=None)
    total_top_tracks_mediumterm = models.IntegerField(null=True, default=None)
    total_top_tracks_longterm = models.IntegerField(null=True, default=None)
    total_top_artists_shortterm = models.IntegerField(null=True, default=None)
    total_top_artists_mediumterm = models.IntegerField(null=True, default=None) 
    total_top_artists_longterm = models.IntegerField(null=True, default=None)
    total_followed_artists = models.IntegerField(null=True, default=None)
    total_current_playlists = models.IntegerField(null=True, default=None)
    total_saved_shows = models.IntegerField(null=True, default=None)
    total_saved_episodes = models.IntegerField(null=True, default=None)
    country = models.CharField(max_length=20, default='')
    followers = models.IntegerField(null=True, default=None)
    product = models.CharField(max_length=50, default='')
    summary_confirmed_track_count = models.IntegerField(
        null=True, blank=True, default=None
    )
    summary_confirmed_artist_count = models.IntegerField(
        null=True, blank=True, default=None
    )
    summary_confirmed_playlist_count = models.IntegerField(
        null=True, blank=True, default=None
    )
    summary_confirmed_playlist_track_count = models.IntegerField(
        null=True, blank=True, default=None
    )

    summary_playlists_public_pct = models.FloatField(null=True, blank=True, default=None)
    summary_playlists_self_owned_pct = models.FloatField(null=True, blank=True, default=None)
    summary_playlists_avg_tracks = models.FloatField(null=True, blank=True, default=None)

    summary_mainstream_track_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_recent_track_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_top_tracks_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_saved_track_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_followed_artist_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_mainstream_artist_popularity_median = models.FloatField(
        null=True, blank=True, default=None
    )
    summary_mainstream_score = models.FloatField(null=True, blank=True, default=None)

    summary_saved_track_explicit_pct = models.FloatField(null=True, blank=True, default=None)
    summary_recent_track_explicit_pct = models.FloatField(null=True, blank=True, default=None)
    summary_top_tracks_explicit_pct = models.FloatField(null=True, blank=True, default=None)
    summary_explicit_pct = models.FloatField(null=True, blank=True, default=None)
    summary_release_year_median = models.FloatField(null=True, blank=True, default=None)
    summary_release_year_bins = models.JSONField(null=True, blank=True, default=None)

    summary_genre_counts = models.JSONField(null=True, blank=True, default=None)
    summary_top_genres = models.JSONField(null=True, blank=True, default=None)


    def __str__(self):
        return (
            str(self.participant)
            + " (retrieval settings: "
            + self.settings.nameUmfrage
            + ")"
        )
    
    def to_dict(self):
        return {
            'country': self.country,
            'followers': self.followers,
            'product': self.product,
        }

class BaseTrack(models.Model):
    """Abstract base model for all track types."""
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    confirmed = models.BooleanField(default=False)
    
    # Track identification
    spotify_id = models.CharField(max_length=50, db_index=True)
    isrc = models.CharField(max_length=20, default='')
    track_uri = models.CharField(max_length=100, default='')
    
    # Track metadata
    track_name = models.CharField(max_length=300, default='')
    duration_ms = models.IntegerField(null=True, default=None)
    explicit = models.BooleanField(null=True, default=None)
    popularity = models.IntegerField(null=True, default=None)
    
    # Album information
    album_id = models.CharField(max_length=50, default='')
    album_name = models.CharField(max_length=200, default='')
    album_label = models.CharField(max_length=200, default='')
    album_type = models.CharField(max_length=50, default='')
    release_date = models.CharField(max_length=20, default='')
    image_url = models.URLField(max_length=500, default='')
    
    # Artist information (comma-separated or JSON)
    artist_names = models.TextField(default='')
    artist_ids = models.TextField(default='')
    artist_genres = models.TextField(default='')
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['participant', 'spotify_id']),
        ]
    
    def get_base_dict(self):
        """Return common fields for frontend."""
        return {
            'track_name': self.track_name,
            'album_type': self.album_type,
            'duration_ms': self.duration_ms,
            'image_url': self.image_url,
            'explicit': self.explicit,
            'isrc': self.isrc,
            'spotify_id': self.spotify_id,
            'popularity': self.popularity,
            'spotify_artist_string': self.artist_names,
            'spotify_artist_id': json.loads(self.artist_ids),
            'track_uri': self.track_uri,
            'albumLabel': self.album_label,
            'albumName': self.album_name,
            'album_id': self.album_id,
            'releaseDate': self.release_date,
            'spotify_artist_genre': [g.strip() for g in self.artist_genres.split(', ') if g],
        }

    def __str__(self):
        return f"Track (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"


class SavedTrack(BaseTrack):
    """Participant's saved track."""
    added_at = models.DateTimeField(null=True, default=None)
    
    def to_dict(self): 
        data = self.get_base_dict()
        data['added_at'] = self.added_at
        return data


class TopTrackShortTerm(BaseTrack):
    """Participant's top track in the short term."""
    
    def to_dict(self): 
        return self.get_base_dict()
    
class TopTrackMediumTerm(BaseTrack):
    """Participant's top track in the medium term."""
    
    def to_dict(self): 
        return self.get_base_dict()
    
class TopTrackLongTerm(BaseTrack):
    """Participant's top track in the long term."""
    
    def to_dict(self): 
        return self.get_base_dict()
    

class RecentTrack(BaseTrack):
    """Participant's recently played track."""
    played_at = models.DateTimeField(null=True, default=None)
    context_type = models.CharField(max_length=50, default='')
    context_uri = models.CharField(max_length=200, default='')
    
    def to_dict(self): 
        data = self.get_base_dict()
        data.update({
            'played_at': self.played_at,
            'context_type': self.context_type,
            'context_uri': self.context_uri,
        })
        return data

class PrivatePlaylistTrack(BaseTrack):
    """Tracks for participant's private playlists. Will NOT consider Episodes in playlists."""

    playlist = models.ForeignKey('CurrentPlaylist', on_delete=models.CASCADE, related_name='tracks')
    added_at = models.DateTimeField(null=True, default=None)

    def __str__(self):
        return f"Track (ID: {self.spotify_id}) in playlist {self.playlist.playlist_name} for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"

    def to_dict(self): 
        data = self.get_base_dict()
        data['playlist_id'] = self.playlist.spotify_id
        data['added_at'] = self.added_at
        return data



class CurrentPlaylist(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, null= True, blank=True)
    spotify_id = models.CharField(max_length=100, default='')
    playlist_name = models.CharField(max_length=200, default='')
    image_url = models.URLField(max_length=500, default='')
    is_collaborative = models.BooleanField(null=True, default=None)
    is_public = models.BooleanField(null=True, default=None)
    is_self_owned = models.BooleanField(null=True, default=None)
    n_tracks = models.IntegerField(null=True, default=None)

    confirmed = models.BooleanField(default=False)   
    def __str__(self):
        return "Current playlist for participant " + self.participant.participant + " (retrieval settings: " + self.participant.settings.nameUmfrage + ")"

    def to_dict(self):
        return {
            'spotify_id': self.spotify_id,
            'playlist_name': self.playlist_name,
            'image_url': self.image_url,
            'is_collaborative': self.is_collaborative,
            'is_public': self.is_public,
            'is_self_owned': self.is_self_owned,
            'n_tracks': self.n_tracks,
        }


class BaseArtist(models.Model):
    """Abstract base model for all artist types."""
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    confirmed = models.BooleanField(default=False)
    
    # Artist identification
    spotify_id = models.CharField(max_length=50, db_index=True)
    
    # Artist metadata
    artist_name = models.CharField(max_length=300, default='')
    artist_type = models.CharField(max_length=50, default='')
    popularity = models.IntegerField(null=True, default=None)
    followers = models.IntegerField(null=True, default=None)
    image_url = models.URLField(max_length=500, default='')
    genre_string = models.TextField(default='')
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['participant', 'spotify_id']),
        ]
    
    def get_base_dict(self):
        """Return common fields for frontend."""
        return {
            'artist': self.artist_name,
            'type': self.artist_type,
            'popularity': self.popularity,
            'followers': self.followers,
            'image_url': self.image_url,
            'genre_string': self.genre_string,
            'id': self.spotify_id,
        }

    def __str__(self):
        return f"Artist (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"


class TopArtistShortTerm(BaseArtist):
    """Participant's top artist in the short term."""

    def to_dict(self):
        return self.get_base_dict()
    
class TopArtistMediumTerm(BaseArtist):
    """Participant's top artist in the medium term."""

    def to_dict(self):
        return self.get_base_dict()
    
class TopArtistLongTerm(BaseArtist):
    """Participant's top artist in the long term."""

    def to_dict(self):
        return self.get_base_dict()


class FollowedArtist(BaseArtist):
    """Participant's followed artist."""
    
    def to_dict(self):
        return self.get_base_dict()


class BaseShow(models.Model):
    """Abstract base model for all show types."""
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    confirmed = models.BooleanField(default=False)
    
    show_name = models.CharField(max_length=500, default='')
    show_languages = models.CharField(max_length=50, default='')
    show_description = models.TextField(default='')
    image_url = models.URLField(max_length=500, default='')
    show_total_episodes = models.IntegerField(null=True, default=None)
    show_media_type = models.CharField(max_length=50, default='')
    show_publisher = models.CharField(max_length=200, default='')

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['participant', 'spotify_id']),
        ]

    def get_base_dict(self):
        """Return common fields for frontend."""
        return {
            'show_name': self.show_name,
            'show_languages': self.show_languages,
            'show_description': self.show_description,
            'image_url': self.image_url,
            'show_total_episodes': self.show_total_episodes,
            'show_media_type': self.show_media_type,
            'show_publisher': self.show_publisher,
        }
    
class SavedEpisode(BaseShow):
    """Participant's saved episode."""
    spotify_id = models.CharField(max_length=50, db_index=True)
    added_at = models.DateTimeField(null=True, default=None)
    name = models.CharField(max_length=500, default='')
    description = models.TextField(default='')
    duration_ms = models.IntegerField(null=True, default=None)
    release_date = models.CharField(max_length=20, default='')
    languages = models.TextField(default='')
    is_fully_played = models.BooleanField(null=True, default=None)
    show_id = models.CharField(max_length=50, default='')

    def __str__(self):
        return f"Saved episode (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"

    def to_dict(self):
        data = self.get_base_dict()
        data.update({
            'spotify_id': self.spotify_id,
            'name': self.name,
            'description': self.description,
            'added_at': self.added_at,
            'show_id': self.show_id,
            'release_date': self.release_date,
            'languages': self.languages,
            'is_fully_played': self.is_fully_played,
            'duration_ms': self.duration_ms,
        })
        return data
    

class SavedShow(BaseShow):
    """Participant's saved show."""
    spotify_id = models.CharField(max_length=50, db_index=True)
    added_at = models.DateTimeField(null=True, default=None)

    def __str__(self):
        return f"Saved show (ID: {self.spotify_id}) for participant {self.participant.participant} (retrieval settings: {self.participant.settings.nameUmfrage})"
    
    def to_dict(self):
        data = self.get_base_dict()
        data.update({
            'spotify_id': self.spotify_id,
            'added_at': self.added_at,
        })
        return data