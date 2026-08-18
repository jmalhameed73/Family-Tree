import { useState } from 'react';
import { TreePalm, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/auth';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="app-shell flex h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6">
      <div className="w-full max-w-sm text-center">
        {/* الشعار */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-600 shadow-lg">
          <TreePalm className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-800">شجرة العائلة</h1>
        <p className="mt-1 text-sm text-slate-500">أدخل كلمة المرور للتعديل</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="كلمة المرور"
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-[15px] text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-600 py-3.5 text-[15px] font-bold text-white shadow-lg transition active:scale-95 hover:bg-sky-700"
          >
            دخول
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          لا تملك كلمة المرور؟ يمكنك فقط مشاهدة الشجرة
        </p>
      </div>
    </div>
  );
}