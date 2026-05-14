import React, { useEffect, useRef, useState } from 'react';

export default function ShopScanner({ onScan, onClose }: { onScan: (val: string) => void, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // NEW: State to prevent duplicate scans
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    }
    startCamera();

    const timer = setInterval(captureFrame, 400);
    return () => {
        clearInterval(timer);
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
    };
  }, [isProcessing, lastScannedCode]); // Re-run effect when state changes

  const captureFrame = async () => {
    // 1. Don't capture if we are already waiting for a server response
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        setIsProcessing(true); // Lock the scanner

        const res = await fetch('http://localhost:8000/scan', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
          // 2. CHECK: Is this the same item we JUST scanned?
          if (data.barcode !== lastScannedCode) {
            onScan(data.barcode); 
            setLastScannedCode(data.barcode);
            
            // OPTION A: Close scanner immediately after one scan
            // onClose(); 

            // OPTION B: Keep scanner open but wait 3 seconds before allowing same item
            setTimeout(() => {
                setLastScannedCode(null);
                setIsProcessing(false);
            }, 3000); 
          } else {
            // Same barcode detected, just unlock for next frame without adding to cart
            setIsProcessing(false);
          }
        } else {
          // No barcode found, unlock for the next frame
          setIsProcessing(false);
        }
      } catch (e) {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[500]">
      <div className="relative border-4 border-white rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-[640px] h-[360px] object-cover" />
        
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Visual feedback: Change box color if processing */}
          <div className={`w-[200px] h-[100px] border-2 shadow-lg ${isProcessing ? 'border-green-500' : 'border-yellow-400'}`}>
            <div className="bg-yellow-400 text-black text-[10px] px-1 font-bold absolute -top-5 left-0">
                {isProcessing ? 'PROCESSING...' : 'ALIGN BARCODE HERE'}
            </div>
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      <button onClick={onClose} className="mt-8 bg-red-600 text-white px-10 py-2 rounded-full font-bold">
        DONE
      </button>
    </div>
  );
}