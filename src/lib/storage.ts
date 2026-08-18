import type { FamilyData, Member } from '@/types';

const STORAGE_KEY = 'family-tree-data-v3';

const SEED_MEMBERS: Member[] = [
  { id: 'root', name: 'حميد', notes: 'الجد الأكبر — مؤسس العائلة', fatherId: null, createdAt: Date.now() - 5000 },
  { id: 'c1', name: 'غانم', notes: '', fatherId: 'root', createdAt: Date.now() - 4000 },
  { id: 'c2', name: 'سعيد', notes: '', fatherId: 'root', createdAt: Date.now() - 3500 },
  { id: 'c3', name: 'راشد', notes: '', fatherId: 'root', createdAt: Date.now() - 3000 },
  { id: 'g1', name: 'سالم', notes: '', fatherId: 'c1', createdAt: Date.now() - 2500 },
  { id: 'g2', name: 'عبدالله', notes: '', fatherId: 'c1', createdAt: Date.now() - 2200 },
  { id: 'g3', name: 'محمد', notes: '', fatherId: 'c2', createdAt: Date.now() - 2000 },
  { id: 'gg1', name: 'فهد', notes: '', fatherId: 'g1', createdAt: Date.now() - 1500 },
  { id: 'gg2', name: 'خالد', notes: '', fatherId: 'g1', createdAt: Date.now() - 1000 },
];

const SEED: FamilyData = { members: SEED_MEMBERS, version: 3 };

export function loadData(): FamilyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as FamilyData;
    if (!parsed.members || !Array.isArray(parsed.members)) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

export function saveData(data: FamilyData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function exportData(data: FamilyData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-tree-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<FamilyData> {
  const text = await file.text();
  const parsed = JSON.parse(text) as FamilyData;
  if (!parsed.members || !Array.isArray(parsed.members)) {
    throw new Error('ملف غير صالح');
  }
  return parsed;
}

export function createId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
