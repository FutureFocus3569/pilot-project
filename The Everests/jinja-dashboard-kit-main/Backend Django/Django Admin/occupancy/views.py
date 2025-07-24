
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
        queryset = Occupancy.objects.filter(month_year=month_year)
        serializer = OccupancySerializer(queryset, many=True)
        return Response(serializer.data)
