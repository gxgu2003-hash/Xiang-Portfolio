import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as d3 from 'd3';
import { Edit2, Plus, Check, X, Trash2 } from 'lucide-react';
import type { ValueCircle, ValueItem, ItemStatus } from '@/types';
import { useEditMode } from '@/hooks/useEditMode';

const initialValues: ValueCircle[] = [
  {
    id: 'creative',
    name: '创造',
    description: 'Creative Output',
    color: '#f472b6',
    items: [
      { id: 'c1', title: '个人网站', description: '设计并开发个人品牌网站', status: 'done', valueType: 'creative' },
      { id: 'c2', title: '设计系统', description: '构建完整的设计语言系统', status: 'done', valueType: 'creative' },
      { id: 'c3', title: 'AI艺术项目', description: '探索生成式AI与艺术的结合', status: 'aspiration', valueType: 'creative' },
      { id: 'c4', title: '纪录片', description: '拍摄关于创作者生活的纪录片', status: 'aspiration', valueType: 'creative' },
    ],
  },
  {
    id: 'connection',
    name: '连接',
    description: 'Connection',
    color: '#60a5fa',
    items: [
      { id: 'cn1', title: '导师计划', description: '指导5位年轻设计师成长', status: 'done', valueType: 'connection' },
      { id: 'cn2', title: '社区建设', description: '创建设计师交流社群', status: 'done', valueType: 'connection' },
      { id: 'cn3', title: '播客节目', description: '启动设计思维播客', status: 'aspiration', valueType: 'connection' },
    ],
  },
  {
    id: 'exploration',
    name: '探索',
    description: 'Exploration',
    color: '#a78bfa',
    items: [
      { id: 'e1', title: '东南亚旅行', description: '背包游历泰国、越南、印尼', status: 'done', valueType: 'exploration' },
      { id: 'e2', title: '冥想静修', description: '参加10日内观冥想课程', status: 'done', valueType: 'exploration' },
      { id: 'e3', title: '南极之旅', description: '探索地球最后的净土', status: 'aspiration', valueType: 'exploration' },
      { id: 'e4', title: '太空旅行', description: '体验商业太空飞行', status: 'aspiration', valueType: 'exploration' },
    ],
  },
  {
    id: 'wellbeing',
    name: '修身',
    description: 'Well-being',
    color: '#4ade80',
    items: [
      { id: 'w1', title: '马拉松', description: '完成人生第一个全程马拉松', status: 'done', valueType: 'wellbeing' },
      { id: 'w2', title: '瑜伽练习', description: '建立每日瑜伽习惯', status: 'done', valueType: 'wellbeing' },
      { id: 'w3', title: '铁人三项', description: '挑战游泳、骑行、跑步组合', status: 'aspiration', valueType: 'wellbeing' },
    ],
  },
];

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  type: 'center' | 'value' | 'item';
  data?: ValueCircle | ValueItem;
  parentId?: string;
  radius: number;
  color: string;
  status?: ItemStatus;
}

