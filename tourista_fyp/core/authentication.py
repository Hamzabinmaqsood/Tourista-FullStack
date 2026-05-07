# In core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class JWTMiddleware(JWTAuthentication):
    def authenticate(self, request):
        print("--- Custom Auth: Attempting to authenticate request ---")
        try:
            # This calls the parent class's authenticate method
            auth_tuple = super().authenticate(request)
            if auth_tuple:
                user, token = auth_tuple
                print(f"--- Custom Auth: SUCCESS! User '{user.username}' authenticated. ---")
            else:
                print("--- Custom Auth: No auth header found. Passing. ---")
            return auth_tuple
        except InvalidToken as e:
            print(f"--- Custom Auth: FAILED! Token is invalid. Reason: {e} ---")
            # We do not raise the exception, just return None so the request is unauthorized
            return None
        except Exception as e:
            print(f"--- Custom Auth: An unexpected error occurred: {e} ---")
            return None