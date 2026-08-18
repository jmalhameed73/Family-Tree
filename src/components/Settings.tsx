import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  AlertTriangle,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';
import type { Member } from '@/types';

interface SettingsProps {
  members: Member[];
  onImport: (members: Member[]) => Promise<void>;
  onClear: () => Promise<void>;
  onRefresh: () => Promise<void>;
  canEdit: boolean;
}

export function Settings({ members, onImport, onClear, onRefresh, canEdit }: SettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      setMsg({ type: 'err', text: 'لست مخولاً للتعديل' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.members || !Array.isArray(parsed.members)) {
        throw new Error('ملف غير صالح');
      }
      await onImport(parsed.members);
      setMsg({ type: 'ok', text: 'تم استيراد البيانات بنجاح' });
    } catch {
      setMsg({ type: 'err', text: 'فشل الاستيراد: ملف غير صالح' });
    }
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => setMsg(null), 3000);
  };

  const handleExport = () => {
    const data = { members, version: 3 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-tree-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!canEdit) return;
    try {
      await onClear();
      setConfirmClear(false);
      setMsg({ type: 'ok', text: 'تم مسح جميع البيانات' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'err', text: 'فشل مسح البيانات' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-5 p-4 pb-4">
      <div className="flex items-center gap-2 pb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Database className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">الإعدادات</h2>
        {!canEdit && (
          <span className="mr-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            <Lock className="h-3 w-3" />
            قراءة فقط
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-sky-600">{members.length}</p>
          <p className="mt-1 text-[12px] text-slate-500">الأفراد</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm hover:bg-slate-50 transition active:scale-95"
        >
          <RefreshCw className="h-8 w-8 text-emerald-600 mx-auto" />
          <p className="mt-1 text-[12px] text-slate-500">تحديث</p>
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-[14px] font-bold text-slate-700">النسخ الاحتياطي</h3>

        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 rounded-xl bg-sky-600 px-4 py-3.5 text-[14px] font-bold text-white shadow-md transition active:scale-95"
        >
          <Download className="h-5 w-5" />
          تصدير البيانات (JSON)
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-[14px] font-bold transition active:scale-95 ${
            canEdit 
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
              : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Upload className={`h-5 w-5 ${canEdit ? 'text-emerald-600' : 'text-slate-300'}`} />
          استيراد البيانات
          {!canEdit && <span className="text-[10px]">(يتطلب صلاحية)</span>}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-red-700">
          <AlertTriangle className="h-4 w-4" />
          منطقة الخطر
        </h3>
        {!canEdit ? (
          <div className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-3 text-[13px] text-slate-500">
            <Lock className="h-4 w-4" />
            تحتاج صلاحية التعديل لاستخدام هذه الميزة
          </div>
        ) : !confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-red-300 bg-white px-4 py-3.5 text-[14px] font-bold text-red-600 transition active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
            مسح جميع البيانات
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-red-700">
              هل أنت متأكد؟ سيتم حذف جميع أفراد العائلة من قاعدة البيانات.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-[14px] font-bold text-white active:scale-95"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-bold text-slate-600 active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold ${
            msg.type === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {msg.type === 'ok' && <Check className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        البيانات مخزنة في قاعدة بيانات Neon
      </p>
    </div>
  );
}