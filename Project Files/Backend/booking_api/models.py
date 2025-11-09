from django.db import models
from django.contrib.auth.models import AbstractUser

# --- User Role Choices ---
ROLE_CHOICES = [
    ('REQUESTER', 'Requester'),
    ('FACULTY', 'Faculty'),
    ('HOD', 'Head of Department'),
    ('ADMIN', 'Admin'),
]

# --- Booking Status Choices ---
STATUS_CHOICES = [
    ('PENDING_FACULTY', 'Pending Faculty Approval'),
    ('PENDING_HOD', 'Pending HOD Approval'),
    ('PENDING_ADMIN', 'Pending Admin Approval'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
]



class User(AbstractUser):
    """
    Extends the default Django User to include a 'role' for the workflow.
    """
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='REQUESTER',
        help_text="The user's role in the system (defines permissions)."
    )
    
    # We can add a unique related_name to avoid clashes with default User's related fields
    # This is important if we use 'User' as a foreign key multiple times.
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='booking_users_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='booking_users_permissions',
        blank=True
    )



class Hall(models.Model):
    """
    Represents a bookable event space/hall.
    """
    name = models.CharField(max_length=100, unique=True)
    capacity = models.IntegerField(default=10)
    location = models.CharField(max_length=255)
    amenities = models.TextField(blank=True, null=True, help_text="e.g., Projector, AC, Podium")
    image = models.ImageField(upload_to='hall_images/', null=True, blank=True)

    def __str__(self):
        return self.name
    
# booking_api/models.py (Cont.)

class Booking(models.Model):
    """
    Tracks a hall reservation request and its status through the approval chain.
    """
    requester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='made_bookings'
    )
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='reservations')
    
    event_title = models.CharField(max_length=255)
    event_description = models.TextField()

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING_FACULTY',
        help_text="Current stage of the approval process."
    )
    
    # Audit trail fields - nullable as they are filled upon approval
    faculty_approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='faculty_approvals',
        null=True, blank=True
    )
    hod_approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='hod_approvals',
        null=True, blank=True
    )
    admin_approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='admin_approvals',
        null=True, blank=True
    )

    rejection_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status}] {self.event_title} in {self.hall.name}"
    
