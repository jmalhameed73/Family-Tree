import { useState, useMemo } from 'react';
import { Plus, User, TreePalm, ChevronDown } from 'lucide-react';
import type { Member } from '@/types';
import { childrenOf, getLineage, getGeneration } from '@/lib/tree';

interface TreeViewProps {
  members: Member[];
  query: string;
  onAction: (member: Member, action: 'addSon' | 'edit' | 'delete') => void;
}

// ألوان لكل جيل
const GEN_COLORS = [
  'bg-sky-100 border-sky-500 text-sky-700',
  'bg-emerald-100 border-emerald-500 text-emerald-700',
  'bg-amber-100 border-amber-500 text-amber-700',
  'bg-rose-100 border-rose-500 text-rose-700',
  'bg-violet-100 border-violet-500 text-violet-700',
];

const GEN_BG = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

export function TreeView({ members, query, onAction }: TreeViewProps) {
  const roots = useMemo(
    () => members.filter((m) => !m.fatherId).sort((a, b) => a.createdAt - b.createdAt),
    [members]
  );

  const searching = query.trim().length > 0;

  if (roots.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <TreePalm className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">لا توجد جذور</h2>
        <p className="mt-1.5 text-[14px] text-slate-500">
          أضف الجد الأكبر لبدء شجرة العائلة
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 pt-2 overflow-x-auto">
      <div className="flex justify-center gap-8 min-w-max">
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            member={root}
            members={members}
            depth={0}
            query={query}
            searching={searching}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  member: Member;
  members: Member[];
  depth: number;
  query: string;
  searching: boolean;
  onAction: (member: Member, action: 'addSon' | 'edit' | 'delete') => void;
}

function TreeNode({ member, members, depth, query, searching, onAction }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const children = childrenOf(members, member.id);
  const gen = Math.min(depth, GEN_COLORS.length - 1);
  const colorIndex = gen % GEN_COLORS.length;
  const q = query.trim().toLowerCase();

  const matchesQuery = !q || member.name.toLowerCase().includes(q);
  const hasMatchingChild = subtreeHasMatch(member.id, members, q);
  const shouldShow = !q || matchesQuery || hasMatchingChild;

  if (!shouldShow) return null;

  const isExpanded = searching ? (matchesQuery || hasMatchingChild) : expanded;

  return (
    <div className="flex flex-col items-center">
      {/* العقدة الحالية */}
      <div className="relative">
        {/* خط عمودي يربط الأبناء (يظهر فقط إذا كان هناك أبناء) */}
        {children.length > 0 && isExpanded && (
          <div className="absolute -bottom-4 left-1/2 h-4 w-0.5 bg-slate-300" />
        )}
        
        <div
          className={`relative flex items-center gap-2 rounded-2xl border-2 ${GEN_COLORS[colorIndex]} bg-white px-4 py-2.5 shadow-md transition-all cursor-pointer hover:shadow-lg ${
            matchesQuery && q ? 'ring-2 ring-sky-300 ring-offset-2' : ''
          }`}
          onClick={() => children.length > 0 && setExpanded(!isExpanded)}
        >
          {/* الصورة الرمزية */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${GEN_BG[colorIndex]} text-white`}>
            <User className="h-5 w-5" />
          </div>

          {/* الاسم */}
          <div className="text-right">
            <p className="text-[14px] font-bold text-slate-800">{member.name}</p>
            {depth > 0 && (
              <p className="text-[10px] text-slate-400">الجيل {depth + 1}</p>
            )}
          </div>

          {/* عدد الأبناء */}
          {children.length > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${GEN_COLORS[colorIndex]}`}>
              {children.length}
            </span>
          )}

          {/* زر الإجراءات */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(member, 'addSon');
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* زر التوسيع */}
          {children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!isExpanded);
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 active:scale-90"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* الملاحظات */}
        {member.notes && (
          <p className="mt-1 max-w-[120px] text-center text-[10px] leading-relaxed text-slate-400">
            {member.notes}
          </p>
        )}
      </div>

      {/* الأبناء - متفرعين أفقياً */}
      {isExpanded && children.length > 0 && (
        <div className="relative mt-4 flex justify-center gap-6">
          {/* خط أفقي يربط الأبناء */}
          <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-slate-300" />
          
          {children.map((child, index) => (
            <div key={child.id} className="relative flex flex-col items-center">
              {/* خط عمودي من الخط الأفقي إلى الابن */}
              <div className="h-3 w-0.5 bg-slate-300" />
              <TreeNode
                member={child}
                members={members}
                depth={depth + 1}
                query={query}
                searching={searching}
                onAction={onAction}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function subtreeHasMatch(rootId: string, members: Member[], q: string): boolean {
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    const node = members.find((m) => m.id === cur);
    if (node && node.name.toLowerCase().includes(q)) return true;
    members
      .filter((m) => m.fatherId === cur)
      .forEach((m) => stack.push(m.id));
  }
  return false;
}