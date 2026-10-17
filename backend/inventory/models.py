import uuid
from django.db import models
from django.utils import timezone
from django.db.models import Sum


class Category(models.Model):
    """Product categories for medicines and medical supplies"""
    
    TYPE_CHOICES = [
        ('medicine', 'Medicine'),
        ('material', 'Material'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Supplier information management"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'suppliers'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Service(models.Model):
    """Hospital or department service for stock exits"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    etage = models.CharField(max_length=255, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'
        ordering = ['name']

    def __str__(self):
        return self.name


class Medicine(models.Model):
    """Medicine and medical supply inventory"""
    
    UNIT_CHOICES = [
        ('piece', 'Pièce'),
        ('boite', 'Boîte'),
        ('flacon', 'Flacon'),
        ('sachet', 'Sachet'),
        ('tube', 'Tube'),
        ('ampoule', 'Ampoule'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=255, unique=True, null=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medicines'
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medicines'
    )
    description = models.TextField(null=True, blank=True)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='piece')
    min_stock_level = models.IntegerField(default=10)
    batch_number = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'medicines'
        ordering = ['name']
        indexes = [
            models.Index(fields=['barcode']),
            models.Index(fields=['category']),
            models.Index(fields=['supplier']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def is_low_stock(self):
        total = self.stocks.aggregate(total=Sum('quantity'))['total'] or 0
        return total <= self.min_stock_level
    
    @property
    def total_value(self):
        total = self.stocks.aggregate(total=Sum('quantity'))['total'] or 0
        return total * self.latest_unit_price

    @property
    def latest_unit_price(self):
        movement = (
            self.stock_movements
            .filter(type='entry', unit_price__isnull=False)
            .order_by('-movement_date', '-created_at')
            .first()
        )
        return movement.unit_price if movement else 0


class Stock(models.Model):
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name='stocks'
    )
    quantity = models.IntegerField()
    expiration_date = models.DateField()
    location = models.CharField(max_length=150, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock'
        ordering = ['expiration_date', 'created_at']
        indexes = [
            models.Index(fields=['medicine']),
            models.Index(fields=['expiration_date']),
        ]


class StockMovement(models.Model):
    """Track all stock entries and exits"""
    
    TYPE_CHOICES = [
        ('entry', 'Entry'),
        ('exit', 'Exit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name='stock_movements'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reference = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    movement_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-movement_date']
        indexes = [
            models.Index(fields=['medicine']),
            models.Index(fields=['movement_date']),
        ]
    
    def __str__(self):
        return f"{self.type} - {self.medicine.name} - {self.quantity}"


class DeliveryNote(models.Model):
    """Delivery note (Bon de livraison) header"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("validated", "Validated"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=50, unique=True)
    date = models.DateField(default=timezone.now)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="delivery_notes")
    reference = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    total_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "delivery_notes"
        ordering = ["-date", "-created_at"]
        permissions = [
            ("delete_validated_deliverynote", "Can delete validated delivery note"),
        ]

    def __str__(self):
        return f"BL {self.number} - {self.supplier.name}"


class DeliveryNoteItem(models.Model):
    """Delivery note line items"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_note = models.ForeignKey(DeliveryNote, on_delete=models.CASCADE, related_name="items")
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT, related_name="delivery_note_items")
    lot = models.CharField(max_length=100, null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "delivery_note_items"
        ordering = ["delivery_note__date", "medicine__name"]

    def __str__(self):
        return f"{self.medicine.name} x{self.quantity}"


class Invoice(models.Model):
    """Invoice (Facture) header"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("validated", "Validated"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=50, unique=True)
    date = models.DateField(default=timezone.now)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="invoices")
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    total_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "invoices"
        ordering = ["-date", "-created_at"]
        permissions = [
            ("delete_validated_invoice", "Can delete validated invoice"),
        ]

    def __str__(self):
        return f"Facture {self.number} - {self.supplier.name}"


class InvoiceItem(models.Model):
    """Invoice line items"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    delivery_note = models.ForeignKey(
        DeliveryNote, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoice_items"
    )
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT, related_name="invoice_items")
    lot = models.CharField(max_length=100, null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "invoice_items"
        ordering = ["invoice__date", "medicine__name"]

    def __str__(self):
        return f"{self.medicine.name} x{self.quantity}"
