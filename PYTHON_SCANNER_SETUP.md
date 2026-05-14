# Python Barcode Scanner Integration

Your tested Python barcode scanner code is now integrated! Here's how to use it:

## Setup (One-time)

### Install Python Dependencies

```bash
pip install opencv-python pyzbar requests
```

**For macOS M1/M2:** You may need to install pyzbar differently:
```bash
brew install zbar
pip install pyzbar
```

## Usage

### Terminal 1: Start the Node.js Server
```bash
npm run dev
```
The server will run on `http://localhost:3000`

### Terminal 2: Run Python Barcode Scanner
```bash
python scanner.py
```

**Optional:** If your server is on a different URL:
```bash
python scanner.py http://your-server-url:3000
```

## How It Works

1. **Python Scanner Window** opens with a yellow target box
2. **Align your barcode** inside the box
3. **When detected:**
   - Box turns **GREEN**
   - Barcode value displays on screen
   - **Terminal shows:** `[PYTHON SCANNER] [CODE_128] Scanned Value: 4001`
   - **Server receives** the barcode and logs it to the Node.js terminal

## Console Output

You'll see logs in **two places**:

### Python Terminal:
```
[PYTHON SCANNER] [CODE_128] Scanned Value: 4001
[PYTHON SCANNER] ✓ Sent to server: 4001
```

### Node.js Server Terminal:
```
[BARCODE SCAN] [python-cv2] Decoded barcode value: 4001
[BARCODE SCAN] [python-cv2] Looking up product for barcode: 4001
```

## Troubleshooting

### Camera not detected?
```bash
python scanner.py
# Check that a camera window opens and displays video
```

### Can't connect to server?
- Make sure Node.js server is running on `http://localhost:3000`
- Check firewall settings if using a different machine

### Barcode not scanning?
- Ensure good lighting
- Barcode should be in the **center yellow box**
- Try different barcode types (EAN-13, CODE_128, etc.)

## Files

- `scanner.py` - Python barcode scanner using OpenCV + pyzbar
- `server.ts` - Node.js server receives barcode data via `/api/scan/log`
- `src/App.tsx` - React app with browser-based scanning option

You can run **both** scanners at the same time:
- Python scanner for reliable camera detection
- Browser scanner as a backup
