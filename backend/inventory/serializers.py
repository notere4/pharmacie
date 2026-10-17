from rest_framework import serializers
from django.utils import timezone
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
    InvoiceItem,
)
from django.db import transaction
from django.db.models import F, Sum


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'type', 'created_at']
        read_only_fields = ['id', 'created_at']


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'etage', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class StockBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'expiration_date', 'quantity', 'location', 'created_at']
        read_only_fields = ['id', 'expiration_date', 'quantity', 'location', 'created_at']


class MedicineListSerializer(serializers.ModelSerializer):
    """Serializer for Medicine list view with nested category and supplier"""
    
    category = CategorySerializer(read_only=True)
    supplier = SupplierSerializer(read_only=True)
    current_stock = serializers.IntegerField(read_only=True)
    stocks = StockBatchSerializer(many=True, read_only=True)
    unit_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'barcode', 'category', 'category_id', 'supplier', 
            'supplier_id', 'description', 'unit', 'unit_price', 'current_stock',
            'min_stock_level', 'batch_number', 'location', 'stocks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_unit_price(self, obj):
        return obj.latest_unit_price


class MedicineCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating Medicine"""
    # Map incoming category_id/supplier_id to the relation fields
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', allow_null=True, required=False
    )
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier', allow_null=True, required=False
    )
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'barcode', 'category_id', 'supplier_id', 'description',
            'unit', 'min_stock_level',
            'batch_number', 'location'
        ]
        read_only_fields = ['id']


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement model"""

    service = ServiceSerializer(read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'medicine_id', 'service', 'type', 'quantity', 'unit_price', 'reference',
            'notes', 'movement_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate(self, attrs):
        """Validate stock movement"""
        medicine = attrs.get('medicine_id')
        movement_type = attrs.get('type')
        quantity = attrs.get('quantity')
        
        # For exit, check if there's enough stock
        if movement_type == 'exit' and medicine:
            available = Stock.objects.filter(medicine=medicine).aggregate(total=Sum('quantity'))['total'] or 0
            if quantity > available:
                raise serializers.ValidationError(
                    f"Insufficient stock. Available: {available}"
                )
        
        return attrs


class StockMovementCreateSerializer(serializers.Serializer):
    """Serializer for creating stock movement and updating medicine stock"""
    
    medicine_id = serializers.UUIDField()
    type = serializers.ChoiceField(choices=['entry', 'exit'])
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    service_id = serializers.UUIDField(required=False)
    expiration_date = serializers.DateField(required=False)
    location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    reference = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate(self, attrs):
        """Validate stock movement and check medicine availability"""
        try:
            medicine = Medicine.objects.get(id=attrs['medicine_id'])
        except Medicine.DoesNotExist:
            raise serializers.ValidationError("Medicine not found")

        movement_type = attrs['type']
        quantity = attrs['quantity']
        service_id = attrs.get('service_id')
        unit_price = attrs.get('unit_price')

        # Option B: exit by expiration_date
        if movement_type == 'exit':
            if not attrs.get('expiration_date'):
                raise serializers.ValidationError({'expiration_date': 'This field is required for exit movements'})

            if not service_id:
                raise serializers.ValidationError({'service_id': 'This field is required for exit movements'})

            stock_qs = Stock.objects.filter(
                medicine=medicine,
                expiration_date=attrs['expiration_date'],
            )
            if attrs.get('location'):
                stock_qs = stock_qs.filter(location=attrs['location'])

            available = stock_qs.aggregate(total=Sum('quantity'))['total'] or 0
            if quantity > available:
                raise serializers.ValidationError({
                    'quantity': f"Insufficient stock for this expiration date. Available: {available}"
                })

        # For entry, expiration_date is required to create a batch
        if movement_type == 'entry' and not attrs.get('expiration_date'):
            raise serializers.ValidationError({'expiration_date': 'This field is required for entry movements'})

        if movement_type == 'entry':
            if unit_price is None:
                raise serializers.ValidationError({'unit_price': 'This field is required for entry movements'})
            if unit_price <= 0:
                raise serializers.ValidationError({'unit_price': 'Price must be greater than 0'})
        if unit_price is not None and unit_price < 0:
            raise serializers.ValidationError({'unit_price': 'Price cannot be negative'})
        
        attrs['medicine'] = medicine
        if service_id:
            try:
                attrs['service'] = Service.objects.get(id=service_id)
            except Service.DoesNotExist:
                raise serializers.ValidationError({'service_id': 'Service not found'})
        return attrs
    
    def create(self, validated_data):
        """Create stock movement and update medicine stock"""
        movement_type = validated_data['type']
        quantity = validated_data['quantity']
        expiration_date = validated_data.get('expiration_date')
        location = validated_data.get('location')

        with transaction.atomic():
            # Lock the medicine row for update to prevent race conditions
            medicine = (
                Medicine.objects.select_for_update()
                .get(id=validated_data['medicine_id'])
            )

            # Create stock movement
            movement = StockMovement.objects.create(
                medicine=medicine,
                service=validated_data.get('service'),
                type=movement_type,
                quantity=quantity,
                unit_price=validated_data.get('unit_price'),
                reference=validated_data.get('reference'),
                notes=validated_data.get('notes'),
            )

            if movement_type == 'entry':
                stock, _ = Stock.objects.select_for_update().get_or_create(
                    medicine=medicine,
                    expiration_date=expiration_date,
                    location=location,
                    defaults={'quantity': 0},
                )
                Stock.objects.filter(id=stock.id).update(quantity=F('quantity') + quantity)
            else:  # exit
                stock = Stock.objects.select_for_update().filter(
                    medicine=medicine,
                    expiration_date=expiration_date,
                    location=location,
                ).first()
                if not stock:
                    raise serializers.ValidationError({
                        'expiration_date': 'Stock batch not found for this expiration date'
                    })
                if quantity > stock.quantity:
                    raise serializers.ValidationError({
                        'quantity': f"Insufficient stock for this expiration date. Available: {stock.quantity}"
                    })
                Stock.objects.filter(id=stock.id).update(quantity=F('quantity') - quantity)
                stock.refresh_from_db(fields=['quantity'])
                if stock.quantity <= 0:
                    stock.delete()

        return movement


class DeliveryNoteItemMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'barcode']
        read_only_fields = ['id', 'name', 'barcode']


