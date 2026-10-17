# Laragon Setup Guide for MedStock

This guide is specifically for setting up MedStock with Laragon on Windows.

## Prerequisites

- **Laragon** installed (with MySQL enabled)
- **Python 3.10+** installed

## Quick Setup Steps

### 1. Verify MySQL is Running

1. Open Laragon
2. Click "Start All" to start Apache and MySQL
3. Verify MySQL is running (green checkmark)

### 2. Create Database

1. In Laragon, click "Database" → "Open"
2. This opens HeidiSQL or your configured MySQL client
3. Create new database:
   ```sql
   CREATE DATABASE medstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Alternative - Using Command Line**:
```bash
# From Laragon terminal
mysql -u root -p
# Press Enter (default password is empty)

CREATE DATABASE medstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3. Setup Python Virtual Environment

```bash
# Navigate to backend folder
cd C:\laragon\www\medStock\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# You should see (venv) in your terminal
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Note**: This project uses **PyMySQL** (pure Python MySQL driver), which installs easily on Windows without requiring C++ build tools. The configuration is already set up in `settings.py`.

### 5. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env with Notepad
notepad .env
```

Update with Laragon MySQL credentials:
```env
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Laragon MySQL Default Settings
DB_NAME=medstock
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Note**: Laragon's default MySQL user is `root` with **empty password**

### 6. Run Database Migrations

```bash
# Make sure venv is activated
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Admin User (Optional)

```bash
python manage.py createsuperuser

# Enter:
# Username: admin
# Email: admin@example.com
# Password: (your choice)
# Password (again): (confirm)
```

### 8. Load Sample Categories

```bash
python manage.py shell
```

Then paste:
```python
from inventory.models import Category

categories = [
    {'name': 'Antibiotiques', 'description': 'Médicaments antibiotiques', 'type': 'medicine'},
    {'name': 'Antalgiques', 'description': 'Médicaments contre la douleur', 'type': 'medicine'},
    {'name': 'Anti-inflammatoires', 'description': 'Médicaments anti-inflammatoires', 'type': 'medicine'},
    {'name': 'Matériel médical', 'description': 'Matériel médical général', 'type': 'material'},
    {'name': 'Pansements', 'description': 'Pansements et bandages', 'type': 'material'},
]

for cat_data in categories:
    Category.objects.get_or_create(**cat_data)

print("Categories created!")
exit()
```

### 9. Start Django Server

```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

Test the API: `http://localhost:8000/api/categories/`

Admin panel: `http://localhost:8000/admin`

### 10. Start Frontend (New Terminal)

```bash
# Open new terminal in project root
cd C:\laragon\www\medStock

# Install dependencies (first time only)
npm install

# Create .env file
copy .env.example .env

# Start Vite dev server
npm run dev
```

Frontend will start at: `http://localhost:5173`

## Common Laragon Issues

### Issue: "Access denied for user 'root'@'localhost'"

**Solution**:
1. Open HeidiSQL from Laragon
2. Check connection works
3. If password required, update `.env` with your password
4. Default Laragon MySQL has no password (empty string)

### Issue: "Can't connect to MySQL server"

**Solution**:
1. Check Laragon is running (green checkmark on MySQL)
2. Try `DB_HOST=127.0.0.1` instead of `localhost`
3. Verify port in Laragon (default 3306)

### Issue: "No module named 'pymysql'"

**Solution**:
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Port 8000 already in use

**Solution**:
```bash
# Use different port
python manage.py runserver 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001/api
```

## Stopping the Servers

### Stop Django
Press `Ctrl+C` in the terminal running Django

### Stop Frontend
Press `Ctrl+C` in the terminal running Vite

### Stop Laragon
Click "Stop All" in Laragon window

## Directory Structure in Laragon

```
C:\laragon\www\medStock\
├── backend\              # Django backend
│   ├── venv\            # Python virtual environment
│   ├── inventory\       # Main app
│   ├── medstock_project\  # Settings
│   ├── manage.py
│   └── .env            # Your config (not in git)
│
├── src\                 # React frontend
├── node_modules\        # npm packages
├── package.json
└── .env                # Frontend config (not in git)
```

## Quick Start Commands (After Initial Setup)

**Every time you want to work on the project**:

1. **Start Laragon**: Open Laragon → Click "Start All"

2. **Start Backend**:
   ```bash
   cd C:\laragon\www\medStock\backend
   venv\Scripts\activate
   python manage.py runserver
   ```

3. **Start Frontend** (new terminal):
   ```bash
   cd C:\laragon\www\medStock
   npm run dev
   ```

4. **Open Browser**: `http://localhost:5173`

## Tips

- **Laragon Terminal**: Right-click Laragon tray icon → Terminal → Use this for commands
- **Database Client**: Laragon → Database → Open (HeidiSQL)
- **View Logs**: Django terminal shows all backend logs
- **Auto-reload**: Both Django and Vite auto-reload on file changes

## Next Steps

1. ✅ Verify API works: `http://localhost:8000/api/categories/`
2. ✅ Check admin panel: `http://localhost:8000/admin`
3. ✅ Test frontend: `http://localhost:5173`
4. ✅ Create some medicines and test all features

Happy coding! 🚀
