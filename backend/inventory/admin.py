from django.contrib import admin
from .models import Category, Supplier, Service, Medicine, Stock, StockMovement


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone', 'created_at']
    search_fields = ['name', 'contact_person', 'email']
    list_filter = ['created_at']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'barcode', 'category', 'supplier',
        'min_stock_level'
    ]
    list_filter = ['category', 'supplier', 'unit', 'created_at']
    search_fields = ['name', 'barcode', 'batch_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'barcode', 'description', 'category', 'supplier')
        }),
        ('Stock Information', {
            'fields': ('unit', 'min_stock_level')
        }),
        ('Additional Details', {
            'fields': ('batch_number', 'location')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['medicine', 'quantity', 'expiration_date', 'location', 'created_at']
    list_filter = ['expiration_date', 'created_at', 'location']
    search_fields = ['medicine__name', 'medicine__barcode', 'location']
    readonly_fields = ['created_at']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'medicine', 'service', 'type', 'quantity', 'unit_price', 'reference', 'movement_date', 'created_at'
    ]
    list_filter = ['type', 'movement_date', 'created_at']
    search_fields = ['medicine__name', 'reference', 'notes']
    readonly_fields = ['created_at']
    date_hierarchy = 'movement_date'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'etage', 'created_at']
    search_fields = ['name', 'etage']
    list_filter = ['created_at']
