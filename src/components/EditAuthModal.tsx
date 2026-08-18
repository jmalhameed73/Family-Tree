import { useState } from 'react';
import { Lock, Eye, EyeOff, X, Pencil } from 'lucide-react';
import { loginForEdit } from '@/lib/auth';

interface EditAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAuthModal({ isOpen, onClose, onSuccess }: EditAuthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForEdit(password)) {
      setError('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-scale-in">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          
          <h3 className="text-lg font-extrabold text-slate-800">تأكيد الصلاحية</h3>
          <p className="mt-1 text-sm text-slate-500">
            أدخل كلمة المرور للحصول على صلاحية التعديل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="كلمة المرور"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-[15px] text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              autoFocus
            />
            <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-[15px] font-bold text-white shadow-lg transition active:scale-95 hover:bg-amber-600"
          >
            <Pencil className="h-5 w-5" />
            تفعيل وضع التعديل
          </button>
        </form>
      </div>
    </div>
  );
}