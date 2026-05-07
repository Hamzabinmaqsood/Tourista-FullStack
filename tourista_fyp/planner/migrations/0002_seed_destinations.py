# In planner/migrations/0002_seed_destinations.py

from django.db import migrations

def create_initial_destinations(apps, schema_editor):
    """
    Seeds the database with initial destinations from AJK and GB.
    """
    # We get the model from the versioned app registry
    Destination = apps.get_model('planner', 'Destination')

    destinations_data = [
        # --- Destinations in Azad Jammu & Kashmir (AJK) ---
        {
            "name": "Neelum Valley", "description": "A breathtaking valley with lush greenery, pristine rivers, and scenic views.",
            "city": "Muzaffarabad", "country": "Pakistan", "destination_type": "PARK", "average_cost": 75.00
        },
        {
            "name": "Ratti Gali Lake", "description": "An alpine glacial lake, also known as the 'Jewel of Neelum', accessible via a challenging trek.",
            "city": "Neelum Valley", "country": "Pakistan", "destination_type": "HIKING_TRAIL", "average_cost": 40.00
        },
        {
            "name": "Banjosa Lake", "description": "A beautiful artificial lake surrounded by dense pine forest and mountains, ideal for relaxation.",
            "city": "Rawalakot", "country": "Pakistan", "destination_type": "PARK", "average_cost": 30.00
        },
        
        # --- Destinations in Gilgit-Baltistan (GB) ---
        {
            "name": "Hunza Valley", "description": "Famous for its stunning mountain scenery, historic forts, and warm hospitality.",
            "city": "Hunza", "country": "Pakistan", "destination_type": "LANDMARK", "average_cost": 100.00
        },
        {
            "name": "Skardu Fort (Kharpocho)", "description": "A historic fort perched on a hilltop offering panoramic views of Skardu town and the Indus River.",
            "city": "Skardu", "country": "Pakistan", "destination_type": "MUSEUM", "average_cost": 20.00
        },
        {
            "name": "Deosai National Park", "description": "The 'Land of Giants', a high-altitude plateau known for its rich biodiversity and Himalayan brown bears.",
            "city": "Skardu", "country": "Pakistan", "destination_type": "PARK", "average_cost": 60.00
        },
        {
            "name": "Attabad Lake", "description": "A stunning turquoise lake formed after a massive landslide, perfect for boating and sightseeing.",
            "city": "Hunza", "country": "Pakistan", "destination_type": "BEACH", "average_cost": 50.00
        },
    ]

    # Use bulk_create for efficiency
    Destination.objects.bulk_create(
        [Destination(**data) for data in destinations_data]
    )


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_destinations),
    ]