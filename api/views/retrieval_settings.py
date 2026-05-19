

from rest_framework import status
from ..serializers import *
from ..models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
import numpy as np
from spotify.models import *
from ..utils.retrieval_settings_mapping import (
    build_retrieval_settings_payload,
)
from ..utils.retrieval_settings_write import (
    extract_explicit_settings_update,
)


class CreateSettings(APIView):
    # Setting of a retrieval profile is stored in database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            if RetrievalSetting.objects.filter(umfrageID=umfrageID).exists(): 
                return Response({
                    'msg': 'Survey ID already exists (possibly created by another user)', 
                    'error': 'duplicate_survey_ID',
                    'surveyID': umfrageID
                }, status=status.HTTP_400_BAD_REQUEST)  
            settings = RetrievalSetting(
                nameUmfrage=nameUmfrage,
                umfrageID=umfrageID,
            )

            explicit_update = extract_explicit_settings_update(request.data)
            
            for field_name, value in explicit_update.items():
                setattr(settings, field_name, value)

            settings.save()
            settings.user.add(user.values()[0].get('id'))

            return Response({'msg': 'Settings created'}, status=status.HTTP_201_CREATED)
        
class CheckSurveyIDExists(APIView): 
    # check if a survey ID already exists when creating new retrieval settings
    lookup_url_kwarg = 'surveyID'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            exists = RetrievalSetting.objects.filter(umfrageID=surveyID).exists()
            return Response({'exists': exists, 'surveyID': surveyID}, status=status.HTTP_200_OK)
        return Response({'error': 'No survey ID provided'}, status=status.HTTP_400_BAD_REQUEST)



