"""Results dictionary builder for displaying retrieval data."""
from ..models import RetrievalSetting
from spotify.models import (
    SavedTrack, TopTrack, RecentTrack,
    TopArtist, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant
    )


def getResultDict(surveyID):
    """
    Build results dictionary for researcher dashboard display.
    
    Returns clean, self-documenting structure with SavedTrack data using
    structured fields (no JSON parsing).
    
    Args:
        surveyID: Survey identifier to filter results
        
    Returns:
        Dictionary with dataTypes array containing clear metadata and table rows
    """
    settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
    
    saved_tracks = SavedTrack.objects.filter(
        participant__settings__in=settings,
        confirmed=True
    ).select_related('participant').order_by('participant__participant')
    
    rows = []
    participants = set()
    
    for idx, track in enumerate(saved_tracks, start=1):
        participant_name = track.participant.participant
        participants.add(participant_name)
        
        rows.append({
            'id': idx,
            'no': idx,
            'participant': participant_name,
            'cover': track.image_url,
            'trackName': track.track_name,
            'spotify_artist_string': track.artist_names,
            'spotifyID': track.spotify_id,
            'isrc': track.isrc,
        })
    
    participant_count = len(participants)
    result_count = len(rows)
    
    return {
        'dataTypes': [
            {
                'id': 'savedTracks',
                'title': 'Saved Tracks',
                'type': 'Tracks',
                'data': rows,
                'participantCount': participant_count,
                'resultCount': result_count,
                'hasData': result_count > 0
            }
        ],
        'participantList': list(participants)
    }