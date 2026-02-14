

from rest_framework import status
from ..serializers import *
from ..models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
import numpy as np
from spotify.models import *



class GetSettingsSecondSurvey(APIView):
    # The FollowUp settings are searched and returned by username.

    lookup_url_kwarg = 'username'
    def get(self, request):
        username = request.GET.get(self.lookup_url_kwarg)
        if username is not None:
            user = User.objects.filter(username=username)
            if len(user) > 0:
                rows = []
                id = list(User.objects.filter(username=username).values())[0].get('id')
                settings = RetrievalSetting.objects.filter(user=id)
                settingsIDSecond = np.transpose(np.array(FollowupSurvey.objects.filter(
                        settings__in=settings).values_list('settings')))
                settingslist = np.array(settings.values_list('id', 'nameUmfrage', 'umfrageID'))
                settingslistData = np.array(settings.values_list('data'))
                
                if len(settingsIDSecond):
                    checkID = np.isin(np.array(settings.values_list('id')), settingsIDSecond[0])
                else:
                    checkID = [False]*len(settingslist)

                indexSecondSetting = 0
                for i in range (len(settingslist)):
                    settingslistsecond = np.array(FollowupSurvey.objects.filter(
                        settings__in=settings).values_list('settings','secondSurveyID', 'secondSurveyServer',
                        'secondSurveyLanguage', 'secondSurveyEndURL', 'passLang'))
                    if not checkID[i]:
                        umfrageIDTemp = ''
                        secondSurveyServer = ''
                        secondSurveyLanguage = ''
                        umfrageEndUrlTemp = ''
                        passLang = "False"
                    else:
                        umfrageIDTemp = settingslistsecond[indexSecondSetting][1]
                        secondSurveyServer = settingslistsecond[indexSecondSetting][2]
                        secondSurveyLanguage = settingslistsecond[indexSecondSetting][3]
                        umfrageEndUrlTemp = settingslistsecond[indexSecondSetting][4]
                        passLang = settingslistsecond[indexSecondSetting][5]
                        indexSecondSetting += 1

                    dataCheckProfile = [
                        settingslistData[i][0].get('dataCheck').get('0'), settingslistData[i][0].get('dataCheck').get('2'),
                        settingslistData[i][0].get('dataCheck').get('3'), settingslistData[i][0].get('dataCheck').get('4'), 
                        settingslistData[i][0].get('dataCheck').get('5'), settingslistData[i][0].get('dataCheck').get('6')
                    ]

                    rows.append({
                        'id': i+1,
                        'nameSettings' : settingslist[i][1],
                        'umfrageIDsecond': umfrageIDTemp,
                        'secondSurveyServer': secondSurveyServer,
                        'secondSurveyLanguage': secondSurveyLanguage,
                        'umfrageID': settingslist[i][2],
                        'endURL': umfrageEndUrlTemp,
                        'passLang': eval(passLang),
                        'onlyProfile': True not in dataCheckProfile  # if only get User's profile is checked in retrieval-settings
                    })

                return Response({'data': rows, 'json:': {}}, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)



class CreateSettingsSecondSurvey(APIView):
    # FollowUp settings are stored in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        secondSurveyID = request.data.get('secondSurveyID')
        secondSurveyServer = request.data.get('secondSurveyServer')
        endURL = request.data.get('endURL')
        secondSurveyLanguage = request.data.get('secondSurveyLanguage')
        passLang = request.data.get('passLang')
        data = request.data.get('data')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()
            settingsTwo = FollowupSurvey(settings=settingsOne, secondSurveyID=secondSurveyID,
                secondSurveyServer=secondSurveyServer, secondSurveyLanguage=secondSurveyLanguage, secondSurveyEndURL=endURL, passLang=passLang)
            settingsTwo.save()
            settingsTwo.user.add(user.values()[0].get('id'))

            return Response({'msg': 'Settings created'}, status=status.HTTP_200_OK)


class UpdateSettingsSecondSurvey(APIView):
    # FollowUp settings are updated in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        data = request.data.get('data')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()

            settingsTwo = FollowupSurvey.objects.filter(settings=settingsOne)

            settingsTwo.update(secondSurveyData=data)

            return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)

class UpdateSettingsSecondSurveyEndURL(APIView):
    # FollowUp settings are updated in the database

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        surveyID = request.data.get('surveyID')
        username = request.data.get('username')
        secondSurveyID = request.data.get('secondSurveyID')
        secondSurveyServer = request.data.get('secondSurveyServer')
        endURL = request.data.get('endURL')
        secondSurveyLanguage = request.data.get('secondSurveyLanguage')
        passLang = request.data.get('passLang')

        user = User.objects.filter(username=username)

        if not user.exists():
            return Response({'msg': 'Neu anmelden...'}, status=status.HTTP_404_NOT_FOUND)
        else:
            settingsFilter = RetrievalSetting.objects.filter(umfrageID=surveyID)
            if settingsFilter.exists():
                settingsOne = settingsFilter[0]
                settingsOne.save()

            settingsTwo = FollowupSurvey.objects.filter(settings=settingsOne)

            settingsTwo.update(secondSurveyID=secondSurveyID)
            settingsTwo.update(secondSurveyServer=secondSurveyServer)
            settingsTwo.update(secondSurveyLanguage=secondSurveyLanguage)
            settingsTwo.update(secondSurveyEndURL=endURL)
            settingsTwo.update(passLang=passLang)

            return Response({'msg': 'Settings updated'}, status=status.HTTP_200_OK)


class DeleteSettingsSecondSurvey(APIView):
    # FollowUp-Setting is deleted

    lookup_url_kwarg = 'surveyid'

    def get(self, request):
        surveyID = request.GET.get(self.lookup_url_kwarg)
        if surveyID is not None:
            settings = RetrievalSetting.objects.filter(umfrageID=surveyID)
            settingsTwo = FollowupSurvey.objects.filter(settings__in=settings)
            settingsTwo.delete()
            return Response({}, status=status.HTTP_200_OK)
