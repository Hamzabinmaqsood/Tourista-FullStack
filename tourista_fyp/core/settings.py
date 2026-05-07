from pathlib import Path
from datetime import timedelta
from decouple import config
import os
from dotenv import load_dotenv
load_dotenv()

# ──────────────────────────────────────────────
# BASE SETTINGS
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="unsafe-secret-key")
DEBUG = config("DEBUG", cast=bool, default=True)

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    '192.168.38.189',
    '10.251.52.189',
    '10.241.47.189',
    '10.12.80.189',
    '10.49.47.189',
    '172.16.20.154',
    '192.168.137.1',
    '172.16.21.31',
    '10.106.120.189',
    '192.168.137.154',
    '10.38.107.190',
    '192.168.100.23',
    'ce6d6e1b65df.ngrok-free.app',
    '192.168.18.99',
    '192.168.1.13',
    '10.206.96.189',
    # '10.44.241.189',
    '10.206.96.189',
    '192.168.43.189',
    '10.44.241.189'
]

# ──────────────────────────────────────────────
# THIRD-PARTY KEYS & API CONFIG
# ──────────────────────────────────────────────
OPENAI_API_KEY = config("OPENAI_API_KEY", default="")
OPENWEATHER_API_KEY = config("OPENWEATHER_API_KEY", default="")
GOOGLE_MAPS_API_KEY_ANDROID = config("GOOGLE_MAPS_API_KEY_ANDROID", default="")
GOOGLE_GEMINI_API_KEY = config("GOOGLE_GEMINI_API_KEY", default="")
GEMINI_API_KEY = config("GEMINI_API_KEY", default=os.getenv("GEMINI_API_KEY"))

# Payment Gateway
TOURISTA_COMMISSION_PERCENTAGE = 10.0
EASYPAISA_STORE_ID = config("EASYPAISA_STORE_ID", default="")
EASYPAISA_HASH_KEY = config("EASYPAISA_HASH_KEY", default="")
EASYPAISA_ENVIRONMENT = config("EASYPAISA_ENVIRONMENT", default="sandbox")

# ──────────────────────────────────────────────
# APPLICATIONS
# ──────────────────────────────────────────────
INSTALLED_APPS = [
    # Django Core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-Party
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'rest_framework_simplejwt.token_blacklist',

    # Local Apps
    'users',
    'planner',
    'utils',
    'vendors',
    'administration',
    'messaging',
    'feedback',
    'reviews',
    'moderation',
]

# ──────────────────────────────────────────────
# MIDDLEWARE
# ──────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ──────────────────────────────────────────────
# URL / TEMPLATE / WSGI
# ──────────────────────────────────────────────
ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ──────────────────────────────────────────────
# DATABASE
# (Switch to PostgreSQL for production)
# ──────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ──────────────────────────────────────────────
# PASSWORD VALIDATORS
# ──────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ──────────────────────────────────────────────
# INTERNATIONALIZATION
# ──────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Karachi'
USE_I18N = True
USE_TZ = False

# ──────────────────────────────────────────────
# STATIC & MEDIA FILES
# ──────────────────────────────────────────────
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ──────────────────────────────────────────────
# REST FRAMEWORK & JWT
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "SIGNING_KEY": SECRET_KEY,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Tourista API',
    'DESCRIPTION': 'Official API documentation for the Tourista FYDP.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ──────────────────────────────────────────────
# CORS CONFIG
# ──────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ──────────────────────────────────────────────
# DEFAULTS
# ──────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ──────────────────────────────────────────────
# GEMINI AI CONFIGURATION
# ──────────────────────────────────────────────
import google.generativeai as genai

try:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
    GEMINI_MODEL = genai.GenerativeModel("models/gemini-1.5-flash-latest")
    print("✅ Gemini AI configured successfully (using gemini-1.5-flash-latest).")
except Exception as e:
    GEMINI_MODEL = None
    print(f"❌ CRITICAL: Gemini configuration failed → {e}")
