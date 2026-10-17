from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.db.models import F, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.exceptions import ValidationError

from .models import (
    Category,
    Supplier,
    Service,
    Medicine,
    Stock,
    StockMovement,
    DeliveryNote,
    DeliveryNoteItem,
    Invoice,
)
from .serializers import (
    CategorySerializer,
    SupplierSerializer,
    ServiceSerializer,
    MedicineListSerializer,
    MedicineCreateUpdateSerializer,
    StockBatchSerializer,
    StockMovementSerializer,
    StockMovementCreateSerializer,
    DeliveryNoteSerializer,
    InvoiceSerializer,
)
from .permissions import IsAdminOrReadOnly, IsAdmin, DeliveryNotePermission, InvoicePermission


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category model
    Supports CRUD operations
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['type']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Supplier model
    Supports CRUD operations
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'etage', 'note']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class MedicineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Medicine model
    Supports CRUD operations with nested category and supplier
    """
    queryset = (
        Medicine.objects.select_related('category', 'supplier')
        .prefetch_related('stocks')
        .annotate(current_stock=Coalesce(Sum('stocks__quantity'), 0))
        .all()
    )
    permission_classes = [DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'barcode', 'batch_number', 'description']
    filterset_fields = ['category_id', 'supplier_id']
    ordering_fields = ['name', 'current_stock', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Use different serializers for list/retrieve vs create/update"""
        if self.action in ['list', 'retrieve']:
            return MedicineListSerializer
        return MedicineCreateUpdateSerializer
    
    def perform_update(self, serializer):
        """Save the update"""
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """Create medicine and return with nested data"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return with nested serializer
        instance = self.get_queryset().get(id=serializer.instance.id)
        output_serializer = MedicineListSerializer(instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Update medicine and return with nested data"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return with nested serializer
        instance = self.get_queryset().get(id=instance.id)
        output_serializer = MedicineListSerializer(instance)
        return Response(output_serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get medicines with low stock"""
        medicines = self.get_queryset().filter(current_stock__lte=F('min_stock_level'))
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Return all medicines without pagination (nested category and supplier)."""
        queryset = self.get_queryset()
        serializer = MedicineListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get medicines expiring within 30 days"""
        today = timezone.localdate()
        thirty_days = today + timedelta(days=30)

        medicine_ids = Stock.objects.filter(
            expiration_date__lte=thirty_days,
            expiration_date__gte=today,
            quantity__gt=0,
        ).values_list('medicine_id', flat=True).distinct()

        medicines = self.get_queryset().filter(id__in=medicine_ids)
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        """List existing stock batches (lots) for this medicine."""
        medicine = self.get_object()
        qs = Stock.objects.filter(medicine=medicine, quantity__gt=0).order_by('expiration_date', 'created_at')
        serializer = StockBatchSerializer(qs, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for StockMovement model
    Supports creating stock movements and viewing history
    """
    queryset = StockMovement.objects.select_related('medicine').all()
    permission_classes = [DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['medicine_id', 'type']
    ordering_fields = ['movement_date', 'created_at']
    ordering = ['-movement_date']
    pagination_class = None
    
    def get_serializer_class(self):
        """Use different serializers for create vs list/retrieve"""
        if self.action == 'create':
            return StockMovementCreateSerializer
        return StockMovementSerializer
    
    def create(self, request, *args, **kwargs):
        """Create stock movement and update medicine stock atomically"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create movement and update stock
        movement = serializer.save()
        
        # Return the created movement with standard serializer
        output_serializer = StockMovementSerializer(movement)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for Delivery Notes (Bons de livraison) with nested items and validation."""

    queryset = DeliveryNote.objects.select_related('supplier').prefetch_related('items__medicine').all()
    serializer_class = DeliveryNoteSerializer
    permission_classes = [DeliveryNotePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['number', 'reference', 'supplier__name']
    filterset_fields = ['supplier_id', 'status', 'date']
    ordering_fields = ['date', 'created_at', 'total_value', 'number']
    ordering = ['-date', '-created_at']

    @action(detail=True, methods=['post'], permission_classes=[DeliveryNotePermission])
    def validate(self, request, pk=None):
        """Validate a delivery note: update stocks and create stock movements, lock the note."""
        note = self.get_object()
        if note.status == 'validated':
            return Response({'detail': 'Déjà validé'}, status=status.HTTP_400_BAD_REQUEST)

        # Perform stock entries for each item
        for item in note.items.select_related('medicine').all():
            # Create stock movement
            StockMovement.objects.create(
                medicine=item.medicine,
                type='entry',
                quantity=item.quantity,
                unit_price=item.unit_price,
                reference=f"BL {note.number}",
                notes=note.notes or ''
            )
            if item.expiration_date:
                stock, _ = Stock.objects.get_or_create(
                    medicine=item.medicine,
                    expiration_date=item.expiration_date,
                    location=item.medicine.location,
                    defaults={'quantity': 0},
                )
                Stock.objects.filter(id=stock.id).update(quantity=F('quantity') + item.quantity)

        note.status = 'validated'
        note.save(update_fields=['status'])
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if instance.status == 'validated':
            with transaction.atomic():
                for item in instance.items.select_related('medicine').all():
                    if item.expiration_date:
                        stock = Stock.objects.select_for_update().filter(
                            medicine=item.medicine,
                            expiration_date=item.expiration_date,
                            location=item.medicine.location,
                        ).first()
                        if not stock:
                            raise ValidationError(
                                f"BL {instance.number}: Stock introuvable pour {item.medicine.name} (péremption {item.expiration_date})."
                            )
                        if stock.quantity < item.quantity:
                            raise ValidationError(
                                f"BL {instance.number}: Stock insuffisant pour {item.medicine.name} (péremption {item.expiration_date}). Disponible: {stock.quantity}."
                            )

                        StockMovement.objects.create(
                            medicine=item.medicine,
                            type='exit',
                            quantity=item.quantity,
                            unit_price=item.unit_price,
                            reference=f"Annulation BL {instance.number}",
                            notes=f"Suppression du bon de livraison {instance.number}",
                        )

                        remaining = stock.quantity - item.quantity
                        if remaining > 0:
                            Stock.objects.filter(id=stock.id).update(quantity=remaining)
                        else:
                            stock.delete()
        super().perform_destroy(instance)


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for Invoices (Factures) with nested items and validation."""

    queryset = Invoice.objects.select_related('supplier').prefetch_related('items__medicine').all()
    serializer_class = InvoiceSerializer
    permission_classes = [InvoicePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['number', 'supplier__name']
    filterset_fields = ['supplier_id', 'status', 'date', 'date_start', 'date_end']
    ordering_fields = ['date', 'created_at', 'total_value', 'number']
    ordering = ['-date', '-created_at']

    @action(detail=True, methods=['post'], permission_classes=[InvoicePermission])
    def validate(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'validated':
            return Response({'detail': 'Déjà validée'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'validated'
        invoice.save(update_fields=['status'])
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
