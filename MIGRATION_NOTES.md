# Migration from Supabase to Django Backend

## Overview
This document outlines the migration from Supabase (PostgreSQL + REST API) to a custom Django REST Framework backend.

## Changes Made

### 1. Backend (New)

#### Created Django Project Structure
```
backend/
├── medstock_project/          # Project configuration
│   ├── settings.py           # Django settings with CORS, DRF config
│   ├── urls.py               # Root URL configuration
│   ├── wsgi.py               # WSGI entry point
│   └── asgi.py               # ASGI entry point
├── inventory/                # Main application
│   ├── models.py             # Category, Supplier, Medicine, StockMovement
│   ├── serializers.py        # DRF serializers
│   ├── views.py              # ViewSets for API endpoints
│   ├── urls.py               # API URL routing
│   └── admin.py              # Admin panel configuration
├── requirements.txt          # Python dependencies
└── manage.py                 # Django management script
```

#### Database Models
All Supabase tables were recreated as Django models:
- **Category**: Product categories (medicines/materials)
- **Supplier**: Supplier information
- **Medicine**: Complete medicine inventory with relationships
- **StockMovement**: Transaction history for stock changes

**Key Features**:
- UUID primary keys (matching Supabase)
- Proper foreign key relationships
- Indexes on frequently queried fields
- Model properties (`is_low_stock`, `total_value`)
- Automatic timestamps

#### API Endpoints
Created RESTful API with Django REST Framework:

**Categories**: `/api/categories/`
- List, Create, Retrieve, Update, Delete
- Search by name, description
- Filter by type

**Suppliers**: `/api/suppliers/`
- List, Create, Retrieve, Update, Delete
- Search by name, contact person, email

**Medicines**: `/api/medicines/`
- List, Create, Retrieve, Update, Delete
- Nested serializers for category and supplier
- Search by name, barcode, batch number
- Filter by category, supplier
- Custom endpoints: `low_stock/`, `expiring_soon/`

**Stock Movements**: `/api/stock-movements/`
- List, Create, Retrieve
- Automatic stock quantity updates
- Validation for insufficient stock
- Filter by medicine, type

### 2. Frontend Changes

#### Created New API Client (`src/lib/api.ts`)
Replaced `src/lib/supabase.ts` with custom API client:
- Type-safe fetch wrapper
- Centralized error handling
- Organized API functions by entity
- Support for query parameters
- JSON serialization/deserialization

**API Functions**:
```typescript
categoriesApi: { getAll, getById, create, update, delete }
suppliersApi: { getAll, getById, create, update, delete }
medicinesApi: { getAll, getById, create, update, delete, getLowStock, getExpiringSoon }
stockMovementsApi: { getAll, getById, create }
```

#### Updated Data Hook (`src/hooks/useData.ts`)
- Replaced Supabase queries with API calls
- Added proper `useCallback` for memoization
- Fixed React dependency warnings
- Improved error handling
- Maintained same interface for components

#### Updated Components
Modified all components to use new API client:

**MedicineModal.tsx**:
- Replaced Supabase `insert`/`update` with `medicinesApi.create/update`
- Simplified error handling
- Removed unused `updated_at` field

**MedicineList.tsx**:
- Replaced Supabase `delete` with `medicinesApi.delete`
- Maintained same UI/UX

**StockMovementModal.tsx**:
- Replaced Supabase transaction logic with single `stockMovementsApi.create`
- Backend now handles stock updates automatically
- Simplified client-side logic

**SuppliersManager.tsx**:
- Replaced Supabase `insert`/`update`/`delete` with `suppliersApi` methods
- Maintained same functionality

### 3. Configuration Files

#### Backend Configuration
- **`.env.example`**: Template for environment variables
- **`requirements.txt`**: Python dependencies
- **`settings.py`**: CORS, database, DRF configuration

