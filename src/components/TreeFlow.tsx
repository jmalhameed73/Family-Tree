import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Position,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import type { Member } from '@/types';
import { childrenOf } from '@/lib/tree';
import { useSettings, type CardSize } from '@/context/SettingsContext';

interface TreeFlowProps {
  members: Member[];
  query: string;
  onAction: (member: Member, action: 'addSon' | 'edit' | 'delete') => void;
}

// ألوان لكل جيل
const GEN_COLORS = [
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
];

// دوال مساعدة للحجم
const getCardSizeClass = (size: CardSize): string => {
  switch (size) {
    case 'small': return 'px-2 py-1.5 min-w-[60px] text-xs';
    case 'large': return 'px-4 py-2.5 min-w-[100px] text-base';
    default: return 'px-3 py-2 min-w-[80px] text-sm';
  }
};

const getAvatarClass = (size: CardSize): string => {
  switch (size) {
    case 'small': return 'w-6 h-6 text-xs';
    case 'large': return 'w-10 h-10 text-base';
    default: return 'w-8 h-8 text-sm';
  }
};

const getBadgeClass = (size: CardSize): string => {
  switch (size) {
    case 'small': return 'text-[8px] px-1 py-0.5';
    case 'large': return 'text-xs px-2 py-0.5';
    default: return 'text-[10px] px-1.5 py-0.5';
  }
};

const getNotesClass = (size: CardSize): string => {
  switch (size) {
    case 'small': return 'text-[8px]';
    case 'large': return 'text-xs';
    default: return 'text-[10px]';
  }
};

// دالة البحث في الشجرة الفرعية
function subtreeHasMatch(rootId: string, members: Member[], q: string): boolean {
  if (!q) return true;
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    const node = members.find((m) => m.id === cur);
    if (node && node.name.toLowerCase().includes(q)) return true;
    members
      .filter((m) => m.father_id === cur)
      .forEach((m) => stack.push(m.id));
  }
  return false;
}

