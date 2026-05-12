import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { motion } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let active = true;
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    scannedRef.current = false;

    const secureLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    const supportsSecure = window.isSecureContext || secureLocalhost;

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera API is not supported by this browser.');
        setIsLoading(false);
        return;
      }

      if (!supportsSecure) {
        setError('Camera access requires HTTPS or localhost.');
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const backCamera = videoDevices.find(device =>
          /back|rear|environment/i.test(device.label)
        );

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: backCamera?.deviceId ? { exact: backCamera.deviceId } : undefined,
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);

        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        videoRef.current.srcObject = streamRef.current;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        await videoRef.current.play();

        if (!active) return;
        setIsLoading(false);

        codeReader.decodeFromVideoDevice(
          backCamera?.deviceId,
          videoRef.current,
          (result, err) => {
            if (!active) return;

            if (result?.getText() && !scannedRef.current) {
              scannedRef.current = true;
              onScan(result.getText());
            }

            if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
              console.warn('Barcode scan error:', err);
            }
          }
        );
      } catch (err: any) {
        if (!active) return;
        console.error('Camera access error:', err);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Allow access in browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
          setError('No camera found on this device.');
        } else if (err.name === 'AbortError') {
          setError('Camera request was aborted. Close other camera apps or refresh the page.');
        } else {
          setError(err?.message || 'Unable to access camera.');
        }
        setIsLoading(false);
      }
    }

    startScanner();

    return () => {
      active = false;
      codeReader.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan]);

  return (
    <motion.div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-white border-t-yellow-300 animate-spin mx-auto mb-4" />
              <div className="font-black uppercase">Requesting camera access…</div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white p-6">
            <div className="max-w-sm text-center">
              <AlertCircle size={40} className="mx-auto mb-4" />
              <p className="font-black uppercase mb-3">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 bg-white text-black font-black uppercase border-4 border-black"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {!isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-14 h-14 bg-black text-white border-4 border-white flex items-center justify-center"
      >
        <X size={24} />
      </button>
    </motion.div>
  );
}