from django.contrib import admin
from .models import WeatherRequest


@admin.register(WeatherRequest)
class WeatherRequestAdmin(admin.ModelAdmin):
    """Admin interface for WeatherRequest model"""
    
    list_display = ('location_name', 'country', 'start_date', 'end_date', 'created_at', 'updated_at')
    list_filter = ('country', 'created_at', 'start_date')
    search_fields = ('location_name', 'country', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Location Information', {
            'fields': ('location_name', 'country', 'latitude', 'longitude', 'timezone')
        }),
        ('Date Range', {
            'fields': ('start_date', 'end_date')
        }),
        ('Weather Data', {
            'fields': ('weather_data',),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

