import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '15853037381';
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 animate-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Chat with us</h3>
                  <p className="text-sm text-gray-600">We reply instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  👋 Hi there! Need help with your order or have questions about our products?
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  💬 Click below to start a WhatsApp chat with our team!
                </p>
              </div>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              Start WhatsApp Chat
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Available 24/7 for support
            </p>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group relative"
          aria-label="WhatsApp Chat"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />

          {isOpen ? (
            <X className="w-7 h-7 transform group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-7 h-7 animate-bounce" />
          )}
        </button>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold md:hidden"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp Us
      </a>
    </>
  );
}
