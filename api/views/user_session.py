"""Authentication views for researcher user management."""

import regex
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from ..models import Researcher
from django.http.response import JsonResponse
from ..serializers import CreateSettingsUserSerializer

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'


def is_email(text):
    """Check if string is a valid email address."""
    return bool(regex.search(EMAIL_REGEX, text))


def validate_required_fields(data, fields):
    """Validate that required fields are not empty."""
    errors = {}
    for field in fields:
        if not data.get(field, '').strip():
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    return errors


class CheckUsernameAvailability(APIView):
    """Check if a username is available."""

    def get(self, request):
        username = request.query_params.get('username', '').lower().strip()
        if not username:
            return Response({'available': False}, status=status.HTTP_200_OK)
        
        exists = User.objects.filter(username__iexact=username).exists()
        return Response({'available': not exists}, status=status.HTTP_200_OK)


class CheckEmailAvailability(APIView):
    """Check if an email address is available."""

    def get(self, request):
        email = request.query_params.get('email', '').lower().strip()
        if not email:
            return Response({'available': False}, status=status.HTTP_200_OK)
        
        exists = User.objects.filter(email__iexact=email).exists()
        return Response({'available': not exists}, status=status.HTTP_200_OK)


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
    """Create a new researcher user account."""

    serializer_class = CreateSettingsUserSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        errors = {}
        req_data = request.data

        # Normalize to lowercase
        email = req_data.get('email', '').lower().strip()
        username = req_data.get('username', '').lower().strip()

        # Validate required fields
        field_errors = validate_required_fields({
            'first_name': req_data.get('first_name'),
            'last_name': req_data.get('last_name'),
            'username': username,
            'email': email,
            'institution': req_data.get('institution'),
            'password': req_data.get('password'),
        }, ['first_name', 'last_name', 'username', 'email', 'institution', 'password'])
        if field_errors:
            return Response({'errors': field_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Validate email format
        if not is_email(email):
            return Response({'errors': {'email': 'Invalid email address'}}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicate username and email
        if User.objects.filter(username__iexact=username).exists():
            errors['username'] = 'This username already exists'
        if User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'This email address is already in use'

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Create user with normalized credentials
        user = User.objects.create_user(
            username=username,
            email=email,
            password=req_data.get('password'),
            first_name=req_data.get('first_name').title(),
            last_name=req_data.get('last_name').title()
        )
        Researcher.objects.create(user=user, institution=req_data.get('institution'))

        self.request.session['username'] = user.username
        self.request.session['fullname'] = f"{user.first_name} {user.last_name}"

        return Response(CreateSettingsUserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginSettingsUser(APIView):
    """Authenticate user via username or email."""

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        email_input = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '').strip()

        # Validate required fields
        errors = {}
        if not email_input:
            errors['email'] = 'Username or email is required'
        if not password:
            errors['password'] = 'Password is required'
        if errors:
            return Response({'errors': errors}, status=status.HTTP_200_OK)

        # Try to authenticate
        user = None
        if is_email(email_input):
            # Find user by email (case-insensitive)
            try:
                user_by_email = User.objects.get(email__iexact=email_input)
                user = authenticate(username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            # Authenticate by username (case-insensitive)
            user = authenticate(username=email_input, password=password)
            if not user:
                try:
                    user_by_name = User.objects.get(username__iexact=email_input)
                    user = authenticate(username=user_by_name.username, password=password)
                except User.DoesNotExist:
                    pass

        if user:
            self.request.session['username'] = user.username
            self.request.session['fullname'] = f"{user.first_name} {user.last_name}"
            return Response({
                'username': user.username,
                'errors': {}
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'errors': {'password': 'Invalid username or password'}
            }, status=status.HTTP_200_OK)


class GetUserProfile(APIView):
    """Get the current user's profile information."""

    def get(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        username = request.session.get('username')
        if not username:
            return Response({'error': 'Not authenticated'}, 
                          status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(username=username)
            researcher = Researcher.objects.get(user=user)
            return Response({
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'institution': researcher.institution,
            }, status=status.HTTP_200_OK)
        except (User.DoesNotExist, Researcher.DoesNotExist):
            return Response({'error': 'User not found'}, 
                          status=status.HTTP_404_NOT_FOUND)


class UpdateUserProfile(APIView):
    """Update the current user's profile information."""

    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        username = request.session.get('username')
        if not username:
            return Response({'error': 'Not authenticated'}, 
                          status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(username=username)
            researcher = Researcher.objects.get(user=user)
        except (User.DoesNotExist, Researcher.DoesNotExist):
            return Response({'error': 'User not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

        errors = {}
        req_data = request.data

        # Validate and update first_name
        first_name = req_data.get('first_name', '').strip()
        if first_name and first_name != user.first_name:
            user.first_name = first_name.title()

        # Validate and update last_name
        last_name = req_data.get('last_name', '').strip()
        if last_name and last_name != user.last_name:
            user.last_name = last_name.title()

        # Validate and update email
        email = req_data.get('email', '').lower().strip()
        if email and email != user.email:
            if not is_email(email):
                errors['email'] = 'Invalid email address'
            elif User.objects.filter(email__iexact=email).exists():
                errors['email'] = 'This email address is already in use'
            else:
                user.email = email

        # Validate and update password
        new_password = req_data.get('new_password', '').strip()
        if new_password:
            old_password = req_data.get('old_password', '').strip()
            if not old_password:
                errors['old_password'] = 'Current password is required'
            elif not user.check_password(old_password):
                errors['old_password'] = 'Current password is incorrect'
            else:
                user.set_password(new_password)

        # Validate and update institution
        institution = req_data.get('institution', '').strip()
        if institution:
            researcher.institution = institution

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Save changes
        user.save()
        researcher.save()

        # Update session with new full name
        request.session['fullname'] = f"{user.first_name} {user.last_name}"

        return Response({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'institution': researcher.institution,
        }, status=status.HTTP_200_OK)
