import React, { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  countdown?: number;
};

export default function ValidationDialog({
  open,
  onClose,
  onConfirm,
  message,
  countdown = 5
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(countdown);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      setSecondsLeft(countdown);
      setCanConfirm(false);
      return;
    }

    setSecondsLeft(countdown);
    setCanConfirm(false);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCanConfirm(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, countdown]);

  if (!open) return null;

  return (
    <div style={{
      position:"fixed",
      inset:0,
      background:"#000a",
      display:"grid",
      placeItems:"center",
      zIndex: 1060
    }}>
      <div style={{
        background:"#fff",
        padding:24,
        width:500,
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '3px solid #dc3545'
      }}>
        <h4 style={{
          marginBottom: 16,
          color: '#dc3545',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          Uwaga - Niekompletne dane
        </h4>
        <p style={{
          marginBottom: 20,
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        {!canConfirm && (
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: 4,
            padding: 12,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#856404' }}>
              Możliwość potwierdzenia za: {secondsLeft}s
            </div>
          </div>
        )}
        <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
          <Button
            variant="secondary"
            onClick={onClose}
            size="lg"
          >
            Anuluj
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!canConfirm}
            size="lg"
          >
            {canConfirm ? "Potwierdzam i kontynuuję" : `Czekaj... (${secondsLeft}s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