#### Frontend Configuration
- **`.env.example`**: Updated with `VITE_API_URL`
- **`package.json`**: Removed `@supabase/supabase-js` dependency
- Kept all other dependencies unchanged

### 4. Documentation
- **`README.md`**: Comprehensive setup and usage guide
- **`MIGRATION_NOTES.md`**: This file

## Breaking Changes

### Removed
1. **Supabase Client** (`@supabase/supabase-js` package)
2. **Supabase Configuration** (`src/lib/supabase.ts`, `src/lib/database.types.ts`)
3. **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Added
1. **Django Backend** (entire `backend/` directory)
2. **API Client** (`src/lib/api.ts`)
3. **Environment Variable**: `VITE_API_URL`

### Modified
1. **All Components**: Updated to use new API client
2. **Data Hook**: Refactored for new API
3. **Package.json**: Removed Supabase dependency

## Data Migration

If you have existing data in Supabase, you'll need to:

1. **Export data from Supabase**:
   ```sql
   COPY categories TO '/tmp/categories.csv' CSV HEADER;
   COPY suppliers TO '/tmp/suppliers.csv' CSV HEADER;
   COPY medicines TO '/tmp/medicines.csv' CSV HEADER;
   COPY stock_movements TO '/tmp/stock_movements.csv' CSV HEADER;
   ```

2. **Import into Django database**:
   ```bash
   python manage.py shell
   ```
   ```python
   # Use Django ORM or bulk_create to import data
   ```

## Database Driver

This project uses **PyMySQL** instead of mysqlclient for the following reasons:
- ✅ Pure Python implementation (no C++ build tools needed)
- ✅ Easy installation on Windows
- ✅ Works perfectly with Laragon
- ✅ Fully compatible with Django
- ✅ Active maintenance and support

Configuration is in `settings.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

## Benefits of Migration

### 1. Full Backend Control
- Complete control over API logic
- Custom business logic in models
- Better data validation
- Transaction management

### 2. No External Dependencies
- No Supabase subscription needed
- Self-hosted solution
- No API rate limits
- Full data ownership

### 3. Django Admin Panel
- Built-in admin interface at `/admin`
- Easy data management
- Custom admin actions
- User management

### 4. Better Developer Experience
- Type-safe API with DRF
- Python-based backend (easier debugging)
- Comprehensive Django ecosystem
- Better testing capabilities

### 5. Scalability
- Easier to add authentication
- Can add background tasks (Celery)
- Can implement caching (Redis)
- WebSocket support (Django Channels)

## Next Steps

### Immediate
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Create initial data (categories)
5. Test all CRUD operations

### Recommended Enhancements
1. **Authentication**: Add JWT or session-based auth
2. **Permissions**: Implement role-based access control
3. **Validation**: Add more comprehensive input validation
4. **Testing**: Add unit and integration tests
5. **Logging**: Implement structured logging
6. **Caching**: Add Redis caching for better performance
7. **API Documentation**: Auto-generate with drf-spectacular
8. **File Upload**: Add support for medicine images
9. **Backup**: Implement automated database backups
10. **Monitoring**: Add application monitoring (Sentry, etc.)

## Rollback Plan

If you need to rollback to Supabase:

1. Restore `@supabase/supabase-js` in `package.json`
2. Restore `src/lib/supabase.ts`
3. Revert changes in components to use Supabase client
4. Revert `src/hooks/useData.ts`
5. Update `.env` with Supabase credentials
6. Run `npm install`

## Support

For issues during migration:
1. Check Django logs: `python manage.py runserver` output
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure CORS is properly configured
5. Check that both servers are running

## Conclusion

The migration from Supabase to Django provides:
- ✅ Full control over backend logic
- ✅ No external dependencies
- ✅ Better type safety
- ✅ Built-in admin panel
- ✅ Easier to extend and maintain
- ✅ Production-ready architecture

The application maintains the same functionality while providing a more robust and maintainable architecture.
