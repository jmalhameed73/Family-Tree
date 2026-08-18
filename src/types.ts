export interface Member {
  id: string;
  name: string;
  notes: string;
  father_id: string | null;
  created_at: number;
  order?: number;
}

export interface FamilyData {
  members: Member[];
  version: number;
}

export interface Settings {
  cardSize: 'small' | 'medium' | 'large';
}