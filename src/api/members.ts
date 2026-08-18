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
}