# In utils/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.conf import settings
import openai

# Initialize the client safely
try:
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception as e:
    print(f"CRITICAL: Failed to initialize OpenAI client. Key might be missing. Error: {e}")
    client = None

class TranslationView(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request, *args, **kwargs):
        if not client:
            return Response({"error": "OpenAI API service is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if 'audio' not in request.data:
            return Response({"error": "Audio file not provided."}, status=status.HTTP_400_BAD_REQUEST)

        audio_file_obj = request.data['audio']
        
        try:
            print("--- Backend: Received audio file. Attempting to transcribe... ---")
            
            # THIS IS THE FIX: Pass the file content directly.
            # This is the most robust way to handle the file upload.
            transcript = client.audio.transcriptions.create(
              model="whisper-1", 
              file=(audio_file_obj.name, audio_file_obj.read())
            )
            transcribed_text = transcript.text
            print(f"--- Backend: Transcription successful: '{transcribed_text}' ---")

            target_lang = request.data.get('target_lang', 'Urdu')
            source_lang = request.data.get('source_lang', 'English')
            
            print(f"--- Backend: Attempting to translate to {target_lang}... ---")
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are an expert translator. Translate the following text from {source_lang} to {target_lang}."},
                    {"role": "user", "content": transcribed_text}
                ]
            )
            translated_text = chat_completion.choices[0].message.content
            print(f"--- Backend: Translation successful: '{translated_text}' ---")

            return Response({
                "transcribed_text": transcribed_text,
                "translated_text": translated_text,
            }, status=status.HTTP_200_OK)
        
        # THIS IS THE FIX: More specific error handling for OpenAI issues
        except openai.APIStatusError as e:
            print(f"--- Backend ERROR: OpenAI API Status Error ---")
            print(f"Status Code: {e.status_code}")
            print(f"Response: {e.response.text}")
            return Response({"error": f"OpenAI API Error: {e.response.json().get('error', {}).get('message', 'Unknown error')}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"--- Backend ERROR: An unexpected error occurred: {e} ---")
            return Response({"error": f"An unexpected server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)