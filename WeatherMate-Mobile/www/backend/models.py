from django.db import models

class WeatherData(models.Model):
    city = models.CharField(max_length=100)
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.city

class UserPreference(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    city = models.CharField(max_length=100)
    alert_type = models.CharField(max_length=50)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s preference"
