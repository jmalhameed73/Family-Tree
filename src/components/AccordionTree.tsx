import { useState } from 'react';
import {
  X,
  UserPlus,
  Pencil,
  Trash2,
  User,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { Member } from '@/types';
import { getLineage, getDescendantIds } from '@/lib/tree';

interface ActionSheetProps {
  member: Member;
  members: Member[];
  onClose: () => void;
  onAddSon: (fatherId: string, name: string, notes: string) => Promise<void>;
  onEdit: (id: string, name: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type Mode = 'menu' | 'addSon' | 'edit' | 'confirmDelete';

export function ActionSheet({
  member,
  members,
  onClose,
  onAddSon,
  onEdit,
  onDelete,
}: ActionSheetProps) {
  const [mode, setMode] = useState<Mode>('menu');
  const [name, setName] = useState(member.name);
  const [notes, setNotes] = useState(member.notes);
  const [sonName, setSonName] = useState('');
  const [sonNotes, setSonNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lineage = getLineage(members, member.id);
  const descendantCount = getDescendantIds(members, member.id).length;
  const childCount = members.filter((m) => m.father_id === member.id).length;

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
  const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-600';

  const submitAddSon = async () => {
    if (!sonName.trim()) {
      setError('الرجاء إدخال اسم الابن');
      return;
    }
    setLoading(true);
    try {
      await onAddSon(member.id, sonName.trim(), sonNotes.trim());
      onClose();
    } catch {
      setError('حدث خطأ في إضافة الابن');
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async () => {
    if (!name.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    setLoading(true);
    try {
      await onEdit(member.id, name.trim(), notes.trim());
      setMode('menu');
      setError('');
    } catch {
      setError('حدث خطأ في التعديل');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(member.id);
      onClose();
    } catch {
      setError('حدث خطأ في الحذف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-[430px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-3xl bg-white shadow-2xl animate-slide-up">
        {/* handle */}
        <div className="sticky top-0 z-10 bg-white/95 px-4 pt-2 pb-3 backdrop-blur">
          <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-200" />
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-slate-700">
              {mode === 'addSon'
                ? 'إضافة ابن'
                : mode === 'edit'
                  ? 'تعديل الاسم'
                  : mode === 'confirmDelete'
                    ? 'تأكيد الحذف'
                    : 'إجراءات الفرد'}
            </span>
            <div className="w-9" />
          </div>
        </div>

        <div className="px-4 pb-6 pt-1">
          {/* identity card */}
          {(mode === 'menu' || mode === 'confirmDelete') && (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-l from-sky-50 to-slate-50 p-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                <User className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-800">{member.name}</h3>
                <p className="truncate text-[12px] text-slate-400">{lineage}</p>
              </div>
            </div>
          )}

          {/* MENU */}
          {mode === 'menu' && (
            <>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                <span className="text-[13px] font-semibold text-slate-500">عدد الأبناء</span>
                <span className="text-[14px] font-bold text-slate-800">{childCount}</span>
              </div>

              <div className="mt-4 space-y-2.5">
                <button
                  onClick={() => setMode('addSon')}
                  className="flex w-full items-center gap-3 rounded-2xl bg-sky-600 px-4 py-3.5 text-[15px] font-bold text-white shadow-md transition active:scale-95"
                >
                  <UserPlus className="h-5 w-5" />
                  إضافة ابن
                </button>
                <button
                  onClick={() => {
                    setName(member.name);
                    setNotes(member.notes);
                    setMode('edit');
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-[15px] font-bold text-amber-700 transition active:scale-95"
                >
                  <Pencil className="h-5 w-5" />
                  تعديل الاسم
                </button>
                <button
                  onClick={() => setMode('confirmDelete')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[15px] font-bold text-red-600 transition active:scale-95"
                >
                  <Trash2 className="h-5 w-5" />
                  حذف
                </button>
              </div>
            </>
          )}

          {/* ADD SON */}
          {mode === 'addSon' && (
            <div className="mt-3 space-y-3.5">
              <div className="rounded-xl bg-sky-50 px-3 py-2 text-[13px] text-sky-700">
                إضافة ابن جديد تحت: <span className="font-bold">{member.name}</span>
              </div>
              <div>
                <label className={labelClass}>اسم الابن *</label>
                <input
                  className={fieldClass}
                  value={sonName}
                  onChange={(e) => setSonName(e.target.value)}
                  placeholder="اسم الابن"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>ملاحظات (اختياري)</label>
                <textarea
                  className={`${fieldClass} min-h-[70px] resize-none`}
                  value={sonNotes}
                  onChange={(e) => setSonNotes(e.target.value)}
                  placeholder="نبذة مختصرة..."
                  disabled={loading}
                />
              </div>
              {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
              <div className="flex gap-2.5">
                <button
                  onClick={submitAddSon}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <Check className="h-5 w-5" />
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => {
                    setMode('menu');
                    setSonName('');
                    setSonNotes('');
                    setError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-[14px] font-bold text-slate-600 active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* EDIT */}
          {mode === 'edit' && (
            <div className="mt-3 space-y-3.5">
              <div>
                <label className={labelClass}>اسم الشخص *</label>
                <input
                  className={fieldClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>ملاحظات (اختياري)</label>
                <textarea
                  className={`${fieldClass} min-h-[70px] resize-none`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="نبذة مختصرة..."
                  disabled={loading}
                />
              </div>
              {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
              <div className="flex gap-2.5">
                <button
                  onClick={submitEdit}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <Check className="h-5 w-5" />
                  {loading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  onClick={() => {
                    setMode('menu');
                    setError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-[14px] font-bold text-slate-600 active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* CONFIRM DELETE */}
          {mode === 'confirmDelete' && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-red-500" />
              <p className="text-[15px] font-bold text-red-700">حذف {member.name}؟</p>
              <p className="mt-1 text-[13px] text-red-600">
                سيتم حذف هذا الفرد
                {descendantCount > 0 && ` وكل ${descendantCount} من أبنائه وأحفاده`}
                نهائياً من قاعدة البيانات.
              </p>
              {error && <p className="mt-2 text-[13px] font-semibold text-red-600">{error}</p>}
              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-red-600 py-3.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
                <button
                  onClick={() => setMode('menu')}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-[14px] font-bold text-slate-600 active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}