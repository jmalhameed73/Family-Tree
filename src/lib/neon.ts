import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import type { Member } from '@/types';

// الاتصال بقاعدة البيانات
let sql: NeonQueryFunction<any, any> | null = null;

export function getNeon() {
  if (!sql) {
    const databaseUrl = import.meta.env.VITE_DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('VITE_DATABASE_URL is not set in environment variables');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}

// دالة لجلب جميع الأعضاء
export async function fetchAllMembers(): Promise<Member[]> {
  const sql = getNeon();
  try {
    const result = await sql`
      SELECT id, name, notes, father_id, created_at
      FROM members
      ORDER BY created_at ASC
    `;
    return result as Member[];
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

// دالة لإضافة عضو جديد
export async function addMember(
  id: string,
  name: string,
  notes: string,
  fatherId: string | null,
  createdAt: number
): Promise<void> {
  const sql = getNeon();
  try {
    await sql`
      INSERT INTO members (id, name, notes, father_id, created_at)
      VALUES (${id}, ${name}, ${notes}, ${fatherId}, ${createdAt})
    `;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}

// دالة لتحديث عضو
export async function updateMember(
  id: string,
  name: string,
  notes: string
): Promise<void> {
  const sql = getNeon();
  try {
    await sql`
      UPDATE members
      SET name = ${name}, notes = ${notes}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

// دالة لحذف عضو وجميع أبنائه (باستخدام CASCADE)
export async function deleteMember(id: string): Promise<void> {
  const sql = getNeon();
  try {
    await sql`
      DELETE FROM members WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// دالة لحذف جميع البيانات
export async function clearAllMembers(): Promise<void> {
  const sql = getNeon();
  try {
    await sql`
      DELETE FROM members
    `;
  } catch (error) {
    console.error('Error clearing members:', error);
    throw error;
  }
}

// دالة لإنشاء ID فريد
export function createId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// دالة لاستيراد بيانات JSON
export async function importMembers(members: Member[]): Promise<void> {
  const sql = getNeon();
  try {
    // حذف البيانات القديمة
    await sql`DELETE FROM members`;
    
    // إدراج البيانات الجديدة
    for (const member of members) {
      await sql`
        INSERT INTO members (id, name, notes, father_id, created_at)
        VALUES (${member.id}, ${member.name}, ${member.notes}, ${member.father_id}, ${member.created_at})
      `;
    }
  } catch (error) {
    console.error('Error importing members:', error);
    throw error;
  }
}

// دالة لتصدير البيانات
export async function exportMembers(): Promise<Member[]> {
  return await fetchAllMembers();
}