class getSettingsListView(APIView):
    # all retrieval settings are searched and returned by username.

    lookup_url_kwarg = 'username'

    def get(self, request):
        username = request.GET.get(self.lookup_url_kwarg)

        if username is not None:
            user = User.objects.filter(username=username)
            if len(user) > 0:
                rows = []
                id = list(User.objects.filter(username=username).values())[0].get('id')
                settings = RetrievalSetting.objects.filter(user=id)

                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID'))
                confirmTextList = np.array(settings.values_list('confirmTextDe', 'confirmTextEng'))

                
                for i in range (len(settingslist)):
                    payload = build_retrieval_settings_payload(settings[i])

                    rows.append({
                        'id': i+1, 
                        'nameUmfrage': settingslist[i][1], 
                        'umfrageID': settingslist[i][2], 
                        'confirmText': [
                            [confirmTextList[0][0], confirmTextList[0][1]]
                        ],
                        'saved_tracks': payload['saved_tracks'],
                        'profile': payload['profile'],
                        'top_tracks_shortterm': payload['top_tracks_shortterm'],
                        'top_tracks_mediumterm': payload['top_tracks_mediumterm'],
                        'top_tracks_longterm': payload['top_tracks_longterm'],
                        'top_artists_shortterm': payload['top_artists_shortterm'],
                        'top_artists_mediumterm': payload['top_artists_mediumterm'],
                        'top_artists_longterm': payload['top_artists_longterm'],
                        'followed_artists': payload['followed_artists'],
                        'current_playlists': payload['current_playlists'],
                        'recently_played': payload['recently_played'],
                        'saved_shows': payload['saved_shows'],
                        'saved_episodes': payload['saved_episodes'],
                    })

                return Response({'data': rows}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class getSettingsFromIDView(APIView):
    # Retrieval Profile of a unique ID is returned

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)

        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if len(settings) > 0:
                settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
                settingsTwoDataEndURL = np.array(settingsTwo.values_list('secondSurveyEndURL'))
                settingsPassLang = np.array(settingsTwo.values_list('passLang'))
                settingsTwoData = np.array(settingsTwo.values_list('secondSurveyData'))
                if len(settingsTwoDataEndURL)==0 :
                    passLang = None
                    secondEndUrl = None
                    selectedOption = None
                    questionTypeCheck = None
                    dataFieldsCheck = None
                else:
                    passLang = settingsPassLang[0][0]
                    secondEndUrl = settingsTwoDataEndURL[0][0]
                    if settingsTwoData[0][0] is not None:
                        selectedOption = settingsTwoData[0][0].get('selectedOption')
                        questionTypeCheck = settingsTwoData[0][0].get('questionTypeCheck')
                        dataFieldsCheck = [
                            settingsTwoData[0][0].get('dataFieldsTracksCheck'),
                            settingsTwoData[0][0].get('dataFieldsArtistsCheck'),
                            settingsTwoData[0][0].get('dataFieldsPlaylistsCheck'),
                            settingsTwoData[0][0].get('dataFieldsShowsCheck'),
                        ]
                    else:
                        selectedOption = None
                        questionTypeCheck = None
                        dataFieldsCheck = None


                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID'))

                payload = build_retrieval_settings_payload(settings[0])
                


                checkArrayWithoutTwo = np.array([
                    payload['saved_tracks']['check'],
                    payload['top_tracks_shortterm']['check'],
                    payload['top_tracks_mediumterm']['check'],
                    payload['top_tracks_longterm']['check'],
                    payload['recently_played']['check'],
                    payload['top_artists_shortterm']['check'],
                    payload['top_artists_mediumterm']['check'],
                    payload['top_artists_longterm']['check'],
                    payload['followed_artists']['check'],
                    payload['current_playlists']['check'],
                    payload['saved_shows']['check'],
                    payload['saved_episodes']['check'],
                ])
                confirmTextList = np.array(settings.values_list('confirmTextEng', 'confirmTextDe'))
                confirmTextAll = np.array([
                            [confirmTextList[0][0], confirmTextList[0][1]]
                        ]).repeat(len(checkArrayWithoutTwo), axis=0)


                rows = [{
                    'nameUmfrage': settingslist[0][1], 
                    'umfrageID': settingslist[0][2], 
                    'confirmText': confirmTextAll,
                    'confirmTextOnlyCheck': confirmTextAll[checkArrayWithoutTwo],
                    'textAllg': payload['textAllg'],
                    'saved_tracks': payload['saved_tracks'],
                    'profile': payload['profile'],
                    'top_tracks_shortterm': payload['top_tracks_shortterm'],
                    'top_tracks_mediumterm': payload['top_tracks_mediumterm'],
                    'top_tracks_longterm': payload['top_tracks_longterm'],
                    'top_artists_shortterm': payload['top_artists_shortterm'],
                    'top_artists_mediumterm': payload['top_artists_mediumterm'],
                    'top_artists_longterm': payload['top_artists_longterm'],
                    'followed_artists': payload['followed_artists'],
                    'current_playlists': payload['current_playlists'],
                    'recently_played': payload['recently_played'],
                    'saved_shows': payload['saved_shows'],
                    'saved_episodes': payload['saved_episodes'],
                    'secondEndUrl': secondEndUrl,
                    'selectedOption': selectedOption,
                    'questionTypeCheck': questionTypeCheck,
                    'dataFieldsCheck': dataFieldsCheck,
                    'passLang':passLang,
                    'end_options': payload['end_options'],
                }]

                return Response({'data': rows}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteSettings(APIView):
    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                settings.delete()
                
                settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
                settingsTwo.delete()
                
                return Response({'message': 'Settings deleted successfully'}, status=status.HTTP_200_OK)
                
            except models.ProtectedError:
                return Response({
                    'error': 'Cannot delete settings with existing participant data',
                    'message': 'Participant data exists. Please delete the results data first.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Survey ID parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateSettings(APIView):
    # Retrieval profile is updated

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')
        updateID = request.data.get('updateID')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            setting = RetrievalSetting.objects.filter(umfrageID=updateID).first()
            if setting is not None:
                setting.nameUmfrage = nameUmfrage
                setting.umfrageID = umfrageID
                explicit_update = extract_explicit_settings_update(request.data)
                
                for field_name, value in explicit_update.items():
                    setattr(setting, field_name, value)
                    print(f"Updated {field_name} to {value}")

                setting.save()
                return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)
            return Response({'msg': 'No settings found...'}, status=status.HTTP_404_NOT_FOUND)



class UpdateConfirmText(APIView):
    # Confirmation text is changed
    
    def post(self, request, format=None):

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        confirmTextArray = request.data.get('confirmTextArray')

        if surveyID is not None:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID, user__username=username)

            if settingsFilter.exists():
                settings = settingsFilter
            
            settings.update(confirmTextEng=confirmTextArray[0], confirmTextDe=confirmTextArray[1])
                

            return Response({}, status=status.HTTP_201_CREATED)
        else:
            return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

            
 