export function ValueCircles() {
  const [values, setValues] = useState<ValueCircle[]>(initialValues);
  const [selectedValue, setSelectedValue] = useState<ValueCircle | null>(null);
  const [selectedItem, setSelectedItem] = useState<ValueItem | null>(null);
  const [editingItem, setEditingItem] = useState<ValueItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const simulationRef = useRef<d3.Simulation<NodeData, undefined> | null>(null);

  // Initialize D3 simulation
  useEffect(() => {
    if (!svgRef.current || !isInView) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Create nodes
    const centerNode: NodeData = {
      id: 'center',
      type: 'center',
      radius: 30,
      color: '#ffffff',
    };
    centerNode.fx = width / 2;
    centerNode.fy = height / 2;

    const valueNodes: NodeData[] = values.map((v, i) => {
      const angle = (i * 2 * Math.PI) / values.length;
      const distance = Math.min(width, height) * 0.25;
      const node: NodeData = {
        id: v.id,
        type: 'value',
        data: v,
        radius: 45,
        color: v.color,
      };
      node.x = width / 2 + Math.cos(angle) * distance;
      node.y = height / 2 + Math.sin(angle) * distance;
      return node;
    });

    const itemNodes: NodeData[] = [];
    values.forEach((v) => {
      v.items.forEach((item, i) => {
        const angle = (i * 2 * Math.PI) / v.items.length + Math.random() * 0.5;
        const distance = 80 + Math.random() * 40;
        const parentNode = valueNodes.find((n) => n.id === v.id);
        const node: NodeData = {
          id: item.id,
          type: 'item',
          data: item,
          parentId: v.id,
          radius: item.status === 'done' ? 20 : 15,
          color: v.color,
          status: item.status,
        };
        node.x = (parentNode?.x || width / 2) + Math.cos(angle) * distance;
        node.y = (parentNode?.y || height / 2) + Math.sin(angle) * distance;
        itemNodes.push(node);
      });
    });

    const allNodes = [centerNode, ...valueNodes, ...itemNodes];
    setNodes(allNodes);

    // Create simulation
    const simulation = d3
      .forceSimulation<NodeData>(allNodes)
      .force(
        'link',
        d3
          .forceLink<NodeData, d3.SimulationLinkDatum<NodeData>>()
          .id((d: NodeData) => d.id)
          .distance((d: d3.SimulationLinkDatum<NodeData>) => {
            const source = d.source as NodeData;
            if (source.type === 'center') return 120;
            return 60;
          })
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        'collision',
        d3.forceCollide<NodeData>().radius((d: NodeData) => d.radius + 10)
      )
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02));

    // Add links
    const links: d3.SimulationLinkDatum<NodeData>[] = [];
    valueNodes.forEach((v) => {
      links.push({ source: 'center', target: v.id });
    });
    itemNodes.forEach((item) => {
      links.push({ source: item.parentId!, target: item.id });
    });
    const linkForce = simulation.force('link') as d3.ForceLink<NodeData, d3.SimulationLinkDatum<NodeData>>;
    if (linkForce) {
      linkForce.links(links);
    }

    simulation.on('tick', () => {
      setNodes([...allNodes]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [isInView, values]);

  const handleNodeClick = (node: NodeData) => {
    if (node.type === 'value' && node.data) {
      setSelectedValue(node.data as ValueCircle);
    } else if (node.type === 'item' && node.data) {
      setSelectedItem(node.data as ValueItem);
    }
  };

  const handleSaveItem = () => {
    if (editingItem) {
      if (isAddingItem) {
        const newItem = { ...editingItem, id: Date.now().toString() };
        setValues(
          values.map((v) =>
            v.id === selectedValue?.id
              ? { ...v, items: [...v.items, newItem] }
              : v
          )
        );
        setIsAddingItem(false);
      } else {
        setValues(
          values.map((v) => ({
            ...v,
            items: v.items.map((i) => (i.id === editingItem.id ? editingItem : i)),
          }))
        );
      }
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setValues(
      values.map((v) => ({
        ...v,
        items: v.items.filter((i) => i.id !== itemId),
      }))
    );
    setSelectedItem(null);
  };

  const handleAddItem = () => {
    if (selectedValue) {
      setEditingItem({
        id: '',
        title: '',
        description: '',
        status: 'aspiration',
        valueType: selectedValue.id,
      });
      setIsAddingItem(true);
    }
  };

  return (
    <section
      id="middle-section"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-6 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto mb-12"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-white/50 text-sm mb-2 tracking-widest uppercase"
        >
          Middle Level
        </motion.p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">中层认识</h2>
        <p className="text-white/50 text-lg">个人核心价值</p>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/60" />
          <span className="text-sm text-white/50">已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-white/40 border-dashed" />
          <span className="text-sm text-white/50">想做未做</span>
        </div>
      </motion.div>

      {/* Force Graph */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative w-full h-[600px] md:h-[700px]"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${svgRef.current?.clientWidth || 800} ${svgRef.current?.clientHeight || 600}`}
        >
          {/* Links */}
          <g>
            {nodes.map((node, i) => {
              if (node.type === 'center') return null;
              const parent = nodes.find((n) =>
                node.type === 'value'
                  ? n.id === 'center'
                  : n.id === node.parentId
              );
              if (!parent || !parent.x || !parent.y || !node.x || !node.y) return null;
              return (
                <line
                  key={`link-${i}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={node.color}
                  strokeWidth={node.type === 'value' ? 2 : 1}
                  strokeOpacity={0.3}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x || 0}, ${node.y || 0})`}
                className="cursor-pointer"
                onClick={() => handleNodeClick(node)}
              >
                {node.type === 'center' ? (
                  <>
                    <circle
                      r={node.radius}
                      fill="rgba(255,255,255,0.1)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={2}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={12}
                      fontWeight={500}
                    >
                      核心
                    </text>
                  </>
                ) : node.type === 'value' ? (
                  <>
                    <circle
                      r={node.radius}
                      fill={`${node.color}30`}
                      stroke={node.color}
                      strokeWidth={2}
                      className="animate-pulse-glow"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={14}
                      fontWeight={600}
                    >
                      {(node.data as ValueCircle)?.name}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      r={node.radius}
                      fill={
                        node.status === 'done'
                          ? `${node.color}80`
                          : 'transparent'
                      }
                      stroke={node.color}
                      strokeWidth={2}
                      strokeDasharray={node.status === 'aspiration' ? '4,4' : '0'}
                      className={node.status === 'aspiration' ? 'animate-breathe' : ''}
                    />
                  </>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Value Labels */}
        <div className="absolute inset-0 pointer-events-none">
          {values.map((v) => {
            const node = nodes.find((n) => n.id === v.id);
            if (!node || !node.x || !node.y) return null;
            return (
              <motion.div
                key={v.id}
                className="absolute text-xs text-white/40"
                style={{
                  left: node.x,
                  top: node.y + 60,
                  transform: 'translateX(-50%)',
                }}
              >
                {v.description}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Value Detail Modal */}
      <AnimatePresence>
        {selectedValue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => setSelectedValue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${selectedValue.color}30` }}
                  >
                    <span className="text-2xl" style={{ color: selectedValue.color }}>
                      {selectedValue.name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedValue.name}</h3>
                    <p className="text-white/50 text-sm">{selectedValue.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedValue(null)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white/70 text-sm font-medium">项目列表</h4>
                  {isEditMode && (
                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-sm"
                    >
                      <Plus className="w-3 h-3" />
                      添加
                    </button>
                  )}
                </div>
                {selectedValue.items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedItem(item)}
                    className="glass rounded-xl p-4 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'done'
                              ? 'bg-white/60'
                              : 'border border-white/40 border-dashed'
                          }`}
                        />
                        <div>
                          <h5 className="text-white font-medium group-hover:text-white/90">
                            {item.title}
                          </h5>
                          <p className="text-white/50 text-sm">{item.description}</p>
                        </div>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-white/50" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      selectedItem.status === 'done'
                        ? 'bg-white/60'
                        : 'border border-white/40 border-dashed'
                    }`}
                  />
                  <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed">{selectedItem.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    selectedItem.status === 'done'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/50 border border-white/20 border-dashed'
                  }`}
                >
                  {selectedItem.status === 'done' ? '已完成' : '想做未做'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => {
              setEditingItem(null);
              setIsAddingItem(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {isAddingItem ? '添加项目' : '编辑项目'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">标题</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl password-input text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">描述</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl password-input text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">状态</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingItem({ ...editingItem, status: 'done' })
                      }
                      className={`flex-1 py-2 px-4 rounded-xl transition-colors ${
                        editingItem.status === 'done'
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      已完成
                    </button>
                    <button
                      onClick={() =>
                        setEditingItem({ ...editingItem, status: 'aspiration' })
                      }
                      className={`flex-1 py-2 px-4 rounded-xl transition-colors border border-dashed ${
                        editingItem.status === 'aspiration'
                          ? 'bg-white/20 text-white border-white/40'
                          : 'bg-transparent text-white/50 border-white/20 hover:border-white/40'
                      }`}
                    >
                      想做未做
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveItem}
                  className="flex-1 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsAddingItem(false);
                  }}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
