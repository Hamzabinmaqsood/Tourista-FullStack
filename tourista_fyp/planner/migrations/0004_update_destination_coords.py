# In planner/migrations/0003_update_destination_coords.py

from django.db import migrations

def add_coordinates_to_destinations(apps, schema_editor):
    Destination = apps.get_model('planner', 'Destination')
    
    # Coordinates for our AJK and GB destinations
    # (These are approximate and good for our app)
    coordinates = {
        "Neelum Valley": {"lat": 34.79, "lon": 74.29},
        "Ratti Gali Lake": {"lat": 34.83, "lon": 74.05},
        "Banjosa Lake": {"lat": 33.81, "lon": 73.81},
        "Hunza Valley": {"lat": 36.31, "lon": 74.65},
        "Skardu Fort (Kharpocho)": {"lat": 35.30, "lon": 75.63},
        "Deosai National Park": {"lat": 34.96, "lon": 75.42},
        "Attabad Lake": {"lat": 36.31, "lon": 74.86},
    }

    for name, coords in coordinates.items():
        try:
            destination_to_update = Destination.objects.get(name=name)
            destination_to_update.latitude = coords["lat"]
            destination_to_update.longitude = coords["lon"]
            destination_to_update.save()
        except Destination.DoesNotExist:
            # If a destination was deleted or renamed, we just skip it
            pass

class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0002_seed_destinations'), # Depends on the previous migration
    ]

    operations = [
        migrations.RunPython(add_coordinates_to_destinations),
    ]