# Spotivey Changelog

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