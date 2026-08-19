import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgClass = 'bg-slate-900 text-white border-emerald-500/40 shadow-emerald-500/10';
          Icon = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bgClass = 'bg-slate-900 text-white border-rose-500/40 shadow-rose-500/10';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-slate-900 text-white border-amber-500/40 shadow-amber-500/10';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border ${bgClass} animate-in slide-in-from-right-5 duration-200 backdrop-blur-md`}
          >
            <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