// مكون الشجرة الداخلي
function TreeFlowInner({ members, query, onAction }: TreeFlowProps) {
  const reactFlow = useReactFlow();
  const q = query.trim().toLowerCase();
  const { cardSize } = useSettings();

  // بناء العقد مع دعم الترتيب
  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    const byId = new Map(members.map((m) => [m.id, m]));
    
    const getGen = (id: string): number => {
      let gen = 0;
      let current = byId.get(id);
      while (current?.father_id) {
        gen++;
        current = byId.get(current.father_id);
      }
      return gen;
    };

    const positions = new Map<string, { x: number; y: number }>();
    
    const getDepth = (id: string): number => {
      const children = childrenOf(members, id);
      if (children.length === 0) return 0;
      return 1 + Math.max(...children.map(c => getDepth(c.id)));
    };

    // ترتيب الأبناء حسب `order` أو `created_at`
    const getChildren = (id: string) => {
      return childrenOf(members, id).sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.created_at - b.created_at;
      });
    };

    const placeNodes = (id: string, x: number, y: number, spacing: number) => {
      positions.set(id, { x, y });
      const children = getChildren(id);
      if (children.length === 0) return;
      
      const childSpacing = spacing / children.length;
      children.forEach((child, index) => {
        const childX = x - (spacing / 2) + (index + 0.5) * childSpacing;
        placeNodes(child.id, childX, y + 140, childSpacing * 0.8);
      });
    };

    const roots = members.filter(m => !m.father_id);
    const totalRoots = roots.length;
    roots.forEach((root, index) => {
      const depth = getDepth(root.id);
      const rootX = (index - (totalRoots - 1) / 2) * 250;
      placeNodes(root.id, rootX, 50, 350);
    });

    members.forEach((member) => {
      const pos = positions.get(member.id);
      if (!pos) return;
      
      const gen = getGen(member.id);
      const color = GEN_COLORS[gen % GEN_COLORS.length];
      const children = getChildren(member.id);
      
      const matchesQuery = !q || member.name.toLowerCase().includes(q);
      const hasMatchingChild = subtreeHasMatch(member.id, members, q);
      const isVisible = !q || matchesQuery || hasMatchingChild;
      
      if (!isVisible) return;

      result.push({
        id: member.id,
        type: 'default',
        position: pos,
        data: {
          label: (
            <div 
              className={`flex items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 ${getCardSizeClass(cardSize)}`}
              style={{ 
                backgroundColor: 'white',
                border: `3px solid ${color}`,
                maxWidth: '200px',
              }}
              onClick={() => onAction(member, 'addSon')}
              onDoubleClick={() => onAction(member, 'edit')}
            >
              {/* الصورة الرمزية */}
              <div 
                className={`flex items-center justify-center rounded-full text-white font-bold shrink-0 ${getAvatarClass(cardSize)}`}
                style={{ backgroundColor: color }}
              >
                {member.name.charAt(0)}
              </div>
              
              {/* النص */}
              <div className="text-center min-w-0 flex-1">
                <div className={`font-bold text-slate-800 truncate ${getCardSizeClass(cardSize)}`}>
                  {member.name}
                </div>
                {member.notes && (
                  <div className={`text-slate-400 truncate max-w-[100px] mx-auto ${getNotesClass(cardSize)}`}>
                    {member.notes}
                  </div>
                )}
              </div>
              
              {/* عدد الأبناء */}
              {children.length > 0 && (
                <div 
                  className={`rounded-full text-white shrink-0 ${getBadgeClass(cardSize)}`}
                  style={{ backgroundColor: color }}
                >
                  {children.length}
                </div>
              )}
            </div>
          ),
        },
        style: {
          width: 'auto',
          padding: 0,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        className: matchesQuery && q ? 'ring-2 ring-sky-300 ring-offset-2 rounded-2xl' : '',
      });
    });

    return result;
  }, [members, onAction, q, cardSize]);

  // بناء الحواف (الخطوط)
  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    const visibleNodes = new Set(nodes.map(n => n.id));
    
    members.forEach((member) => {
      if (member.father_id && visibleNodes.has(member.id) && visibleNodes.has(member.father_id)) {
        result.push({
          id: `${member.father_id}-${member.id}`,
          source: member.father_id,
          target: member.id,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2.5,
          },
        });
      }
    });
    return result;
  }, [members, nodes]);

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  // تحديث العقد والحواف عند تغير البيانات
  useMemo(() => {
    setNodesState(nodes);
    setEdgesState(edges);
  }, [nodes, edges, setNodesState, setEdgesState]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const member = members.find(m => m.id === node.id);
    if (member) {
      onAction(member, 'addSon');
    }
  }, [members, onAction]);

  // أزرار التحكم
  const handleZoomIn = () => reactFlow.zoomIn();
  const handleZoomOut = () => reactFlow.zoomOut();
  const handleFitView = () => reactFlow.fitView({ padding: 0.2 });

  return (
    <div className="w-full h-full bg-white">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2.5 },
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#f1f5f9" gap={20} size={0.5} />
        
        {/* أزرار التحكم */}
        <Panel position="bottom-right" className="flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
            title="تكبير"
          >
            <ZoomIn className="h-5 w-5 text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
            title="تصغير"
          >
            <ZoomOut className="h-5 w-5 text-slate-700" />
          </button>
          <button
            onClick={handleFitView}
            className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
            title="عرض الكل"
          >
            <RotateCcw className="h-5 w-5 text-slate-700" />
          </button>
        </Panel>

        {/* معلومات التنقل */}
        <Panel position="bottom-left" className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 px-4 py-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Move className="h-3.5 w-3.5" />
            <span>اسحب للتنقل • تمرير للتكبير</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// المكون الرئيسي
export function TreeFlow(props: TreeFlowProps) {
  return (
    <ReactFlowProvider>
      <TreeFlowInner {...props} />
    </ReactFlowProvider>
  );
}