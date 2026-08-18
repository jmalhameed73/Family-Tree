import { useState, useCallback, useEffect } from 'react';
import { TreePalm, Search, Settings as SettingsIcon, UserPlus, X, Check, Loader2, Pencil, LogOut } from 'lucide-react';
import { TreeFlow } from '@/components/TreeFlow';
import { ActionSheet } from '@/components/ActionSheet';
import { Settings } from '@/components/Settings';
import { EditAuthModal } from '@/components/EditAuthModal';
import { useNeon } from '@/hooks/useNeon';
import { canEdit, logoutEdit } from '@/lib/auth';
import type { Member } from '@/types';

type Tab = 'tree' | 'settings';

function App() {
  const {
    members,
    loading,
    error,
    addMember,
    addFather,
    updateMember,
    updateFather,
    deleteMember,
    clearAll,
    importData,
    refresh,
  } = useNeon();

  const [hasEditPermission, setHasEditPermission] = useState(canEdit());
  const [tab, setTab] = useState<Tab>('tree');
  const [query, setQuery] = useState('');
  const [actionMember, setActionMember] = useState<Member | null>(null);
  const [showRootModal, setShowRootModal] = useState(false);
  const [rootName, setRootName] = useState('');
  const [rootNotes, setRootNotes] = useState('');
  const [rootError, setRootError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const isEmpty = members.length === 0;

  // التحقق من صلاحية التعديل عند تحميل الصفحة
  useEffect(() => {
    setHasEditPermission(canEdit());
  }, []);

  const handleEditSuccess = () => {
    setHasEditPermission(true);
  };

  const handleLogoutEdit = () => {
    logoutEdit();
    setHasEditPermission(false);
    setActionMember(null);
  };

  const handleAddSon = useCallback(
    async (fatherId: string, name: string, notes: string) => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        return;
      }
      try {
        await addMember(name, notes, fatherId);
      } catch (err) {
        console.error('Error adding member:', err);
      }
    },
    [addMember, hasEditPermission]
  );

  const handleAddFather = useCallback(
    async (name: string, notes: string): Promise<string> => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        throw new Error('No permission');
      }
      try {
        return await addFather(name, notes);
      } catch (err) {
        console.error('Error adding father:', err);
        throw err;
      }
    },
    [addFather, hasEditPermission]
  );

  const handleEdit = useCallback(
    async (id: string, name: string, notes: string) => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        return;
      }
      try {
        await updateMember(id, name, notes);
      } catch (err) {
        console.error('Error updating member:', err);
      }
    },
    [updateMember, hasEditPermission]
  );

  const handleUpdateFather = useCallback(
    async (memberId: string, fatherId: string) => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        return;
      }
      try {
        await updateFather(memberId, fatherId);
      } catch (err) {
        console.error('Error updating father:', err);
      }
    },
    [updateFather, hasEditPermission]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        return;
      }
      try {
        await deleteMember(id);
        setActionMember(null);
      } catch (err) {
        console.error('Error deleting member:', err);
      }
    },
    [deleteMember, hasEditPermission]
  );

  const handleAction = useCallback(
    (member: Member, action: 'addSon' | 'edit' | 'delete') => {
      if (!hasEditPermission) {
        setShowEditModal(true);
        return;
      }
      if (action === 'addSon') {
        setActionMember(member);
      } else if (action === 'edit') {
        setActionMember(member);
      } else {
        setActionMember(member);
      }
    },
    [hasEditPermission]
  );

  const createRoot = async () => {
    if (!hasEditPermission) {
      setShowEditModal(true);
      return;
    }
    if (!rootName.trim()) {
      setRootError('الرجاء إدخال الاسم');
      return;
    }
    try {
      await addMember(rootName.trim(), rootNotes.trim(), null);
      setShowRootModal(false);
      setRootName('');
      setRootNotes('');
      setRootError('');
    } catch {
      setRootError('حدث خطأ في إضافة الجد');
    }
  };

  const memberCount = members.length;

  // إذا كان التحميل
  if (loading) {
    return (
      <div className="app-shell flex h-[100dvh] items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-sky-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // إذا كان هناك خطأ
  if (error) {
    return (
      <div className="app-shell flex h-[100dvh] items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600">حدث خطأ في الاتصال</h2>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 rounded-xl bg-sky-600 px-6 py-3 text-white font-bold hover:bg-sky-700 transition active:scale-95"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell flex h-[100dvh] flex-col">
      {/* Header */}
      <header className="z-20 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="flex items-center gap-2 text-[17px] font-extrabold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <TreePalm className="h-5 w-5" />
            </span>
            شجرة العائلة
          </h1>
          <div className="flex items-center gap-2">
            {/* زر تفعيل/إلغاء التعديل */}
            {hasEditPermission ? (
              <button
                onClick={handleLogoutEdit}
                className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                إلغاء التعديل
              </button>
            ) : (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-600 transition hover:bg-amber-100 active:scale-95"
              >
                <Pencil className="h-4 w-4" />
                تفعيل التعديل
              </button>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {memberCount} فرد
            </span>
          </div>
        </div>

        {/* Search bar */}
        {tab === 'tree' && !isEmpty && (
          <div className="px-4 pb-2.5">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-11 pl-9 text-[14px] text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث عن فرد..."
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-500 active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* رسالة حالة التعديل */}
        <div className={`px-4 pb-2 text-center text-[11px] font-semibold ${
          hasEditPermission ? 'text-emerald-600' : 'text-amber-600'
        }`}>
          {hasEditPermission ? '🔓 وضع التعديل مفعل' : '👀 وضع المشاهدة فقط - اضغط "تفعيل التعديل" للتعديل'}
        </div>
      </header>

      {/* Content */}
      <main className="relative flex-1 overflow-hidden bg-white">
        {tab === 'tree' && (
          <div className="absolute inset-0">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <TreePalm className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">ابدأ شجرتك</h2>
                <p className="mt-1.5 max-w-[260px] text-[14px] leading-relaxed text-slate-500">
                  أضف الجد الأكبر ليكون أساس شجرة العائلة
                </p>
                <button
                  onClick={() => {
                    if (!hasEditPermission) {
                      setShowEditModal(true);
                    } else {
                      setShowRootModal(true);
                    }
                  }}
                  className="mt-6 flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg transition active:scale-95"
                >
                  <UserPlus className="h-5 w-5" />
                  إضافة الجد الأكبر
                </button>
              </div>
            ) : (
              <TreeFlow
                members={members}
                query={query}
                onAction={handleAction}
              />
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-slate-50">
            <Settings
              members={members}
              onImport={importData}
              onClear={clearAll}
              onRefresh={refresh}
              canEdit={hasEditPermission}
            />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="z-20 flex shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)]">
        <TabButton
          active={tab === 'tree'}
          onClick={() => setTab('tree')}
          icon={<TreePalm className="h-5 w-5" />}
          label="الشجرة"
        />
        <TabButton
          active={tab === 'settings'}
          onClick={() => setTab('settings')}
          icon={<SettingsIcon className="h-5 w-5" />}
          label="الإعدادات"
        />
      </nav>

      {/* Root creation modal */}
      {showRootModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setShowRootModal(false)}
          />
          <div className="relative w-full max-w-[430px] rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up">
            <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-200" />
            <h3 className="mt-2 text-center text-[16px] font-extrabold text-slate-800">
              إضافة الجد الأكبر
            </h3>
            <p className="mt-1 text-center text-[13px] text-slate-500">
              هذا الشخص سيكون أساس شجرة العائلة
            </p>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">
                  اسم الشخص *
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value)}
                  placeholder="الاسم"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  className="w-full min-h-[70px] resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  value={rootNotes}
                  onChange={(e) => setRootNotes(e.target.value)}
                  placeholder="نبذة مختصرة..."
                />
              </div>
              {rootError && (
                <p className="text-[13px] font-semibold text-red-600">{rootError}</p>
              )}
              <div className="flex gap-2.5">
                <button
                  onClick={createRoot}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-[14px] font-bold text-white active:scale-95"
                >
                  <Check className="h-5 w-5" />
                  إنشاء الجذر
                </button>
                <button
                  onClick={() => {
                    setShowRootModal(false);
                    setRootError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-[14px] font-bold text-slate-600 active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet */}
      {actionMember && (
        <ActionSheet
          member={actionMember}
          members={members}
          onClose={() => setActionMember(null)}
          onAddSon={handleAddSon}
          onAddFather={handleAddFather}
          onEdit={handleEdit}
          onUpdateFather={handleUpdateFather}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Permission Modal */}
      <EditAuthModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition ${
        active ? 'text-sky-600' : 'text-slate-400'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active ? 'scale-105 bg-sky-100' : 'bg-transparent'
        }`}
      >
        {icon}
      </span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

export default App;