class DeliveryNoteItemSerializer(serializers.ModelSerializer):
    medicine_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.all(), source='medicine'
    )
    medicine = DeliveryNoteItemMedicineSerializer(read_only=True)

    class Meta:
        model = DeliveryNoteItem
        fields = [
            'id', 'medicine', 'medicine_id', 'lot', 'expiration_date',
            'quantity', 'unit_price', 'line_total'
        ]
        read_only_fields = ['id', 'line_total']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value


class DeliveryNoteSerializer(serializers.ModelSerializer):
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier'
    )
    supplier = SupplierSerializer(read_only=True)
    items = DeliveryNoteItemSerializer(many=True)

    class Meta:
        model = DeliveryNote
        fields = [
            'id', 'number', 'date', 'supplier_id', 'supplier', 'reference', 'notes',
            'status', 'total_value', 'created_at', 'items'
        ]
        read_only_fields = ['id', 'number', 'status', 'total_value', 'created_at']

    def _recompute_totals(self, instance: DeliveryNote):
        total = 0
        for item in instance.items.all():
            item.line_total = item.quantity * item.unit_price
            item.save(update_fields=['line_total'])
            total += item.line_total
        instance.total_value = total
        instance.save(update_fields=['total_value'])

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        with transaction.atomic():
            # Auto-numbering if not supplied: BL-YYYY-MM-####
            number = validated_data.get('number')
            if not number:
                from datetime import datetime
                prefix = datetime.now().strftime('BL-%Y-%m-')
                # naive incremental per create count (can be improved later)
                count = DeliveryNote.objects.filter(number__startswith=prefix).count() + 1
                validated_data['number'] = f"{prefix}{count:04d}"

            note = DeliveryNote.objects.create(**validated_data)
            for item in items_data:
                DeliveryNoteItem.objects.create(delivery_note=note, **item)
            self._recompute_totals(note)
            return note

    def update(self, instance, validated_data):
        if instance.status == 'validated':
            raise serializers.ValidationError('Validated delivery notes cannot be edited')
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                DeliveryNoteItem.objects.create(delivery_note=instance, **item)
        self._recompute_totals(instance)
        return instance


class InvoiceItemSerializer(serializers.ModelSerializer):
    medicine_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.all(), source='medicine'
    )
    medicine = DeliveryNoteItemMedicineSerializer(read_only=True)
    delivery_note_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryNote.objects.all(), source='delivery_note', required=False, allow_null=True
    )
    delivery_note_number = serializers.CharField(
        source='delivery_note.number', read_only=True
    )

    class Meta:
        model = InvoiceItem
        fields = [
            'id',
            'delivery_note_id',
            'delivery_note_number',
            'medicine',
            'medicine_id',
            'lot',
            'expiration_date',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = ['id', 'line_total', 'delivery_note_number']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    date = serializers.DateField(default=timezone.localdate)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier'
    )
    supplier = SupplierSerializer(read_only=True)
    items = InvoiceItemSerializer(many=True)
    delivery_note_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Invoice
        fields = [
            'id',
            'number',
            'date',
            'supplier_id',
            'supplier',
            'date_start',
            'date_end',
            'notes',
            'status',
            'total_value',
            'created_at',
            'updated_at',
            'delivery_note_ids',
            'items',
        ]
        read_only_fields = ['id', 'number', 'status', 'total_value', 'created_at', 'updated_at']

    def _recompute_totals(self, instance: Invoice):
        total = 0
        for item in instance.items.all():
            item.line_total = item.quantity * item.unit_price
            item.save(update_fields=['line_total'])
            total += item.line_total
        instance.total_value = total
        instance.save(update_fields=['total_value'])

    def _validate_delivery_note_suppliers(self, supplier, items_data):
        for item in items_data:
            note = item.get('delivery_note')
            if note and note.supplier_id != supplier.id:
                raise serializers.ValidationError(
                    "All delivery notes must belong to the selected supplier"
                )

    def create(self, validated_data):
        validated_data.pop('delivery_note_ids', None)
        items_data = validated_data.pop('items', [])
        with transaction.atomic():
            number = validated_data.get('number')
            if not number:
                from datetime import datetime
                prefix = datetime.now().strftime('FA-%Y-%m-')
                count = Invoice.objects.filter(number__startswith=prefix).count() + 1
                validated_data['number'] = f"{prefix}{count:04d}"

            supplier = validated_data.get('supplier')
            if supplier:
                self._validate_delivery_note_suppliers(supplier, items_data)

            invoice = Invoice.objects.create(**validated_data)
            for item in items_data:
                InvoiceItem.objects.create(invoice=invoice, **item)
            self._recompute_totals(invoice)
            return invoice

    def update(self, instance, validated_data):
        validated_data.pop('delivery_note_ids', None)
        if instance.status == 'validated':
            raise serializers.ValidationError('Validated invoices cannot be edited')
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            if instance.supplier:
                self._validate_delivery_note_suppliers(instance.supplier, items_data)
            instance.items.all().delete()
            for item in items_data:
                InvoiceItem.objects.create(invoice=instance, **item)
        self._recompute_totals(instance)
        return instance
