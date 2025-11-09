from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Hall, Booking

# We need a custom admin class to show our 'role' field
class CustomUserAdmin(UserAdmin):
    model = User
    # Add our custom 'role' field to the display and edit lists
    list_display = ('username', 'email', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )

# A simple admin for Halls
class HallAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity')
    search_fields = ('name', 'location')
    fields = ['name', 'capacity', 'location', 'amenities', 'image']

# A more complex admin for Bookings to see the workflow
class BookingAdmin(admin.ModelAdmin):
    list_display = ('event_title', 'hall', 'requester', 'status', 'start_time', 'end_time')
    list_filter = ('status', 'hall')
    search_fields = ('event_title', 'requester__username')

# Register your models here
admin.site.register(User, CustomUserAdmin)
admin.site.register(Hall, HallAdmin)
admin.site.register(Booking, BookingAdmin)