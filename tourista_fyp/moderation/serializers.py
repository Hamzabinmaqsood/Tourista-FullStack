# In moderation/serializers.py
from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        # The 'reporter' will be added automatically from the view.
        fields = ['id', 'reported_user', 'reason', 'details']