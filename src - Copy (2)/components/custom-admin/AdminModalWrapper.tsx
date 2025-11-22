import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

interface AdminModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function AdminModalWrapper({
  isOpen,
  onClose,
  title,
  icon,
  children,
  fullWidth = true
}: AdminModalWrapperProps) {
  const [isMaximized, setIsMaximized] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`absolute inset-0 ${isMaximized ? 'm-0' : 'm-8'} transition-all duration-300`}>
        <div className="h-full bg-gray-900 rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-sm text-white/80">Full feature management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                title={isMaximized ? 'Minimize' : 'Maximize'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                title="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
