from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    SupplierViewSet,
    ServiceViewSet,
    MedicineViewSet,
    StockMovementViewSet,
    DeliveryNoteViewSet,
    InvoiceViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'medicines', MedicineViewSet, basename='medicine')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')
router.register(r'delivery-notes', DeliveryNoteViewSet, basename='delivery-note')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
