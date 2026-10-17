# Preview Instructions for Windowsurf

## Quick Preview

Run the preview script:

```bash
preview.bat
```

This will:

1. Build the project
2. Start the preview server on `http://0.0.0.0:4173`
3. Open in your default browser

## Manual Preview

If you prefer to do it manually:

### Step 1: Build the project

```bash
npm run build
```

### Step 2: Start preview server

```bash
npx vite preview --host 0.0.0.0 --port 4173
```

## Access from Windowsurf

Once the preview server is running:

1. **Find your PC IP address**:

   ```bash
   ipconfig
   ```

   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Access from Windowsurf**:
   Open browser and go to: `http://YOUR_PC_IP:4173`

## What You'll See

The preview shows the **production build** of your MedStock application with:

- Modern UI with gradient backgrounds
- Glass morphism effects
- Enhanced sidebar and header
- Styled dashboard cards
- Improved medicine list with hover effects
- All functionality intact

## Note

The preview uses the production build, which is optimized for performance. For development with hot reload, use:

```bash
npm run dev
```
