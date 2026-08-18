<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import * as neon from '@/lib/neon';
import type { Member } from '@/types';

interface UseNeonReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (name: string, notes: string, fatherId: string | null) => Promise<void>;
  updateMember: (id: string, name: string, notes: string) => Promise<void>;
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

  // تحديث عضو
  const updateMember = useCallback(async (id: string, name: string, notes: string) => {
    try {
      await neon.updateMember(id, name, notes);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحديث العضو';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

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
    updateMember,
    deleteMember,
    clearAll,
    importData,
    exportData,
    refresh: fetchData,
  };
=======
import { useState, useEffect, useCallback } from 'react';
import * as neon from '@/lib/neon';
import type { Member } from '@/types';

interface UseNeonReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (name: string, notes: string, fatherId: string | null) => Promise<void>;
  updateMember: (id: string, name: string, notes: string) => Promise<void>;
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

  // تحديث عضو
  const updateMember = useCallback(async (id: string, name: string, notes: string) => {
    try {
      await neon.updateMember(id, name, notes);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحديث العضو';
      setError(errorMessage);
      throw err;
    }
  }, [fetchData]);

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
    updateMember,
    deleteMember,
    clearAll,
    importData,
    exportData,
    refresh: fetchData,
  };
>>>>>>> b77e55eef71ca09eb6d0d5d1c137df73349e828c
}