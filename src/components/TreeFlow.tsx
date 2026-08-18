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

interface TreeFlowProps {
  members: Member[];
  query: string;
  onAction: (member: Member, action: 'addSon' | 'edit' | 'delete') => void;
}

// ألوان لكل جيل
const GEN_COLORS = [
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // violet
];

// مكون الشجرة الداخلي
function TreeFlowInner({ members, query, onAction }: TreeFlowProps) {
  const reactFlow = useReactFlow();
  const q = query.trim().toLowerCase();

  // بناء العقد
  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    const byId = new Map(members.map((m) => [m.id, m]));
    
    // حساب الجيل
    const getGen = (id: string): number => {
      let gen = 0;
      let current = byId.get(id);
      while (current?.father_id) {
        gen++;
        current = byId.get(current.father_id);
      }
      return gen;
    };

    // حساب موقع العقد
    const positions = new Map<string, { x: number; y: number }>();
    
    const getDepth = (id: string): number => {
      const children = childrenOf(members, id);
      if (children.length === 0) return 0;
      return 1 + Math.max(...children.map(c => getDepth(c.id)));
    };

    const placeNodes = (id: string, x: number, y: number, spacing: number) => {
      positions.set(id, { x, y });
      const children = childrenOf(members, id);
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

    // إنشاء العقد
    members.forEach((member) => {
      const pos = positions.get(member.id);
      if (!pos) return;
      
      const gen = getGen(member.id);
      const color = GEN_COLORS[gen % GEN_COLORS.length];
      const children = childrenOf(members, member.id);
      
      // التحقق من مطابقة البحث
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              style={{ 
                backgroundColor: 'white',
                border: `3px solid ${color}`,
                minWidth: '90px',
                maxWidth: '180px',
              }}
              onClick={() => onAction(member, 'addSon')}
              onDoubleClick={() => onAction(member, 'edit')}
            >
              {/* الصورة الرمزية */}
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: color }}
              >
                {member.name.charAt(0)}
              </div>
              
              {/* النص في المنتصف */}
              <div className="text-center min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800 truncate">
                  {member.name}
                </div>
                {member.notes && (
                  <div className="text-[9px] text-slate-400 truncate max-w-[100px] mx-auto">
                    {member.notes}
                  </div>
                )}
              </div>
              
              {/* عدد الأبناء */}
              {children.length > 0 && (
                <div 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
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
  }, [members, onAction, q]);

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
        
        {/* أزرار التحكم المخصصة */}
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

// دالة مساعدة للبحث
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

// المكون الرئيسي مع ReactFlowProvider
export function TreeFlow(props: TreeFlowProps) {
  return (
    <ReactFlowProvider>
      <TreeFlowInner {...props} />
    </ReactFlowProvider>
  );
}