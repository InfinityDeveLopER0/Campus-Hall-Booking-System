from rest_framework import serializers
from .models import User, Hall, Booking, STATUS_CHOICES

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, exposing essential fields.
    """
    class Meta:
        model = User
        # Fields to include in the JSON output
        fields = ['id', 'username', 'email', 'role']

class HallSerializer(serializers.ModelSerializer):
    """
    Serializer for the Hall model.
    """
    class Meta:
        model = Hall
        fields = [
            'id',
            'name',
            'capacity',
            'location',
            'amenities',
            'image'  # <-- ADD THIS FIELD
        ]
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    # Use ReadOnlyField to have the API set this automatically
    requester = serializers.ReadOnlyField(source='requester.username')

    # Use StringRelatedField to show the hall's name, not its ID
    hall = serializers.StringRelatedField()

    # This allows the user to POST the hall ID, but we'll show the name
    hall_id = serializers.PrimaryKeyRelatedField(
        queryset=Hall.objects.all(), source='hall', write_only=True
    )

    # Show the "display" name of the status (e.g., "Pending Faculty Approval")
    status = serializers.ChoiceField(choices=STATUS_CHOICES, read_only=True)

    faculty_approver = serializers.StringRelatedField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True) # HOD can see faculty's rejection reason (if any)
    hod_approver = serializers.StringRelatedField(read_only=True)
    admin_approver = serializers.StringRelatedField(read_only=True)

    rejection_reason = serializers.CharField(read_only=True)
    

    class Meta:
        model = Booking
        fields = [
            'id', 
            'event_title', 
            'event_description', 
            'start_time', 
            'end_time', 
            'hall',         # For GET requests (shows name)
            'hall_id',      # For POST requests (takes ID)
            'requester', 
            'status',
            'faculty_approver', 
            'hod_approver',
            'admin_approver',
            'rejection_reason',
            
        ]

        # These fields are set by the API, not the user, so they are read-only
        read_only_fields = ['requester', 'status']