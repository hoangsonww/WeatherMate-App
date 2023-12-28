from django.http import JsonResponse
from .models import WeatherData, UserPreference
from .serializers import WeatherDataSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view

class WeatherDataViewSet(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer

@api_view(['GET'])
def current_weather(request, city):
    weather = WeatherData.objects.filter(city=city).order_by('-timestamp').first()
    if weather:
        return Response({'city': weather.city, 'data': weather.data})
    return Response({'error': 'Weather data not found'}, status=404)
