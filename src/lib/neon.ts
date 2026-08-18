import type { Member } from '@/types';

// استخدام API Routes بدلاً من الاتصال المباشر بقاعدة البيانات
const API_URL = '/api/members';

// جلب جميع الأعضاء
export async function fetchAllMembers(): Promise<Member[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

// إضافة عضو جديد
export async function addMember(
  id: string,
  name: string,
  notes: string,
  father_id: string | null,
  created_at: number
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, notes, father_id, created_at }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add member: ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}

// تحديث عضو
export async function updateMember(id: string, name: string, notes: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, notes }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update member: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

// حذف عضو
export async function deleteMember(id: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete member: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// حذف جميع الأعضاء
export async function clearAllMembers(): Promise<void> {
  try {
    const members = await fetchAllMembers();
    for (const member of members) {
      await deleteMember(member.id);
    }
  } catch (error) {
    console.error('Error clearing members:', error);
    throw error;
  }
}

// إنشاء معرف فريد
export function createId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}