import React, { useState, useEffect } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

const table = { pending: [], visible: false };

const addToTable = (toast: Toast) => {
  const { id } = toast;
  table.pending = table.pending.concat(toast);
  table.visible = true;

  // Auto-remove after delay
  const timeout = setTimeout(() => {
    removeToast(id);
  }, TOAST_REMOVE_DELAY);

  return () => clearTimeout(timeout);
};

const removeToast = (id: string) => {
  table.pending = table.pending.filter((t) => t.id !== id);
  if (table.pending.length === 0) table.visible = false;
};

const toastLoop = () =>
  setTimeout(
    () => table.pending.forEach(removeToast),
    TOAST_REMOVE_DELAY + TOAST_LIMIT * 300,
  );

const [toast, setToast] = useState<Toast | null>(null);

useEffect(() => {
  if (!table.visible) return;
  toastLoop();
}, [table.visible]);

const toastObj = React.useMemo(
  () => ({
    toast,
    setToast,
    addToTable,
    removeToast,
  }),
  [toast, setToast, addToTable, removeToast],
);

return React.createElement('div', {
  role: 'status',
  'aria-live': 'polite',
  'aria-atomic': false,
  style: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 9999,
  },
}, toast ? (
  <div className={`p-4 rounded-md max-w-md transform transition-all duration-300 ${toast.variant === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
    {toast.title}
    {toast.description && <p className="mt-2 text-sm">{toast.description}</p>}
  </div> : null),
}, toastObj);
```

Actually, let me simplify this and just create a simpler toast component:

**Let me create a simpler toast approach** - I'll integrate it into the existing UI rather than a complex system.

Let me update the Button component to support onSuccess toast:</think>Let me create a simpler toast notification system:

**File: `C:\Users\Luv\Projects\campus-chatbox\client\src\components\ToastProvider.tsx`**
<tool_call>
<function=write>
<parameter=content>
import React, { createContext, useContext, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  duration?: number;
}

const ToastContext = createContext<{
  toast: (options: Omit<Toast, 'id'>) => string;
  toasts: Toast[];
  removeToast: (id: string) => void;
}>({
  toast: () => '',
  toasts: [],
  removeToast: () => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { ...options, id };
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    const duration = options.duration ?? 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastProvider;