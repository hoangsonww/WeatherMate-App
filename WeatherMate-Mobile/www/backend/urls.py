from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'weatherdata', views.WeatherDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('current/<str:city>/', views.current_weather),
]
