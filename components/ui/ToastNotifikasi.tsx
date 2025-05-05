// components/ui/ToastNotifikasi.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ToastNotifikasiProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
  duration?: number; // in ms
}

const ToastNotifikasi: React.FC<ToastNotifikasiProps> = ({
  message,
  show,
  onClose,
  type = 'success',
  duration = 4000,
}) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(show);

  // UseEffect to handle the countdown and auto-close
  useEffect(() => {
    if (show) {
      setVisible(true);
      setProgress(100);
      const interval = 50;
      const total = duration / interval;
      let current = 0;

      const timer = setInterval(() => {
        current += 1;
        setProgress(100 - (current / total) * 100);
        if (current >= total) {
          clearInterval(timer);
          setVisible(false); // Hide after the progress completes
          onClose();
        }
      }, interval);

      return () => clearInterval(timer);
    }
    // Ensure the toast can reappear once closed
  }, [show, duration, onClose]);

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const bgColor = isSuccess ? 'bg-blue-600' : 'bg-red-600';
  const progressColor = isSuccess ? 'bg-blue-400' : 'bg-red-400';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="assertive" // Ensures screen readers announce the toast
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm rounded-xl shadow-xl ${bgColor} text-white overflow-hidden`}
        >
          <div className="flex items-center px-5 py-4 gap-3">
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{message}</span>
            <button
              onClick={onClose}
              aria-label="Close notification"
              className="hover:opacity-80 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full h-1">
            <div
              className={`h-full ${progressColor} transition-all duration-100`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotifikasi;
