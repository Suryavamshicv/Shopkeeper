import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Scan, X, Keyboard, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (isManual) return;

    // Initializing the scanner with explicit support for common supermarket barcodes
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 20, // Increased FPS for faster detection
        qrbox: { width: 280, height: 200 }, // Slightly larger box
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        // Haptic feedback for successful scan
        if ('vibrate' in navigator) navigator.vibrate(100);
      },
      (error) => {
        // Quietly handle errors
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan, isManual]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      setIsManual(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <button 
          onClick={() => setIsManual(!isManual)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
          title={isManual ? "Switch to Camera" : "Manual Entry"}
        >
          {isManual ? <Scan size={24} /> : <Keyboard size={24} />}
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative">
        <div className="mb-8 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-none mb-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <Scan size={28} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            {isManual ? 'Manual Code' : 'Scanning...'}
          </h2>
          <p className="text-white/40 text-[10px] mt-2 font-black uppercase tracking-widest">
            {isManual ? 'Enter product barcode digits' : 'Align barcode within the frame'}
          </p>
        </div>

        <div className="relative border-4 border-white bg-zinc-900 shadow-2xl min-h-[300px] flex items-center justify-center overflow-hidden">
          {!isManual ? (
            <div className="relative w-full">
              <div id="reader" className="w-full"></div>
              {/* Custom Overlay Grids */}
              <div className="absolute inset-0 pointer-events-none border-[2rem] border-zinc-900/40">
                 <div className="absolute inset-0 border-2 border-dashed border-blue-500/30"></div>
                 <motion.div 
                   animate={{ top: ['10%', '90%', '10%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-10" 
                 />
              </div>
            </div>
          ) : (
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleManualSubmit}
              className="p-8 w-full space-y-6"
            >
              <input 
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="BARCODE NUMBER (e.g. 4001)"
                autoFocus
                className="w-full bg-white border-4 border-black p-4 text-black font-black text-xl placeholder:text-zinc-300 outline-none"
              />
              <button 
                type="submit"
                className="w-full h-16 brutalist-button bg-yellow-400 text-black font-black text-xl"
              >
                Add Item
                <ArrowRight size={24} className="ml-2" strokeWidth={3} />
              </button>
            </motion.form>
          )}
        </div>

        <div className="mt-8 p-4 bg-white/5 border border-white/10">
           <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Tips for Mac Users</p>
           <ul className="text-[10px] text-white/60 space-y-1 font-black uppercase">
             <li>• Ensure good lighting on the product</li>
             <li>• Hold the barcode flat and parallel to the lens</li>
             <li>• Use manual entry (keyboard icon) if focus is poor</li>
           </ul>
        </div>
      </div>
    </motion.div>
  );
}
