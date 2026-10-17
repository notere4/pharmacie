# MedStock - Pharmacy Inventory Management System

A modern pharmacy inventory management system with Django REST API backend and React TypeScript frontend.

## 🏗️ Architecture

- **Backend**: Django 4.2 + Django REST Framework + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **State Management**: Zustand
- **UI Components**: Custom components with TailwindCSS
- **Icons**: Lucide React

## 📋 Features

- ✅ Medicine inventory management (CRUD operations)
- ✅ Category management
- ✅ Supplier management
- ✅ Stock movement tracking (entries/exits)
- ✅ Low stock alerts
- ✅ Expiration date tracking
- ✅ Advanced search and filtering
- ✅ Inventory reports with CSV export
- ✅ Dashboard with statistics
- ✅ Responsive design

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **MySQL 8.0+** (or MariaDB 10.5+)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note**: This project uses PyMySQL (pure Python) instead of mysqlclient for easier installation on Windows.

4. **Create MySQL database**
   
   Using Laragon MySQL or command line:
   ```sql
   CREATE DATABASE medstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Configure environment variables**
   ```bash
   # Copy .env.example to .env
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

   Edit `.env` and update:
   ```env
   SECRET_KEY=your-generated-secret-key
   DEBUG=True
   DB_NAME=medstock
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at: `http://localhost:8000`
   Admin panel at: `http://localhost:8000/admin`
   API endpoints at: `http://localhost:8000/api/`

### Frontend Setup

1. **Navigate to frontend directory** (project root)
   ```bash
   cd ..  # if you're in backend directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy .env.example to .env
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

## 📡 API Endpoints

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `PATCH /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Suppliers
- `GET /api/suppliers/` - List all suppliers
- `POST /api/suppliers/` - Create supplier
- `GET /api/suppliers/{id}/` - Get supplier details
- `PATCH /api/suppliers/{id}/` - Update supplier
- `DELETE /api/suppliers/{id}/` - Delete supplier

### Medicines
- `GET /api/medicines/` - List all medicines
- `POST /api/medicines/` - Create medicine
- `GET /api/medicines/{id}/` - Get medicine details
- `PATCH /api/medicines/{id}/` - Update medicine
- `DELETE /api/medicines/{id}/` - Delete medicine
- `GET /api/medicines/low_stock/` - Get medicines with low stock
- `GET /api/medicines/expiring_soon/` - Get medicines expiring within 30 days

**Query Parameters**:
- `search` - Search in name, barcode, batch_number, description
- `category_id` - Filter by category
- `supplier_id` - Filter by supplier

### Stock Movements
- `GET /api/stock-movements/` - List all stock movements
- `POST /api/stock-movements/` - Create stock movement (auto-updates medicine stock)
- `GET /api/stock-movements/{id}/` - Get movement details

**Query Parameters**:
- `medicine_id` - Filter by medicine
- `type` - Filter by type (entry/exit)

## 🗂️ Project Structure

```
medStock/
├── backend/                      # Django backend
│   ├── medstock_project/         # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── inventory/                # Main app
│   │   ├── models.py            # Database models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # URL routing
│   │   └── admin.py             # Admin configuration
│   ├── manage.py
│   └── requirements.txt
│
├── src/                          # React frontend
│   ├── components/               # React components
│   │   ├── Dashboard.tsx
│   │   ├── MedicineList.tsx
│   │   ├── MedicineModal.tsx
│   │   ├── StockMovementModal.tsx
│   │   ├── SuppliersManager.tsx
│   │   ├── AlertsList.tsx
│   │   ├── InventoryReport.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/                    # Custom hooks
│   │   └── useData.ts
│   ├── lib/                      # Libraries & utilities
│   │   └── api.ts               # API client
│   ├── store/                    # State management
│   │   └── useStore.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   └── alerts.ts
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔧 Development

### Running Tests

**Backend**:
```bash
cd backend
python manage.py test
```

**Frontend**:
```bash
npm run test  # if tests are added
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building for Production

**Backend**:
```bash
# Update settings.py for production
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Collect static files
python manage.py collectstatic
```

**Frontend**:
```bash
npm run build
# Output will be in dist/
```

## 🔐 Security Notes

⚠️ **Important**: The current setup is for development only.

For production deployment:

1. **Backend**:
   - Change `SECRET_KEY` to a secure random string
   - Set `DEBUG=False`
   - Configure `ALLOWED_HOSTS`
   - Use environment variables for sensitive data
   - Enable HTTPS
   - Configure proper CORS settings
   - Add authentication (JWT, Session, etc.)

2. **Frontend**:
   - Update `VITE_API_URL` to production API URL
   - Implement authentication
   - Add error boundaries
   - Enable production optimizations

## 📊 Database Schema

### Categories
- `id` (UUID)
- `name` (String, unique)
- `description` (Text, optional)
- `type` ('medicine' | 'material')
- `created_at` (DateTime)

### Suppliers
- `id` (UUID)
- `name` (String)
- `contact_person` (String, optional)
- `email` (Email, optional)
- `phone` (String, optional)
- `address` (Text, optional)
- `created_at` (DateTime)

### Medicines
- `id` (UUID)
- `name` (String)
- `barcode` (String, unique, optional)
- `category_id` (FK to Categories, optional)
- `supplier_id` (FK to Suppliers, optional)
- `description` (Text, optional)
- `unit` (Choice: piece, boite, flacon, sachet, tube, ampoule)
- `unit_price` (Decimal)
- `current_stock` (Integer)
- `min_stock_level` (Integer)
- `expiration_date` (Date, optional)
- `batch_number` (String, optional)
- `location` (String, optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Stock Movements
- `id` (UUID)
- `medicine_id` (FK to Medicines)
- `type` ('entry' | 'exit')
- `quantity` (Integer)
- `reference` (String, optional)
- `notes` (Text, optional)
- `movement_date` (DateTime)
- `created_at` (DateTime)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is for educational purposes.

## 🐛 Troubleshooting

### Backend Issues

**Database connection error**:
- Verify MySQL is running (check Laragon)
- Check database credentials in `.env`
- Ensure database `medstock` exists
- For Laragon: default user is `root` with empty password

**Module not found**:
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**PyMySQL connection issues**:
- Verify MySQL is running in Laragon
- Check credentials in `.env` match your MySQL setup
- Default Laragon: user=`root`, password=(empty)

### Frontend Issues

**Cannot find module 'react'**:
- Run `npm install`

**API connection error**:
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env`

**CORS error**:
- Verify `CORS_ALLOWED_ORIGINS` in backend `.env` includes frontend URL

## 📧 Support

For issues and questions, please create an issue in the repository.
