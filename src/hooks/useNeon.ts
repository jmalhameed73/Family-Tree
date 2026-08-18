import { useState, useEffect, useCallback } from 'react';
import * as neon from '@/lib/neon';
import type { Member } from '@/types';

interface UseNeonReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (name: string, notes: string, fatherId: string | null) => Promise<void>;
  addFather: (name: string, notes: string) => Promise<string>;
  updateMember: (id: string, name: string, notes: string, fatherId?: string | null) => Promise<void>;
  updateFather: (memberId: string, fatherId: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  importData: (members: Member[]) => Promise<void>;
  exportData: () => Promise<Member[]>;
  refresh: () => Promise<void>;
}

export function useNeon(): UseNeonReturn {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await neon.fetchAllMembers();
      setMembers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات';
      setError(errorMessage);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // إضافة عضو
  const addMember = useCallback(async (name: string, notes: string, fatherId: string | null) => {
    try {
      const id = neon.createId();
      const createdAt = Date.now();
      await neon.addMember(id, name, notes, fatherId, createdAt);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في إضافة العضو';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // إضافة أب (father_id = null)
  const addFather = useCallback(async (name: string, notes: string): Promise<string> => {
    try {
      const id = neon.createId();
      const createdAt = Date.now();
      await neon.addMember(id, name, notes, null, createdAt);
      await fetchData();
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في إضافة الأب';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // تحديث عضو (مع إمكانية تحديث father_id)
  const updateMember = useCallback(async (id: string, name: string, notes: string, fatherId?: string | null) => {
    try {
      await neon.updateMember(id, name, notes, fatherId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحديث العضو';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // تحديث الأب لعضو موجود
  const updateFather = useCallback(async (memberId: string, fatherId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');
      await neon.updateMember(memberId, member.name, member.notes, fatherId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحديث الأب';
      setError(errorMessage);
      throw err;
    }
  }, [members, fetchData]);

  // حذف عضو
  const deleteMember = useCallback(async (id: string) => {
    try {
      await neon.deleteMember(id);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في حذف العضو';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // مسح جميع البيانات
  const clearAll = useCallback(async () => {
    try {
      await neon.clearAllMembers();
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في مسح البيانات';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // استيراد بيانات
  const importData = useCallback(async (importedMembers: Member[]) => {
    try {
      await neon.importMembers(importedMembers);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في استيراد البيانات';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

  // تصدير بيانات
  const exportData = useCallback(async () => {
    try {
      return await neon.exportMembers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تصدير البيانات';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // تحميل البيانات عند التحميل الأول
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
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
    exportData,
    refresh: fetchData,
  };
}