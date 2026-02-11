import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-indigo-600 dark:text-indigo-400">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}