"""Views for displaying and managing retrieval results."""
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..models import RetrievalSetting, ParticipantEmail
from ..utils.results_builder import getResultDict
from spotify.models import (
    SavedTrack, TopTrackShortTerm, TopTrackMediumTerm, TopTrackLongTerm, RecentTrack,
    TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, FollowedArtist,
    CurrentPlaylist, Participant,
    Participant, SavedShow, SavedEpisode
)


class getResultListView(APIView):
    # Results of a survey respectively a retrieval profile are returned

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            results = getResultDict(surveyID)
            return Response(results, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)



class DeleteOnlyResultsWithID(APIView):
    # Results of a retrieval profile are deleted

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID).first()
            if not settings: 
                return Response({'Bad Request': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)
            participants = Participant.objects.filter(settings=settings)
            participant_count = participants.count()
            participants.delete()

            return Response({
                'message': f'Deleted {participant_count} participants and all their data'
            }, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteEmailsForSurvey(APIView):
    # Emails of a retrieval profile are deleted
     
     lookup_url_kwarg = 'surveyid'

     def get(self, request):
         surveyID = request.GET.get(self.lookup_url_kwarg)
         if surveyID is not None:
             settings = RetrievalSetting.objects.filter(umfrageID=surveyID).first()
             if not settings: 
                 return Response({'Bad Request': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)
             emails = ParticipantEmail.objects.filter(settings=settings)
             email_count = emails.count()
             emails.delete()

             return Response({
                 'message': f'Deleted {email_count} participant emails'
             }, status=status.HTTP_200_OK)
         return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

    


class SaveCheckData(APIView):
    """Process user confirmation of retrieved Spotify data.
    
    Marks confirmed items as verified and deletes rejected items.
    Maps data type index to corresponding model and identifier field.
    """
    
    # Map index to (model_class, identifier_field, identifier_key_in_request)
    DATA_TYPE_MAP = {
        0: (SavedTrack, "spotify_id", "spotify_id"),
        1: (TopTrackShortTerm, "spotify_id", "spotify_id"),
        2: (TopTrackMediumTerm, "spotify_id", "spotify_id"),
        3: (TopTrackLongTerm, "spotify_id", "spotify_id"),
        4: (RecentTrack, "spotify_id", "spotify_id"),
        5: (TopArtistShortTerm, "spotify_id", "id"),
        6: (TopArtistMediumTerm, "spotify_id", "id"),
        7: (TopArtistLongTerm, "spotify_id", "id"),
        8: (FollowedArtist, "spotify_id", "id"),
        9: (CurrentPlaylist, "spotify_id", "spotify_id"),
        10: (Participant, "spotify_id", "spotify_id"),
        11: (SavedShow, "spotify_id", "spotify_id"),
        12: (SavedEpisode, "spotify_id", "spotify_id"),
    }

    def post(self, request, format=None):
        data_type_index = request.data.get('index')
        survey_id = request.data.get('surveyID')
        confirmed_items = request.data.get('checkData', [])
        rejected_items = request.data.get('noData', [])

        if not survey_id:
            return Response(
                {'error': 'Survey ID parameter missing'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        retrieval_session_key = request.session.get('retrieval_session_key')
        if not retrieval_session_key: 
            return Response(
                {'error': 'No active retrieval session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try: 
            participant = Participant.objects.get(
                retrieval_session_key=retrieval_session_key
            )
        except Participant.DoesNotExist:
            return Response(
                {'error': 'Participant not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            data_type_index = int(data_type_index)
            if data_type_index not in self.DATA_TYPE_MAP:
                return Response(
                    {'error': f'Invalid data type index: {data_type_index}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Data type index must be an integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        model_class, identifier_field, request_key = self.DATA_TYPE_MAP[data_type_index]
        
        self._mark_items_as_confirmed(
            model_class, participant, identifier_field, request_key, confirmed_items
        )
        self._delete_rejected_items(
            model_class, participant, identifier_field, request_key, rejected_items
        )
        
        return Response(
            {'confirmed_count': len(confirmed_items), 'deleted_count': len(rejected_items)}, 
            status=status.HTTP_200_OK
        )

    def _mark_items_as_confirmed(
        self, model_class, participant, identifier_field, request_key, items
    ):
        """Mark items as confirmed in database."""
        for item in items:
            if item is None:
                continue
            identifier_value = item.get(request_key)
            if identifier_value:
                filter_kwargs = {
                    'participant': participant,
                    identifier_field: identifier_value
                }
                model_class.objects.filter(**filter_kwargs).update(confirmed=True)

    def _delete_rejected_items(
        self, model_class, participant, identifier_field, request_key, items
    ):
        """Delete rejected items from database."""
        for item in items:
            if item is None:
                continue
            identifier_value = item.get(request_key)
            if identifier_value:
                filter_kwargs = {
                    'participant': participant,
                    identifier_field: identifier_value
                }
                model_class.objects.filter(**filter_kwargs).delete()


           
class GetParticipantCountForSurvey(APIView):
    lookup_url_kwarg = 'surveyID'

    def get(self, request): 
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None: 
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)

            participants = set(
                p.participant for p in Participant.objects.filter(settings__in=settings)
            )
            total_participants = len(participants)
            total_records = 0

            for model in [SavedTrack, TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm, 
                          TopArtistShortTerm, TopArtistMediumTerm, TopArtistLongTerm,
                            FollowedArtist, CurrentPlaylist, RecentTrack, SavedShow, SavedEpisode]:
                records = model.objects.filter(participant__settings__in=settings)
                total_records += records.count()
                for record in records: 
                    if record.participant: 
                        participants.add(record.participant.participant)

            return Response({
                'surveyID': surveyID, 
                'participantCount': total_participants, 
                'totalRecords': total_records, 
                'hasData': total_participants > 0
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Survey ID parameter missing'}, status=status.HTTP_400_BAD_REQUEST)