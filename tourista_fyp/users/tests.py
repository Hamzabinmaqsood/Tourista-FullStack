# In users/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User

class UserRegistrationTest(APITestCase):
    """
    Test suite for the user registration endpoint.
    """

    def test_register_a_new_user_successfully(self):
        """
        Ensure we can create a new user with valid data.
        """
        # The 'reverse' function looks up the URL by its name from urls.py
        # This is better than hardcoding the URL string.
        url = reverse('auth_register')
        
        # The data we will send to the registration endpoint
        data = {
            'username': 'newtestuser',
            'email': 'newtestuser@example.com',
            'password': 'StrongPassword123',
            'password2': 'StrongPassword123'
        }
        
        # Use the test client to make a POST request
        response = self.client.post(url, data, format='json')
        
        # --- Assertions: Check if the test passed ---
        
        # 1. Check that the response status code is 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Check that a user was actually created in the database
        self.assertEqual(User.objects.count(), 1)
        
        # 3. Check that the created user has the correct username
        self.assertEqual(User.objects.get().username, 'newtestuser')

    def test_register_user_with_mismatched_passwords(self):
        """
        Ensure registration fails if passwords do not match.
        """
        url = reverse('auth_register')
        data = {
            'username': 'anotheruser',
            'email': 'another@example.com',
            'password': 'StrongPassword123',
            'password2': 'WrongPassword456'
        }
        
        response = self.client.post(url, data, format='json')
        
        # 1. Check that the response status code is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 2. Check that NO user was created in the database
        self.assertEqual(User.objects.count(), 0)