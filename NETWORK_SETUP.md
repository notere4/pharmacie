# MedStock - Network Ready Setup

## Quick Start for Network Access

### Option 1: Automated Start (Recommended)

Run the provided batch file:

```bash
start_network.bat
```

### Option 2: Manual Start

#### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

#### Frontend Setup

```bash
npm install
npm run dev
```

## Network Access URLs

Once running, access the application from any device on your network:

- **Frontend**: `http://YOUR_PC_IP:5173`
- **Backend API**: `http://YOUR_PC_IP:8000/api`
- **Admin Panel**: `http://YOUR_PC_IP:8000/admin`

### Find Your PC IP Address

```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter.

## Configuration Changes Made

### Frontend (Vite)

- Host: `0.0.0.0` (accessible from network)
- Port: `5173`
- Preview server: `0.0.0.0:4173`

### Backend (Django)

- Host: `0.0.0.0` (accessible from network)
- Port: `8000`
- Allowed hosts: Includes `0.0.0.0`

## Environment Setup

Create `.env` files if they don't exist:

#### Backend `.env`

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=medstock
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://0.0.0.0:5173
```

#### Frontend `.env`

```env
VITE_API_URL=http://YOUR_PC_IP:8000/api
```

## Firewall Settings

Make sure Windows Firewall allows connections on:

- Port 5173 (Frontend)
- Port 8000 (Backend)

## Database Setup

1. Install MySQL/MariaDB
2. Create database: `CREATE DATABASE medstock;`
3. Run migrations: `python manage.py migrate`
4. Create superuser: `python manage.py createsuperuser`

## Production Considerations

For production deployment:

- Set `DEBUG=False`
- Change `SECRET_KEY`
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS
- Set up proper database credentials
