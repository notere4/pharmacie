from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin_user(user):
    return (
        user
        and user.is_authenticated
        and (
            user.is_superuser
            or user.is_staff
            or user.groups.filter(name='Admin').exists()
        )
    )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return is_admin_user(request.user)


class IsStorekeeper(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name='Storekeeper').exists()
        )


class DeliveryNotePermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return request.user.has_perm('inventory.view_deliverynote')
        if getattr(view, 'action', None) == 'validate':
            return request.user.has_perm('inventory.change_deliverynote')
        if request.method == 'POST':
            return request.user.has_perm('inventory.add_deliverynote')
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_perm('inventory.change_deliverynote')
        if request.method == 'DELETE':
            return (
                request.user.has_perm('inventory.delete_deliverynote')
                or request.user.has_perm('inventory.delete_validated_deliverynote')
            )
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user.has_perm('inventory.view_deliverynote')
        if getattr(view, 'action', None) == 'validate':
            return request.user.has_perm('inventory.change_deliverynote')
        if request.method == 'DELETE':
            if getattr(obj, 'status', None) == 'validated':
                return request.user.has_perm('inventory.delete_validated_deliverynote')
            return request.user.has_perm('inventory.delete_deliverynote')
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_perm('inventory.change_deliverynote')
        return True


class InvoicePermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return request.user.has_perm('inventory.view_invoice')
        if getattr(view, 'action', None) == 'validate':
            return request.user.has_perm('inventory.change_invoice')
        if request.method == 'POST':
            return request.user.has_perm('inventory.add_invoice')
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_perm('inventory.change_invoice')
        if request.method == 'DELETE':
            return (
                request.user.has_perm('inventory.delete_invoice')
                or request.user.has_perm('inventory.delete_validated_invoice')
            )
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user.has_perm('inventory.view_invoice')
        if getattr(view, 'action', None) == 'validate':
            return request.user.has_perm('inventory.change_invoice')
        if request.method == 'DELETE':
            if getattr(obj, 'status', None) == 'validated':
                return request.user.has_perm('inventory.delete_validated_invoice')
            return request.user.has_perm('inventory.delete_invoice')
        if request.method in ['PUT', 'PATCH']:
            return request.user.has_perm('inventory.change_invoice')
        return True
