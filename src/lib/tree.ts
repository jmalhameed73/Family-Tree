import type { Member } from '@/types';

export function childrenOf(members: Member[], id: string): Member[] {
  return members
    .filter((m) => m.father_id === id)
    .sort((a, b) => a.created_at - b.created_at);
}

export function getDescendantIds(members: Member[], id: string): string[] {
  const result: string[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    members
      .filter((m) => m.father_id === cur)
      .forEach((m) => {
        result.push(m.id);
        stack.push(m.id);
      });
  }
  return result;
}

/** Builds the full lineage chain: "سالم بن غانم بن حميد" (person, father, grandfather...) */
export function getLineage(members: Member[], id: string): string {
  const chain: string[] = [];
  const byId = new Map(members.map((m) => [m.id, m]));
  let cur = byId.get(id);
  const seen = new Set<string>();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.push(cur.name);
    cur = cur.father_id ? byId.get(cur.father_id) : undefined;
  }
  return chain.join(' بن ');
}

/** Generation depth (root = 0) */
export function getGeneration(members: Member[], id: string): number {
  const byId = new Map(members.map((m) => [m.id, m]));
  let depth = 0;
  let cur = byId.get(id);
  const seen = new Set<string>();
  while (cur && cur.father_id && !seen.has(cur.id)) {
    seen.add(cur.id);
    cur = byId.get(cur.father_id);
    depth++;
  }
  return depth;
}