export interface Member {
  id: string;
  name: string;
  notes: string;
  father_id: string | null;  // تغيير من fatherId إلى father_id
  created_at: number;        // تغيير من createdAt إلى created_at
}

export interface FamilyData {
  members: Member[];
  version: number;
}