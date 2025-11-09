from django.db.models import Q
from rest_framework import viewsets, permissions, status  
from rest_framework.decorators import action  
from rest_framework.response import Response  
from .models import Hall, User, Booking
from .serializers import HallSerializer, UserSerializer, BookingSerializer
from rest_framework.views import APIView  
from rest_framework.permissions import IsAuthenticated 
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response


class HallViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Halls to be viewed or edited.
    """
    queryset = Hall.objects.all().order_by('name')
    serializer_class = HallSerializer
    # Only allow authenticated users to access this
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Users to be viewed.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# ... (HallViewSet and UserViewSet are already here) ...

class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating and viewing bookings.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can book

    def perform_create(self, serializer):
        """
        Automatically set the requester to the logged-in user
        and the initial status.
        """
        serializer.save(
            requester=self.request.user,
            status='PENDING_FACULTY'
        )

# --- THIS IS THE NEW APPROVAL LOGIC ---

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        Custom action to approve a booking.
        This is the core of the workflow engine.
        """
        booking = self.get_object()
        user = request.user

        try:
            if booking.status == 'PENDING_FACULTY' and user.role == 'FACULTY':
                booking.status = 'PENDING_HOD'
                booking.faculty_approver = user

            elif booking.status == 'PENDING_HOD' and user.role == 'HOD':
                booking.status = 'PENDING_ADMIN'
                booking.hod_approver = user

            elif booking.status == 'PENDING_ADMIN' and user.role == 'ADMIN':
                booking.status = 'APPROVED'
                booking.admin_approver = user

            else:
                # User doesn't have permission or booking is in the wrong state
                return Response(
                    {'error': 'You do not have permission to approve this booking at its current stage.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """
        Custom action to reject a booking.
        """
        booking = self.get_object()
        user = request.user

        # Any approver in the chain can reject
        if user.role not in ['FACULTY', 'HOD', 'ADMIN']:
            return Response(
                {'error': 'You do not have permission to reject this booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        booking.status = 'REJECTED'
        booking.rejection_reason = request.data.get('reason', 'No reason provided.')

        # Log who rejected it
        if user.role == 'FACULTY':
            booking.faculty_approver = user
        elif user.role == 'HOD':
            booking.hod_approver = user
        elif user.role == 'ADMIN':
            booking.admin_approver = user

        booking.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    def get_queryset(self):
        """
        This view should return a list of all the bookings
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff or user.role in ['ADMIN', 'HOD', 'FACULTY']:
            # Admins/approvers can see all bookings
            return Booking.objects.all()

        # Regular requesters only see their own bookings
        return Booking.objects.filter(requester=user)
    

class ApprovalQueueView(APIView):
    """
    A custom view to get the list of bookings waiting for the
    CURRENT logged-in user's approval.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        queryset = Booking.objects.none() # Start with an empty list

        if user.role == 'FACULTY':
            # Faculty sees bookings pending faculty approval
            queryset = Booking.objects.filter(status='PENDING_FACULTY')

        elif user.role == 'HOD':
            # HOD sees bookings pending HOD approval
            queryset = Booking.objects.filter(status='PENDING_HOD')

        elif user.role == 'ADMIN':
            # Admin sees bookings pending Admin approval
            queryset = Booking.objects.filter(status='PENDING_ADMIN')

        # 'REQUESTER' role will see an empty list, which is correct.

        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data)
    
class CustomLoginView(ObtainAuthToken):
    """
    Custom login view that returns the user's token, id, and role.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        # This is the data we're sending back to React
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'role': user.role  # <-- The most important field!
        })
    
class BookingHistoryView(APIView):
    """
    A custom view to get the list of bookings this user has
    already approved or rejected.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user

        # Find bookings where this user is listed as one of the approvers
        queryset = Booking.objects.filter(
            Q(faculty_approver=user) |
            Q(hod_approver=user) |
            Q(admin_approver=user)
        ).distinct().order_by('-id') # Order by newest first

        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data)