from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import User


class WeatherRequest(models.Model):
    """
    Model to store weather data requests with date ranges
    """
    # User who created this request
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='weather_requests',
        help_text="User who created this weather request"
    )
    
    # Location information
    location_name = models.CharField(max_length=255, help_text="City or location name")
    country = models.CharField(max_length=100, blank=True, help_text="Country name")
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Latitude coordinate"
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        help_text="Longitude coordinate"
    )
    timezone = models.CharField(max_length=100, default="UTC", help_text="Location timezone")
    
    # Date range
    start_date = models.DateField(help_text="Start date of weather data range")
    end_date = models.DateField(help_text="End date of weather data range")
    
    # Weather data (stored as JSON for flexibility)
    weather_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Stored weather data for the date range"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, help_text="Optional notes about this request")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['location_name']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.location_name} ({self.start_date} to {self.end_date})"
    
    def clean(self):
        """Validate that start_date is before end_date"""
        from django.core.exceptions import ValidationError
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date must be before or equal to end date")
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.clean()
        super().save(*args, **kwargs)
