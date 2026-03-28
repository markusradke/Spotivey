"""Authentication views for researcher user management."""

import regex
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http.response import JsonResponse


from ..serializers import CreateSettingsUserSerializer, LoginUserSerializerEins, LoginUserSerializerZwei    

regexString = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

def check_email(usernameString):
    #Check if string is an email address

    if regex.search(regexString, usernameString):
        check = 0
    else:
        check = 1

    return check


class GetUserSession(APIView):
    """Get session data for users (researchers)"""
    
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        fullName = self.request.session.get('fullname', None)

        data = {
            'username': self.request.session.get('username'),
            'fullName': fullName,
        }
        return JsonResponse(data, status=status.HTTP_200_OK)

class LogoutUser(APIView):
    # Deletes user and all associated cookies

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        self.request.session.flush()
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)




class CreateSettingsUser(APIView):
    # Creates a user who can log in to Spotivey

    serializer_class = CreateSettingsUserSerializer
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        check = check_email(request.data.get('email').lower())

        if check == 1:
            msg = {
                'error': True,
                'msg': "Email-Adresse ist nicht gültig",
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        request_values = list(request.data.values())

        if '' in request_values:
            msg = {
                'error': True,
                'msg': "Bitte füllen Sie alle Felder aus",
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        username_request = request.data.get('username')
        queryset = User.objects.filter(username=username_request)
        if queryset.exists():
            msg = {
                'error': True,
                'msg': "'" + username_request + "'" + ' existiert schon, bitte einen anderen eingeben.',
            }
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                password = serializer.data.get('password')
                email_address = serializer.data.get('email').lower()
                first_name = serializer.data.get('first_name')
                last_name = serializer.data.get('last_name')
                username = serializer.data.get('username')

                user = User(first_name=first_name, last_name=last_name, username=username,
                            email=email_address, password=password)
                user.save()
                user.set_password(user.password)
                user.save()

                self.request.session['username'] = user.username
                self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()

                return Response(CreateSettingsUserSerializer(user).data, status=status.HTTP_201_CREATED)
            return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class LoginSettingsUser(APIView):
    # Check login entry, errors are returned if necessary
    # You can log in via email and username

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        check = check_email(request.data.get('email').lower())

        request_values = list(request.data.values())

        if '' in request_values:
            errorPW = request_values[1] == ''
            errorUsername = request_values[0] == ''
            msgPW = "Please enter your password" if errorPW else ""
            msgUsername = "Please enter your username" if errorUsername else ""
            msg = {
                'error': True,
                'errorPW': errorPW,
                'errorUsername':errorUsername,
                'msgPW': msgPW,
                'msgUsername': msgUsername,
                'msg': "Bitte füllen Sie alle Felder aus",
            }
            return Response(msg, status=status.HTTP_200_OK)

        password = request.data.get('password')
        email_address = request.data.get('email')

    
        if check == 0:
            user = User.objects.filter(email=email_address)
            username_list = list(user.values('username'))
            if len(username_list) > 1:
                return Response({
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "There are several users under this email address, please use your username",
                    'msg': "mehrere User mit der Mail",
                }, status=status.HTTP_200_OK)
            elif len(username_list) == 0:
                return Response({
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "No profile was found with this username, please check your entry.",
                    'msg': "no profile",
                }, status=status.HTTP_200_OK)
            else:
                user = authenticate(email=username_list[0], password=password)

                if user is None:
                   return Response({
                    'error': True,
                    'errorPW': True,
                    'errorUsername': False,
                    'msgPW': 'Incorrect password',
                    'msgUsername': "",
                    'msg': "no profile",
                }, status=status.HTTP_200_OK) 
                self.request.session['username'] = user.username
                self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()
        else:
            caseSensitiveUsername = email_address
            try:
                findUser = User._default_manager.get(username__iexact=email_address)
            except User.DoesNotExist:
                findUser = None
                msg = {
                    'error': True,
                    'errorPW': False,
                    'errorUsername': True,
                    'msgPW': '',
                    'msgUsername': "No profile was found with this username, please check your entry.",
                    'msg': "no profile",
                }
                return Response(msg, status=status.HTTP_200_OK)
            if findUser is not None:
                caseSensitiveUsername = findUser
            
            user = authenticate(username=caseSensitiveUsername, password=password)
            
        if user is not None:
            self.request.session['username'] = user.username
            self.request.session['fullname'] = user.first_name.title() + ' ' + user.last_name.title()

            msg = {
		        'username': user.username,
                'error': False,
                'errorPW': False,
                'errorUsername': False,
                'msgPW': '',
                'msgUsername': "",
                'msg': "",
            }
            return Response(msg, status=status.HTTP_200_OK)
        else:
            msg = {
                'error': True,
                'errorPW': True,
                'errorUsername': False,
                'msgPW': 'Incorrect password',
                'msgUsername': "",
                'msg': "no profile",
            }
            return Response(msg, status=status.HTTP_200_OK)
