from rest_framework import serializers
from .models import Occupancy, Budget

class OccupancySerializer(serializers.ModelSerializer):
    centre_name = serializers.CharField(source='centre.name', read_only=True)
    discover_api = serializers.CharField(source='centre.api_id', read_only=True)

    class Meta:
        model = Occupancy
        fields = ['id', 'centre_name', 'discover_api', 'month_year', 'u2', 'o2', 'total']


# Serializer for Budget model
class BudgetSerializer(serializers.ModelSerializer):
    centre_name = serializers.CharField(source='centre.name', read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'centre', 'centre_name', 'category', 'year', 'monthly_budget',
            'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
        ]
