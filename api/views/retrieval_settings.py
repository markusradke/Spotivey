

from rest_framework import status
from ..serializers import *
from ..models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
import numpy as np
from spotify.models import *


class CreateSettings(APIView):
    # Setting of a retrieval profile is stored in database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = request.data.get('data')
        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')
        umfrageURL = request.data.get('umfrageEndUrl')

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
            settings = RetrievalSetting(data=data, nameUmfrage=nameUmfrage, umfrageID=umfrageID,
                            umfrageURL=umfrageURL)
            settings.save()
            settings.user.add(user.values()[0].get('id'))

            return Response({'msg': 'Settings created'}, status=status.HTTP_200_OK)
        
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

                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID', 'umfrageURL'))
                confirmTextList = np.array(settings.values_list('confirmTextSTEng', 'confirmTextTTEng', 'confirmTextRTEng', 
                    'confirmTextTAEng', 'confirmTextFAEng', 'confirmTextCPEng', 'confirmTextSTDe', 'confirmTextTTDe', 
                    'confirmTextRTDe', 'confirmTextTADe', 'confirmTextFADe', 'confirmTextCPDe'))

                settingslistdata = np.array(settings.values_list('data'))
                
                for i in range (len(settingslist)):
                    tempCheckPublic = ''
                    tempCheck = [False, False, False, False, False, False, False]
                    tempConfirmCheck = [True, False, True, True, True, True, True]
                    tempLimit = [0, None, 0, 0, 0, 0, 0]
                    tempMarket = ['', None, None, None, None, None, None]
                    tempTimeRange = [None, None, '', '', None, None, None]
                    zaehler = -1
                    
                    for j in range(7):
                        if (settingslistdata[i][0].get('dataCheck').get(str(j))):
                            tempConfirmCheck[j] = settingslistdata[0][0].get('confirmCheck').get(str(j))
                            zaehler = zaehler + 1
                            tempCheck[j] = True
                            if j == 0:
                                tempMarket[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('market')
                                if tempMarket[j] != '':
                                    tempMarket[j]=tempMarket[j].get('Name')
                            if j != 1:
                                tempLimit[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('limit')
                            if j == 2 or j == 3:
                                tempTimeRange[j] = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('time_range')
                                if tempTimeRange[j] != 'medium_term':
                                    tempTimeRange[j] = tempTimeRange[j].get('name')
                            if j == 5:
                                tempCheckPublic = settingslistdata[i][0].get('dropdown').get('valueSettings')[zaehler].get('public')

                    rows.append({
                        'id': i+1, 
                        'nameUmfrage': settingslist[i][1], 
                        'umfrageID': settingslist[i][2], 
                        'umfrageURL': settingslist[i][3],
                        'confirmText': [
                            [confirmTextList[0][6], confirmTextList[0][0]], [confirmTextList[0][7], confirmTextList[0][1]], 
                            [confirmTextList[0][8], confirmTextList[0][2]], [confirmTextList[0][9], confirmTextList[0][3]], 
                            [confirmTextList[0][10], confirmTextList[0][4]], [confirmTextList[0][11], confirmTextList[0][5]]
                        ],
                        'text1': {
                            'check': tempCheck[0],
                            'limit': tempLimit[0],
                            'market': tempMarket[0],
                            'confirmCheck': tempConfirmCheck[0],
                        },
                        'text2': {
                            'check': tempCheck[1],
                        },
                        'text3': {
                            'check': tempCheck[2],
                            'limit': tempLimit[2],
                            'timeRange': tempTimeRange[2],
                            'confirmCheck': tempConfirmCheck[2],
                        },
                        'text4': {
                            'check': tempCheck[3],
                            'limit': tempLimit[3],
                            'timeRange': tempTimeRange[3],
                            'confirmCheck': tempConfirmCheck[3],
                        },
                        'text5': {
                            'check': tempCheck[4],
                            'limit': tempLimit[4],
                            'confirmCheck': tempConfirmCheck[4],
                        },
                        'text6': {
                            'check': tempCheck[5],
                            'limit': tempLimit[5],
                            'confirmCheck': tempConfirmCheck[5],
                            'public': tempCheckPublic
                        },
                        'text7': {
                            'check': tempCheck[6],
                            'limit': tempLimit[6],
                            'confirmCheck': tempConfirmCheck[6],
                        },
                    })

                return Response({'data': rows, 'json:': settingslistdata}, status=status.HTTP_200_OK)
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
                        ]
                    else:
                        selectedOption = None
                        questionTypeCheck = None
                        dataFieldsCheck = None

                settingslistdata = np.array(settings.values_list('data'))

                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID', 'umfrageURL'))
                confirmTextList = np.array(settings.values_list('confirmTextSTEng', 'confirmTextTTEng', 'confirmTextRTEng', 
                    'confirmTextTAEng', 'confirmTextFAEng', 'confirmTextCPEng', 'confirmTextSTDe', 'confirmTextTTDe', 
                    'confirmTextRTDe', 'confirmTextTADe', 'confirmTextFADe', 'confirmTextCPDe'))

                tempCheckPublic = ''

                tempCheck = [False, False, False, False, False, False, False]
                tempConfirmCheck = [True, False, True, True, True, True, True]
                tempLimit = [10, None, 20, 20, 20, 20, 20]
                tempMarket = ['', None, None, None, None, None, None]
                tempTimeRange = [None, None, '', '', None, None, None]
                tempText = []
                zaehler = -1
                marketCode = ''
                for j in range(7):
                    if (settingslistdata[0][0].get('dataCheck').get(str(j))):
                        tempConfirmCheck[j] = settingslistdata[0][0].get('confirmCheck').get(str(j))
                        zaehler = zaehler + 1
                        tempCheck[j] = True
                        tempText.append(settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('text'))
                        if j == 0:
                            tempMarket[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('market')
                            if tempMarket[j] != '':
                                marketCode=tempMarket[j].get('Code')
                                tempMarket[j]=tempMarket[j].get('Name')
                        if j != 1:
                            tempLimit[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('limit')
                        if j == 2 or j == 3:
                            tempTimeRange[j] = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('time_range')
                            if tempTimeRange[j] != 'medium_term':
                                tempTimeRange[j] = tempTimeRange[j].get('name')
                        if j == 5:
                            tempCheckPublic = settingslistdata[0][0].get('dropdown').get('valueSettings')[zaehler].get('public')
                

                confirmTextAll = [
                            [confirmTextList[0][6], confirmTextList[0][0]], [confirmTextList[0][7], confirmTextList[0][1]], 
                            [confirmTextList[0][8], confirmTextList[0][2]], [confirmTextList[0][9], confirmTextList[0][3]], 
                            [confirmTextList[0][10], confirmTextList[0][4]], [confirmTextList[0][11], confirmTextList[0][5]]
                        ]

                checkArrayWithoutTwo = np.array([tempCheck[0], tempCheck[2], tempCheck[6], tempCheck[3], tempCheck[4], tempCheck[5]])

                rows = [{
                    'nameUmfrage': settingslist[0][1], 
                    'umfrageID': settingslist[0][2], 
                    'confirmText': confirmTextAll,
                    'confirmTextOnlyCheck': np.array(confirmTextAll)[checkArrayWithoutTwo],
                    'textAllg': tempText,
                    'text1': {
                        'check': tempCheck[0],
                        'limit': tempLimit[0],
                        'market': tempMarket[0],
                        'marketCode': marketCode,
                        'confirmCheck': tempConfirmCheck[0],
                    },
                    'text2': {
                        'check': tempCheck[1],
                    },
                    'text3': {
                        'check': tempCheck[2],
                        'limit': tempLimit[2],
                        'timeRange': tempTimeRange[2],
                        'confirmCheck': tempConfirmCheck[2],
                    },
                    'text4': {
                        'check': tempCheck[3],
                        'limit': tempLimit[3],
                        'timeRange': tempTimeRange[3],
                        'confirmCheck': tempConfirmCheck[3],
                    },
                    'text5': {
                        'check': tempCheck[4],
                        'limit': tempLimit[4],
                        'confirmCheck': tempConfirmCheck[4],
                    },
                    'text6': {
                        'check': tempCheck[5],
                        'limit': tempLimit[5],
                        'confirmCheck': tempConfirmCheck[5],
                        'public': tempCheckPublic
                    },
                    'text7': {
                        'check': tempCheck[6],
                        'limit': tempLimit[6],
                        'confirmCheck': tempConfirmCheck[6],
                    },
                    'secondEndUrl': secondEndUrl,
                    'selectedOption': selectedOption,
                    'questionTypeCheck': questionTypeCheck,
                    'dataFieldsCheck': dataFieldsCheck,
                    'passLang':passLang,
                }]

                return Response({'data': rows, 'json:': settingslistdata}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteSettings(APIView):
    # Retrieval profile is deleted - only if no participant data exists
    
    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            
            if not settings.exists():
                return Response({'error': 'Survey ID not found'}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                # Delete follow-up survey settings first (not protected)
                settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
                settingsTwo.delete()
                
                # Try to delete the settings - will fail if protected data exists
                settings.delete()
                
                return Response({'message': 'Settings deleted successfully'}, status=status.HTTP_200_OK)
                
            except models.ProtectedError:
                # This should rarely happen - frontend checks first
                # Only occurs in race conditions or if frontend bypassed
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

        data = request.data.get('data')
        username = request.data.get('username')
        nameUmfrage = request.data.get('umfrageName')
        umfrageID = request.data.get('umfrageID')
        umfrageURL = request.data.get('umfrageEndUrl')
        updateID = request.data.get('updateID')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:

            settings = RetrievalSetting.objects.filter(umfrageID=updateID)
            if settings.exists():
                settings.update(data=data, nameUmfrage=nameUmfrage, umfrageID=umfrageID, umfrageURL=umfrageURL)
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
                
                for i, data in enumerate(confirmTextArray):
                    if i == 0:
                        settings.update(confirmTextSTDe=data[0])
                        settings.update(confirmTextSTEng=data[1])
                    elif i == 1:
                        settings.update(confirmTextTTDe=data[0])
                        settings.update(confirmTextTTEng=data[1])
                    elif i == 3:
                        settings.update(confirmTextTADe=data[0])
                        settings.update(confirmTextTAEng=data[1])
                    elif i == 4:
                        settings.update(confirmTextFADe=data[0])
                        settings.update(confirmTextFAEng=data[1])
                    elif i == 5:
                        settings.update(confirmTextCPDe=data[0])
                        settings.update(confirmTextCPEng=data[1])
                    else:
                        settings.update(confirmTextRTDe=data[0])
                        settings.update(confirmTextRTEng=data[1])

                return Response({}, status=status.HTTP_200_OK)
            else:
                return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
            
 