
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Occupancy
from .serializers import OccupancySerializer

class OccupancyByMonthView(APIView):
    def get(self, request):
        month_year = request.GET.get('month_year')
        if not month_year:
            return Response({'error': 'month_year parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Accept both MM-YYYY and YYYY-MM formats
        queryset = Occupancy.objects.filter(month_year=month_year)
        if queryset.count() == 0:
            # Try alternate format if no results
            if '-' in month_year:
                parts = month_year.split('-')
                if len(parts) == 2 and len(parts[0]) == 2 and len(parts[1]) == 4:
                    alt_format = f"{parts[1]}-{parts[0]}"
                    queryset = Occupancy.objects.filter(month_year=alt_format)
        serializer = OccupancySerializer(queryset, many=True)
        return Response(serializer.data)
