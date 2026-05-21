"""Participant session management views."""

import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.http import JsonResponse

from ..models import RetrievalSetting, ParticipantEmail
from spotify.models import *

class InitParticipantSession(APIView):
    # Creates a participant session with surveyID, participant ID, and language.
    # If necessary, the language code and the subject ID are updated. The Spotify token that may exist is also deleted.

    def post(self, request, format=None):
        if self.request.session.exists(self.request.session.session_key):
            if request.data.get('participant') is not None and request.data.get('surveyID') is not None:
                if 'surveyID' in self.request.session.keys() and request.data.get('surveyID') is not None:
                    if self.request.session['surveyID'] != request.data.get('surveyID'):
                        self.request.session['surveyID'] = request.data.get('surveyID')
                        self.request.session['language'] = request.data.get('lang')
                        self.request.session['paramsObject'] = request.data.get('paramsObject')
                        self.request.session['welcome'] = None
                        token = SpotifyToken.objects.filter(user=self.request.session.session_key)
                        if token.exists():
                            token.delete()
                if 'participant' in self.request.session.keys() and request.data.get('participant') is not None:
                    if self.request.session['participant'] != request.data.get('participant'):
                        self.request.session['participant'] = request.data.get('participant')
                        self.request.session['language'] = request.data.get('lang')
                        self.request.session['paramsObject'] = request.data.get('paramsObject')
                        self.request.session['welcome'] = None
                        self.request.session['privacy_accepted'] = None
                        token = SpotifyToken.objects.filter(user=self.request.session.session_key)
                        if token.exists():
                            token.delete()
            else:
                return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        participant_id = request.data.get('participant')

        settings = RetrievalSetting.objects.filter(umfrageID=surveyID).first()
        if not settings: 
            return Response({'Error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        retrieval_session_key = str(uuid.uuid4())

        existing_participants = Participant.objects.filter(
            participant=participant_id,
            settings=settings,
            status='in_progress'
        )
        if existing_participants.exists():
            existing_participants.delete()

        Participant.objects.create(
            participant=participant_id, 
            settings=settings,
            retrieval_session_key=retrieval_session_key,
            status='in_progress'
        )
        
        room_code = str(uuid.uuid4())[:8].upper()

        self.request.session['room_code'] = room_code
        self.request.session['surveyID'] = surveyID
        self.request.session['participant'] = participant_id
        self.request.session['retrieval_session_key'] = retrieval_session_key  
        self.request.session['language'] = request.data.get('lang')
        self.request.session['paramsObject'] = request.data.get('paramsObject')
        self.request.session['welcome'] = False

        return Response({'code': room_code}, status=status.HTTP_200_OK)


class AcceptPrivacyPolicy(APIView):
    """Accept privacy policy and update session accordingly."""

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        self.request.session['privacy_accepted'] = True
        return Response({'message': 'Privacy policy accepted'}, status=status.HTTP_200_OK)

class GetParticipantSession(APIView):
    """Get session data for survey participants and clean up any unconfirmed data from previous sessions."""

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        participant = self.request.session.get('participant')
        SavedTrack.objects.filter(participant=participant, confirmed=False).delete()
        TopTrackShortTerm.objects.filter(participant=participant, confirmed=False).delete()
        TopTrackMediumTerm.objects.filter(participant=participant, confirmed=False).delete()
        TopTrackLongTerm.objects.filter(participant=participant, confirmed=False).delete()
        RecentTrack.objects.filter(participant=participant, confirmed=False).delete()
        TopArtistShortTerm.objects.filter(participant=participant, confirmed=False).delete()
        TopArtistMediumTerm.objects.filter(participant=participant, confirmed=False).delete()
        TopArtistLongTerm.objects.filter(participant=participant, confirmed=False).delete()
        FollowedArtist.objects.filter(participant=participant, confirmed=False).delete()
        CurrentPlaylist.objects.filter(participant=participant, confirmed=False).delete()


        data = {
            'roomCode': self.request.session.get('room_code'),
            'surveyID': self.request.session.get('surveyID'),
            'participant': self.request.session.get('participant'),
            'welcome': self.request.session.get('welcome'),
            'language': self.request.session.get('language'),
            'paramsObject': self.request.session.get('paramsObject'),
            'resultExist': False,
            'welcome': self.request.session.get('welcome'),
            'privacy_accepted': self.request.session.get('privacy_accepted', False)
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class FinalizeParticipantData(APIView):
    """Mark participant's data retrieval as complete."""
    
    def post(self, request, format=None):
        retrieval_session_key = self.request.session.get('retrieval_session_key')
        if not retrieval_session_key:
            return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)
        
        participant.status = 'completed'
        participant.completed_at = timezone.now()
        participant.save()

        old_participants = Participant.objects.filter(
            participant=participant.participant, 
            settings=participant.settings
        ).exclude(id=participant.id)
        print(f"Cleaning up {old_participants.count()} old participant records for participant {participant.participant}")
 
        if old_participants.exists():
            old_participants.delete()
        return Response({'message': 'Participant data finalized successfully'}, status=status.HTTP_200_OK)


class SaveParticipantEmail(APIView):
    """Save participant email for, e.g., a lottery."""
    
    def post(self, request, format=None):
        participant_email = request.data.get('email')
        survey_id = request.data.get('surveyID')

        if not participant_email or not survey_id:
            return Response({'error': 'Email and survey ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        settings = RetrievalSetting.objects.filter(umfrageID=survey_id).first()
        if not settings:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        ParticipantEmail.objects.create(
            email=participant_email,
            settings=settings
        )

        return Response({'message': 'Participant email saved successfully'}, status=status.HTTP_200_OK)