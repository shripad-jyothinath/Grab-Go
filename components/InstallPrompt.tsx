import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-4 max-w-sm">
        <div className="bg-white/20 p-2 rounded-lg">
            <Download size={24} />
        </div>
        <div>
            <h4 className="font-bold text-sm">Install App</h4>
            <p className="text-xs text-indigo-100">Add to home screen for better experience.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleInstallClick}
                className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition"
            >
                Install
            </button>
            <button 
                onClick={() => setIsVisible(false)}
                className="text-indigo-200 hover:text-white transition"
            >
                <X size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}