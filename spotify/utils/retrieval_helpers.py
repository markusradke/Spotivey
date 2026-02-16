"""
Common helper functions for Spotify data retrieval views.
"""

from typing import List, Dict, Any
from rest_framework.response import Response
from rest_framework import status
import random

from spotify.models import Participant


def get_participant_from_session(request) -> tuple:
    """
    Get participant from retrieval_session_key stored in session.
    
    Returns:
        Tuple of (participant_object, error_response)
        If successful: (Participant, None)
        If error: (None, Response)
    
    Usage:
        participant, error = get_participant_from_session(request)
        if error:
            return error
        # continue with participant
    """
    retrieval_session_key = request.session.get('retrieval_session_key')
    
    if not retrieval_session_key:
        return (None, Response(
            {'error': 'No active retrieval session'},
            status=status.HTTP_400_BAD_REQUEST
        ))
    
    try:
        participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        return (participant, None)
    except Participant.DoesNotExist:
        return (None, Response(
            {'error': 'Participant session not found'},
            status=status.HTTP_404_NOT_FOUND
        ))


