import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const QrScannerModal = ({ onClose }) => {
  const html5QrCodeRef = useRef(null);
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    let started = false;

    // Defensive: clear any previous instance
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop?.()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current.clear?.().catch(() => {});
          });
      } catch (e) {}
    }

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCodeRef.current = html5QrCode;
    setMessage('');
    setScanning(true);

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScanning(false);
          try {
            await html5QrCode.stop();
          } catch (e) {}
          try {
            const data = JSON.parse(decodedText);
            if (!currentUser) {
              setMessage('You must be signed in to record your action.');
              return;
            }
            if (!data.user_action || !data.classification || !data.timestamp || typeof data.points_earned !== 'number') {
              setMessage('Invalid QR code data.');
              return;
            }
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
              history: arrayUnion(data),
              points: increment(data.points_earned)
            });
            setMessage(`${data.points_earned} points added for ${data.classification} waste!`);
          } catch (err) {
            setMessage('Failed to process QR code: ' + err.message);
          }
        },
        (errorMessage) => {
          // ignore scan errors
        }
      )
      .then(() => { started = true; })
      .catch((err) => {
        setMessage('Camera error: ' + err.message);
      });

    return () => {
      if (html5QrCodeRef.current && started) {
        try {
          html5QrCodeRef.current.stop()
            .catch(() => {})
            .finally(() => {
              html5QrCodeRef.current.clear().catch(() => {});
            });
        } catch (e) {}
      }
    };
  }, [currentUser]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Scan QR Code</h2>
        <div id="qr-reader" className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4"></div>
        {message && <div className="text-center text-green-600 font-medium mb-2">{message}</div>}
        {!message && scanning && <div className="text-center text-gray-500">Point your camera at a QR code...</div>}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QrScannerModal; 