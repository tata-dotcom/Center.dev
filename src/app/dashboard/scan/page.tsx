"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const BarcodeScannerComponent = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

// Define the ScanResult type
interface ScanResult {
  getText(): string;
}

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 240 });
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const lastScanRef = useRef<string>("");
  const lockRef = useRef<boolean>(false);

  // Responsive scanner dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth * 0.9, 500);
      const height = Math.min(width * 0.75, 375);
      setDimensions({ width, height });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Send data to webhook
  const sendToWebhook = useCallback(async (data: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        "https://tatabatata.app.n8n.cloud/webhook-test/scan-qr",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: data }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Webhook Response:", responseData);
      setSuccessMessage("✅ Data sent successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send data";
      setError(errorMessage);
      console.error("Webhook Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle scan
  const handleScan = useCallback(
    (arg0: unknown, arg1?: ScanResult) => {
      const result = arg1 ?? null; // convert undefined → null
      if (result && !lockRef.current) {
        const text = result.getText().trim();
        if (text && text !== lastScanRef.current) {
          lastScanRef.current = text;
          setScanResult(text);
          sendToWebhook(text);

          lockRef.current = true;
          setTimeout(() => (lockRef.current = false), 3000);
        }
      } else if (arg0) {
        console.warn("QR Scan Error:", arg0);
      }
    },
    [sendToWebhook]
  );

  // Reset scan
  const resetScan = () => {
    setScanResult("");
    setError(null);
    setSuccessMessage(null);
    lastScanRef.current = "";
    setCameraEnabled(true);
  };

  // Copy scanned result
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scanResult);
      setSuccessMessage("📋 Copied to clipboard!");
    } catch (_error) {
      setError("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          QR Code Scanner
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col items-center space-y-4">
          {cameraEnabled && !scanResult && (
            <>
              <p className="text-sm text-gray-600 text-center">
                Point your camera at a QR code to scan it.
              </p>
              <div className="relative w-full aspect-video max-w-[400px] mx-auto overflow-hidden rounded-xl shadow">
                <BarcodeScannerComponent
                  width={dimensions.width}
                  height={dimensions.height}
                  facingMode="environment"
                  onUpdate={handleScan}
                  videoConstraints={{
                    facingMode: "environment",
                    width: { ideal: dimensions.width },
                    height: { ideal: dimensions.height },
                  }}
                />
              </div>
              <button
                onClick={() => setCameraEnabled(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm"
              >
                🚫 Stop Camera
              </button>
            </>
          )}

          {!cameraEnabled && !scanResult && (
            <button
              onClick={() => setCameraEnabled(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors text-sm"
            >
              ▶️ Start Camera
            </button>
          )}

          {scanResult && (
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl text-center">
                <h2 className="text-lg font-semibold">Scanned Data:</h2>
                <p className="break-words mt-2 text-sm font-mono bg-white p-2 rounded">
                  {scanResult}
                </p>
              </div>

              {isLoading && (
                <div className="text-center text-blue-600 animate-pulse">
                  Sending data...
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-xl text-center text-sm">
                  {error}
                </div>
              )}
              {successMessage && !isLoading && (
                <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-xl text-center text-sm">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors text-sm"
                >
                  📋 Copy
                </button>
                <button
                  onClick={resetScan}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  🔄 Scan Again
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Ensure camera permission is granted. Uses rear camera on mobile.
        </p>
      </div>
    </div>
  );
}
