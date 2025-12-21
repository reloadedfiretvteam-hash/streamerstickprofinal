import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ContactForm from './ContactForm';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultSubject?: string;
}

export default function ContactFormModal({ isOpen, onClose, defaultEmail, defaultSubject }: ContactFormModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for smooth animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        className={`relative bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors shadow-lg border border-gray-700"
          aria-label="Close contact form"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>

        {/* Modal Content */}
        <div className="p-6 md:p-8">
          <ContactForm defaultEmail={defaultEmail} defaultSubject={defaultSubject} />
        </div>
      </div>
    </div>
  );
}

