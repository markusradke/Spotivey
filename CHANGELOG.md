# Spotivey Changelog

## 2026-02-16 - Results Display Refactoring & SavedTrack Transformation
- **Restructured results data format** - Replaced magic-array `rowGesamt[index][0]` structure with clean, self-documenting `dataTypes` array using explicit property names
- **Improved code readability** - Eliminated German variable names (`rowGesamt`, `zaehler`, `participantArray`) in favor of clear English names (`dataTypes`, `participantList`)
- **Updated results_builder.py** - Returns structured objects with named fields: `id`, `title`, `type`, `data`, `participantCount`, `resultCount`, `hasData`
- **Updated frontend components** - Modified `UserResultPage.js` and `ResultContentUserPageComponent.js` to use object property access (`dataType.title`) instead of array indices (`item[1]`)
- **Transformed SavedTrack model** - Added structured fields (album_label, track_name, spotify_id, artist_names, etc.) replacing JSON storage
- **Updated SavedTrack retrieval** - Integrated Phase 1 batch operations and bulk DB utilities, now uses structured fields with `to_dict()` serialization method
- **Simplified results display** - Only returns 8 fields needed for table display instead of 30+ unused fields

## 2026-02-15 - Performance Optimization Framework 
- **Created batch API operations** - `spotify/utils/batch_operations.py` with `batch_fetch_albums()`, `batch_fetch_artists()`, `batch_fetch_audio_features()` to reduce individual API calls to batched requests
- **Created bulk database operations** - `spotify/utils/bulk_db.py` with `bulk_create_with_retry()`, `bulk_update_fields()` to reduce 50 individual saves to single bulk transaction 
- **Created retrieval helpers** - `spotify/utils/retrieval_helpers.py` with `get_participant_from_session()`, `random_sample_items()`, `extract_artist_info()`, `extract_album_info()` for DRY code reuse across all retrieval views
- **Added tests** - `spotify/tests/utils/test_bulk_db.py` and `test_retrieval_helpers.py` for validation

## 2026-02-14 - Code Reorganization
- **Restructured spotify app** - Split `spotify/views.py` into shorter modular files: `auth.py`, `tracks.py`, `artists.py`, `playlists.py`, `profile.py`, `audio_features.py`
- **Restructured api app** - Split `api/views.py` into: `auth.py`, `participants.py`, `settings.py`, `results.py`, `csv_export.py`
- **Moved utilities** - `spotify/util.py` → `spotify/utils/spotify_api.py`, `api/util.py` → `api/utils/results_builder.py`

## 2026-02-13 - Model Naming Standardization
- **Renamed models to singular form** - `SavedTracksSpotify` → `SavedTrack`, `TopTracksSpotify` → `TopTrack`, `TopArtistsSpotify` → `TopArtist`, `UsersProfileSpotify` → `ParticipantProfile`, `FollowedArtistsSpotify` → `FollowedArtist`, `CurrentPlaylistsSpotify` → `CurrentPlaylist`, `RecentlyTracksSpotify` → `RecentTrack`, `SpotifyAudioFeatures` → `AudioFeatures`
- **Renamed Settings model** - `Settings` → `RetrievalSetting`, `SettingsSecondSurvey` → `FollowupSurvey` for clearer semantics
- **Updated all references** - Changed imports, queries, and instantiations in `api/views.py`, `api/util.py`, `api/admin.py`, `spotify/views.py`, `spotify/admin.py`

## 2026-02-13 - Session & Architecture Cleanup
- **Removed Room model** - Obsolete model deleted from `api/models.py`, `api/serializers.py`, `api/admin.py`
- **Cleaned up Spotify views** - Removed 7x Room.objects lookups, replaced with `self.request.session.session_key`
- **Removed redundant request data** - Eliminated unused `surveyID`, `participant_id`, `roomCode` extraction from all Spotify data retrieval views
- **Removed redundant Settings lookups** - Deleted 7x `Settings.objects.filter(umfrageID=surveyID)` + `settings.save()` (participant already has settings FK)
- **Fixed InitParticipantSession** - Removed non-existent `serializer_class` reference causing warning
- **Fixed FirstPage.js** - Added conditional check to only call `/api/init-participant-session` when URL params exist (prevents unnecessary calls on researcher pages)
- **Endpoint updates**:
  - `create-room` → `init-participant-session`
  - `user-in-room` → `get-user-session` and `get-participant-session` (make reference explicit and add additional endpoint)
  - `leave-room` → `logout-user`

## 2026-02-12 - Database Refactoring
- **Added Participant.settings FK** - Links participants to surveys with `unique_together=[['settings', 'participant']]` constraint, prevents participant ID conflicts across surveys
- **Removed redundant fields from 8 Spotify models** - Deleted `surveyID` CharField, `code` CharField, `settings` FK (access via `participant.settings` instead)
- **Unified data field naming** - Renamed all model-specific data fields to `data` JSONField (e.g., `savedTracksData` → `data`, `topTracksData` → `data`)
- **Updated all queries** - Changed from `filter(surveyID=...)` to `filter(participant__settings__umfrageID=...)` throughout codebase
- **Simplified cascade deletion** - Settings → Participant → Spotify Data chain, removed manual deletion loops
- **Fixed CSV export** - Updated field names, simplified conditional logic, added null-safety for audio features
- **Fixed audio features handling** - Changed conditional from `if dataString == 'data'` to `if indexPart == 2`, added `.get('data', {})` safety
- **Protected data deletion from survey settings deletion** - Users cannot delete settings without deleting the corresponding data first
- **Introduced unique constraint to survey settings** - Prevent 2 researchers form accidentally creating a setting for the same survey ID