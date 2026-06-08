"""CSV export view - exports all retrieval data to CSV format."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.utils.csv_builder import build_all_data_types_csv, build_participants_csv, build_emails_csv
from api.models import RetrievalSetting

class saveRepertoireToCsvFileView(APIView):
    """
    Export all confirmed retrieval data to CSV format.
    
    Uses csv_builder utilities for clean, DRY, extensible CSV generation.
    Returns JSON array of dictionaries ready for frontend CSV libraries.
    """
    
    def get(self, request, format=None):
        survey_id = request.GET.get('surveyID')
        print(f"Received request to export CSV for surveyID: {survey_id}")
        
        if not survey_id:
            return Response({
                'error': 'Survey ID required'
            }, status=status.HTTP_400_BAD_REQUEST)

        csv_data = build_all_data_types_csv(survey_id)
        return Response(csv_data, status=status.HTTP_200_OK)

class saveParticipantsToCsvFileView(APIView):
    """
    Export participant data for a survey to CSV format.
    
    Returns JSON array of participant dictionaries for frontend CSV generation.
    """
    
    def get(self, request, format=None):
        survey_id = request.GET.get('surveyID')
        print(f"Received request to export participants CSV for surveyID: {survey_id}")
        
        if not survey_id:
            return Response({
                'error': 'Survey ID required'
            }, status=status.HTTP_400_BAD_REQUEST)

        csv_data = build_participants_csv(survey_id)
        return Response(csv_data, status=status.HTTP_200_OK)
    
class saveEmailsToCsvFileView(APIView):
    """
    Export participant emails for a survey to CSV format.
    
    Returns JSON array of participant email dictionaries for frontend CSV generation.
    """
    
    def get(self, request, format=None):
        survey_id = request.GET.get('surveyID')
        print(f"Received request to export emails CSV for surveyID: {survey_id}")
        
        if not survey_id:
            return Response({
                'error': 'Survey ID required'
            }, status=status.HTTP_400_BAD_REQUEST)

        csv_data = build_emails_csv(survey_id)
        return Response(csv_data, status=status.HTTP_200_OK)
    

class saveSettingsToCsvFileView(APIView):
    """
    Export retrieval settings for a survey to CSV format.
    
    Returns JSON array of settings dictionaries for frontend CSV generation.
    """
    
    def get(self, request, format=None):
        survey_id = request.GET.get('surveyID')
        print(f"Received request to export settings CSV for surveyID: {survey_id}")
        
        if not survey_id:
            return Response({
                'error': 'Survey ID required'
            }, status=status.HTTP_400_BAD_REQUEST)

        model_fields = [field.name for field in RetrievalSetting._meta.get_fields()]
        csv_data = []
        try:
            settings = RetrievalSetting.objects.get(umfrageID=survey_id)
            settings_dict = {field: getattr(settings, field) for field in model_fields if field not in ['user', 'id', 'followupsurvey', 'participantemail', 'participant']}
            settings_dict['researcher_id'] = settings.user.user.username if settings.user else None
            settings_dict['researcher_name'] = settings.user.user.first_name + " " + settings.user.user.last_name if settings.user else None
            settings_dict['institution'] = settings.user.institution if settings.user else None
            settings_dict['email'] = settings.user.user.email if settings.user else None
            csv_data.append(settings_dict)

        except RetrievalSetting.DoesNotExist:
            return Response({
                'error': 'Settings not found for the given survey ID'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response(csv_data, status=status.HTTP_200_OK)