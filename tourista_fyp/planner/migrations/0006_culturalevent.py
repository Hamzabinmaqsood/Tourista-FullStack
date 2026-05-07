# In planner/migrations/0006_culturalevent.py

from django.db import migrations, models
from datetime import date

def create_initial_events(apps, schema_editor):
    """
    Seeds the database with initial cultural events right after creating the model.
    """
    # We use the real model here since this function is now part of the same
    # migration that creates the model.
    CulturalEvent = apps.get_model('planner', 'CulturalEvent')

    events_data = [
        {
            "name": "Shandur Polo Festival",
            "description": "An annual polo tournament between teams from Gilgit and Chitral, held at the world's highest polo ground.",
            "city": "Gilgit", "start_date": date(2024, 7, 7), "end_date": date(2024, 7, 9),
            "category": "SPORT"
        },
        {
            "name": "Jashn-e-Navroz",
            "description": "A vibrant spring festival celebrating the Persian New Year with music, dance, and traditional food.",
            "city": "Hunza", "start_date": date(2025, 3, 21), "end_date": date(2025, 3, 23),
            "category": "FESTIVAL"
        },
        {
            "name": "Silk Route Festival",
            "description": "A cultural extravaganza showcasing the traditions, crafts, and cuisines of the entire Gilgit-Baltistan region.",
            "city": "Skardu", "start_date": date(2024, 9, 15), "end_date": date(2024, 9, 18),
            "category": "FESTIVAL"
        },
    ]

    CulturalEvent.objects.bulk_create([CulturalEvent(**data) for data in events_data])

class Migration(migrations.Migration):

    # This migration depends on the one just before it
    dependencies = [
        ('planner', '0005_merge_20250709_0029'),
    ]

    operations = [
        # Step 1: Create the database table for the CulturalEvent model
        migrations.CreateModel(
            name='CulturalEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('city', models.CharField(max_length=100)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('category', models.CharField(choices=[('FESTIVAL', 'Festival'), ('CONCERT', 'Concert'), ('EXHIBITION', 'Exhibition'), ('SPORT', 'Sport'), ('FOOD', 'Food')], max_length=20)),
            ],
        ),
        # Step 2: Run the Python function to add the initial data
        migrations.RunPython(create_initial_events),
    ]