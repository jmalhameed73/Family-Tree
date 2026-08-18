import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const members = await sql`
        SELECT id, name, notes, father_id, created_at, "order"
        FROM members
        ORDER BY "order" ASC NULLS LAST, created_at ASC
      `;
      return res.status(200).json(members);
    }

    if (req.method === 'POST') {
      const { id, name, notes, father_id, created_at, order } = req.body;
      await sql`
        INSERT INTO members (id, name, notes, father_id, created_at, "order")
        VALUES (${id}, ${name}, ${notes}, ${father_id}, ${created_at}, ${order || null})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, name, notes, father_id, order } = req.body;
      let query = 'UPDATE members SET name = $1, notes = $2';
      const params: any[] = [name, notes];
      let paramIndex = 3;
      
      if (father_id !== undefined) {
        query += `, father_id = $${paramIndex}`;
        params.push(father_id);
        paramIndex++;
      }
      
      if (order !== undefined) {
        query += `, "order" = $${paramIndex}`;
        params.push(order);
        paramIndex++;
      }
      
      query += ` WHERE id = $${paramIndex}`;
      params.push(id);
      
      await sql.query(query, params);
      return res.status(200).json({ success: true });
    }

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
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}