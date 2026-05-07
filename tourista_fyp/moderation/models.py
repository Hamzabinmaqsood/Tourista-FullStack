# In moderation/models.py
from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    REASON_CHOICES = [('SPAM', 'Spam'), ('ABUSE', 'Abuse'), ('SCAM', 'Scam')]
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_reports')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reports')
    reason = models.CharField(max_length=10, choices=REASON_CHOICES)
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)