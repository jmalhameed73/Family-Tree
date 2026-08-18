<<<<<<< HEAD
import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// استخدام متغير البيئة من Vercel (بدون VITE_)
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - جلب الأعضاء
    if (req.method === 'GET') {
      const members = await sql`
        SELECT id, name, notes, father_id, created_at
        FROM members
        ORDER BY created_at ASC
      `;
      return res.status(200).json(members);
    }

    // POST - إضافة عضو
    if (req.method === 'POST') {
      const { id, name, notes, father_id, created_at } = req.body;
      await sql`
        INSERT INTO members (id, name, notes, father_id, created_at)
        VALUES (${id}, ${name}, ${notes}, ${father_id}, ${created_at})
      `;
      return res.status(201).json({ success: true });
    }

    // PUT - تحديث
    if (req.method === 'PUT') {
      const { id, name, notes } = req.body;
      await sql`
        UPDATE members
        SET name = ${name}, notes = ${notes}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // DELETE - حذف
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await sql`
        DELETE FROM members WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
=======
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
>>>>>>> b77e55eef71ca09eb6d0d5d1c137df73349e828c
}