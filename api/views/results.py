"""Views for displaying and managing retrieval results."""
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..models import RetrievalSetting
from ..utils.results_builder import getResultDict
from spotify.models import (
    SavedTrack, TopTrack, RecentTrack,
    TopArtist, FollowedArtist,
    CurrentPlaylist, ParticipantProfile,
    Participant
)


class getResultListView(APIView):
    # Results of a survey respectively a retrieval profile are returned

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = getResultDict(surveyID)
            return Response(settings, status=status.HTTP_200_OK)
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


class SaveCheckData(APIView):
    # Check if respondent has confirmed Spotify data, if not, it will be deleted.

    def post(self, request, format=None):

        zaehler = request.data.get('index')
        surveyID = request.data.get('surveyID')
        checkData = request.data.get('checkData')
        noData = request.data.get('noData')

        if surveyID is not None:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)

            if settingsFilter.exists():
                settings = settingsFilter[0]
                settings.save()

            retrieval_session_key = self.request.session.get('retrieval_session_key')
            if not retrieval_session_key: 
                return Response({'error': 'No active retrieval session'}, status=status.HTTP_400_BAD_REQUEST)
            try: 
                participant = Participant.objects.get(retrieval_session_key=retrieval_session_key)
            except Participant.DoesNotExist:
                return Response({'error': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)
                
            if len(checkData) > 0:
                for i in range(len(checkData)):
                    if int(zaehler)==0 or int(zaehler)==1 or int(zaehler)==2:
                        isrcCheckData = checkData[i].get('isrc')
                        if int(zaehler)==0:
                            confirmData = SavedTrack.objects.filter(participant=participant, isrc=isrcCheckData)
                        elif int(zaehler)==1:
                            confirmData = TopTrack.objects.filter(participant=participant, isrc=isrcCheckData)
                        else:
                            confirmData = RecentTrack.objects.filter(participant=participant, isrc=isrcCheckData)
                    else:
                        idCheckData = checkData[i].get('id')
                        if int(zaehler)==3:
                            confirmData = TopArtist.objects.filter(participant=participant, data__id=idCheckData)
                        elif int(zaehler)==4:
                            confirmData = FollowedArtist.objects.filter(participant=participant, data__id=idCheckData)
                        else:
                            confirmData = CurrentPlaylist.objects.filter(participant=participant, data__id=idCheckData)

                    confirmData.update(confirmed=True)

            if len(noData) > 0:    
                for j in range(len(noData)):
                    if int(zaehler)==0 or int(zaehler)==1 or int(zaehler)==2:
                        isrcCheckData = noData[j].get('isrc')
                        if int(zaehler)==0:
                            confirmData = SavedTrack.objects.filter(participant=participant, isrc=isrcCheckData).delete()
                        elif int(zaehler)==1:
                            confirmData = TopTrack.objects.filter(participant=participant, isrc=isrcCheckData).delete()
                        else:
                            confirmData = RecentTrack.objects.filter(participant=participant, isrc=isrcCheckData).delete()
                    else:
                        idCheckData = noData[j].get('id')
                        if int(zaehler)==3:
                            confirmData = TopArtist.objects.filter(participant=participant, data__id=idCheckData).delete()
                        elif int(zaehler)==4:
                            confirmData = FollowedArtist.objects.filter(participant=participant, data__id=idCheckData).delete()
                        else:
                            confirmData = CurrentPlaylist.objects.filter(participant=participant, data__id=idCheckData).delete()
                
            return Response({'checkData':checkData}, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


           
class GetParticipantCountForSurvey(APIView):
    # Get count of participants and data records for a survey ID
    lookup_url_kwarg = 'surveyID'

    def get(self, request): 
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None: 
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)

            # count participants across all data types
            participants = set()
            total_records = 0

            for model in [SavedTrack, TopTrack, TopArtist, 
                            ParticipantProfile, FollowedArtist, 
                            CurrentPlaylist, RecentTrack]:
                records = model.objects.filter(participant__settings__in=settings)
                total_records += records.count()
                for record in records: 
                    if record.participant: 
                        participants.add(record.participant.participant)
            return Response({
                'surveyID': surveyID, 
                'participantCount': len(participants), 
                'totalRecords': total_records, 
                'hasData': total_records > 0
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Survey ID parameter missing'}, status=status.HTTP_400_BAD_REQUEST)