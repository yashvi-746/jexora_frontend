import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render((result) => {
      scanner.clear();
      onScan(result);
    }, (error) => {
      // Ignore errors (scanning)
    });

    return () => scanner.clear();
  }, [onScan]);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <h3>Scan Product Barcode</h3>
        <div id="reader" style={{ marginTop: '20px' }}></div>
        <button className="jex-btn btn-ghost" style={{ marginTop: '20px', width: '100%' }} onClick={onClose}>
          Close Scanner
        </button>
      </div>
    </div>
  );
}
