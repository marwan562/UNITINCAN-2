import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import Icons
import {
  Thermometer,
  GitBranch,
  Power,
  Save,
  Trash2,
  Sparkles,
  ArrowLeft,
  Copy,
  Trash,
  Info,
  X,
} from 'lucide-react';

// Import Custom Nodes
import SensorNode from './SensorNode';
import ConditionNode from './ConditionNode';
import ActuatorNode from './ActuatorNode';
import AICopilot from './AICopilot';

// Import Confetti
import confetti from 'canvas-confetti';

// Register Node Types
const nodeTypes = {
  sensor: SensorNode,
  condition: ConditionNode,
  actuator: ActuatorNode,
};

// Initial Nodes Setup matching user screenshot
const initialNodes: Node[] = [
  {
    id: 'sensor-1',
    type: 'sensor',
    position: { x: 80, y: 30 },
    data: { topic: 'tmp', value: 80 },
  },
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 80, y: 190 },
    data: { operator: '>=', threshold: 70 },
  },
  {
    id: 'actuator-1',
    type: 'actuator',
    position: { x: 80, y: 460 },
    data: { topic: 'sprinkler-11', status: 'OFF' },
  },
  {
    id: 'sensor-2',
    type: 'sensor',
    position: { x: 380, y: 80 },
    data: { topic: 'No topic', value: 'Idle' },
  },
  {
    id: 'condition-2',
    type: 'condition',
    position: { x: 380, y: 240 },
    data: { operator: '==', threshold: 0 },
  },
];

// Initial Edges matching user screenshot
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'sensor-1',
    target: 'condition-1',
    sourceHandle: 'a',
    targetHandle: 'input',
    animated: true,
    style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
  },
  {
    id: 'e2-3',
    source: 'condition-1',
    target: 'actuator-1',
    sourceHandle: 'true',
    targetHandle: 'input',
    animated: true,
    style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
  },
  {
    id: 'e4-5',
    source: 'sensor-2',
    target: 'condition-2',
    sourceHandle: 'a',
    targetHandle: 'input',
    animated: true,
    style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
  },
];

// Evaluation engine to propagate values and conditions downstream
const evaluateFlow = (currentNodes: Node[], currentEdges: Edge[]): Node[] => {
  // 1. Reset evaluations
  let updatedNodes = currentNodes.map((node) => {
    if (node.type === 'condition') {
      return {
        ...node,
        data: {
          ...node.data,
          sensorValue: undefined,
          isMet: undefined,
        },
      };
    } else if (node.type === 'actuator') {
      return {
        ...node,
        data: {
          ...node.data,
          status: 'OFF' as const,
        },
      };
    }
    return node;
  });

  // 2. Propagate signals iteratively
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;

    for (const edge of currentEdges) {
      const sourceNode = updatedNodes.find((n) => n.id === edge.source);
      const targetNode = updatedNodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) continue;

      // Sensor -> Condition Propagation
      if (sourceNode.type === 'sensor' && targetNode.type === 'condition') {
        const sensorVal = sourceNode.data.value;
        const conditionData = targetNode.data as any;

        if (conditionData.sensorValue !== sensorVal) {
          conditionData.sensorValue = sensorVal;

          // Perform logic
          const val = Number(sensorVal);
          const thresh = Number(conditionData.threshold);
          const op = conditionData.operator;
          let isMet = false;

          if (isNaN(val)) {
            // String comparison if value is not numeric
            const sVal = String(sensorVal);
            const sThresh = String(conditionData.threshold);
            if (op === '==') isMet = sVal === sThresh;
            else if (op === '!=') isMet = sVal !== sThresh;
          } else {
            if (op === '>=') isMet = val >= thresh;
            else if (op === '<=') isMet = val <= thresh;
            else if (op === '==') isMet = val === thresh;
            else if (op === '!=') isMet = val !== thresh;
            else if (op === '>') isMet = val > thresh;
            else if (op === '<') isMet = val < thresh;
          }

          if (conditionData.isMet !== isMet) {
            conditionData.isMet = isMet;
            changed = true;
          }
        }
      }

      // Condition -> Actuator Propagation
      if (sourceNode.type === 'condition' && targetNode.type === 'actuator') {
        const conditionData = sourceNode.data as any;
        const actuatorData = targetNode.data as any;

        const handleId = edge.sourceHandle; // "true" or "false"
        const isMet = conditionData.isMet;

        if (isMet !== undefined) {
          const pathActive = (isMet === true && handleId === 'true') || (isMet === false && handleId === 'false');
          if (pathActive && actuatorData.status !== 'ON') {
            actuatorData.status = 'ON';
            changed = true;
          }
        }
      }
    }
  }

  return updatedNodes;
};

function FlowBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(() => evaluateFlow(initialNodes, initialEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [detailsNode, setDetailsNode] = useState<Node | null>(null);

  // Helper to trigger toast messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Node data edit callback
  const updateNodeData = useCallback((id: string, field: string, value: any) => {
    setNodes((nds) => {
      const updated = nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      });
      return evaluateFlow(updated, edges);
    });
  }, [edges, setNodes]);

  // Bind the latest edit callback to node instances
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: updateNodeData,
      },
    }));
  }, [nodes, updateNodeData]);

  // Connect handler
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
      };
      setEdges((eds) => {
        const nextEdges = addEdge(newEdge, eds);
        setNodes((nds) => evaluateFlow(nds, nextEdges));
        return nextEdges;
      });
    },
    [setEdges, setNodes]
  );

  // Edge deletions
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((eds) => {
        const nextEdges = eds.filter((e) => !edgesToDelete.some((del) => del.id === e.id));
        setNodes((nds) => evaluateFlow(nds, nextEdges));
        return nextEdges;
      });
    },
    [setEdges, setNodes]
  );

  // Node deletions
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => !nodesToDelete.some((del) => del.id === n.id));
        setEdges((eds) => {
          const nextEdges = eds.filter(
            (e) => !nodesToDelete.some((del) => del.id === e.source || del.id === e.target)
          );
          setTimeout(() => {
            setNodes((currentNds) => evaluateFlow(currentNds, nextEdges));
          }, 0);
          return nextEdges;
        });
        return nextNodes;
      });
    },
    [setNodes, setEdges]
  );

  // Drag & drop handlers
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default values per type
      let defaultData: any = {};
      if (type === 'sensor') {
        defaultData = { topic: 'sensor_topic', value: 50 };
      } else if (type === 'condition') {
        defaultData = { operator: '>=', threshold: 40 };
      } else if (type === 'actuator') {
        defaultData = { topic: 'actuator_topic', status: 'OFF' };
      }

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => evaluateFlow([...nds, newNode], edges));
    },
    [reactFlowInstance, edges, setNodes]
  );

  // Action: Save automation schema
  const handleSave = () => {
    // Confetti burst!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    triggerToast("Automation flow saved successfully!");
  };

  // Action: Clear canvas
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    triggerToast("Workspace cleared.");
  };

  // Context Menu Actions
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY - rect.top,
        left: event.clientX - rect.left,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleMenuDelete = useCallback(() => {
    if (!menu) return;
    const nodeId = menu.id;
    setNodes((nds) => {
      const nextNodes = nds.filter((n) => n.id !== nodeId);
      setEdges((eds) => {
        const nextEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        setTimeout(() => {
          setNodes((currentNds) => evaluateFlow(currentNds, nextEdges));
        }, 0);
        return nextEdges;
      });
      return nextNodes;
    });
    setMenu(null);
    if (detailsNode?.id === nodeId) {
      setDetailsNode(null);
    }
    triggerToast("Node deleted.");
  }, [menu, setNodes, setEdges, detailsNode]);

  const handleMenuClone = useCallback(() => {
    if (!menu) return;
    const sourceNode = nodes.find((n) => n.id === menu.id);
    if (!sourceNode) return;

    const clonedNode: Node = {
      ...sourceNode,
      id: `${sourceNode.type}_clone_${Date.now()}`,
      position: {
        x: sourceNode.position.x + 40,
        y: sourceNode.position.y + 40,
      },
      data: {
        ...sourceNode.data,
      },
      selected: false,
    };

    setNodes((nds) => evaluateFlow([...nds, clonedNode], edges));
    setMenu(null);
    triggerToast("Node duplicated.");
  }, [menu, nodes, edges, setNodes]);

  const handleMenuDetails = useCallback(() => {
    if (!menu) return;
    const targetNode = nodes.find((n) => n.id === menu.id);
    if (targetNode) {
      setDetailsNode(targetNode);
    }
    setMenu(null);
  }, [menu, nodes]);

  // Apply AI Generated Flow callback
  const handleApplyAIGeneratedFlow = useCallback((newNodes: Node[], newEdges: Edge[], clearFirst: boolean) => {
    setNodes((nds) => {
      const baseNodes = clearFirst ? [] : nds;
      const mergedNodes = [...baseNodes, ...newNodes];
      
      setEdges((eds) => {
        const baseEdges = clearFirst ? [] : eds;
        const mergedEdges = [...baseEdges, ...newEdges];
        
        setTimeout(() => {
          setNodes((currentNds) => evaluateFlow(currentNds, mergedEdges));
        }, 0);
        
        return mergedEdges;
      });
      
      return mergedNodes;
    });

    if (newNodes.length >= 3 && newEdges.length >= 2) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.6 },
        });
      }, 100);
    }

    triggerToast(clearFirst ? "AI flow generated!" : "AI flow appended!");
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col md:flex-row h-[700px] w-full text-slate-800 bg-[#f8fafc] rounded-b-[24px] overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Side Panel: Draggable Nodes Template */}
      <div className="w-full md:w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 select-none z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">Nodes</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">Drag and drop to create flows</p>

          <div className="flex flex-col gap-4">
            {/* Template: Sensor Node */}
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'sensor')}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-grab hover:border-blue-500 hover:shadow transition-all group active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Thermometer size={16} />
                </div>
                <span className="font-semibold text-xs text-slate-800">Sensor Node</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Collects data from sensors</p>
            </div>

            {/* Template: Condition Node */}
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'condition')}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-grab hover:border-purple-500 hover:shadow transition-all group active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <GitBranch size={16} />
                </div>
                <span className="font-semibold text-xs text-slate-800">Condition Node</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Evaluates conditions</p>
            </div>

            {/* Template: Actuator Node */}
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'actuator')}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-grab hover:border-orange-500 hover:shadow transition-all group active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Power size={16} />
                </div>
                <span className="font-semibold text-xs text-slate-800">Actuator Node</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Controls actuators</p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Save size={14} />
            Save Automation
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-semibold py-2.5 rounded-xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Trash2 size={14} />
            Clear Automation
          </button>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div
        ref={reactFlowWrapper}
        className="flex-1 h-full relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          onInit={setReactFlowInstance}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onViewportChangeStart={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background variant={BackgroundVariant.Lines} color="#e2e8f0" gap={16} />
          <Controls showInteractive={false} className="shadow-lg border border-slate-200/50 rounded-lg overflow-hidden bg-white" />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'sensor') return '#2563eb';
              if (n.type === 'condition') return '#9333ea';
              if (n.type === 'actuator') return '#f97316';
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.type === 'sensor') return '#eff6ff';
              if (n.type === 'condition') return '#faf5ff';
              if (n.type === 'actuator') return '#fff7ed';
              return '#fff';
            }}
            className="border border-slate-200/50 rounded-lg overflow-hidden bg-white shadow-lg shadow-slate-100/50"
            maskColor="rgba(241, 245, 249, 0.5)"
          />
        </ReactFlow>
        <AICopilot onApplyFlow={handleApplyAIGeneratedFlow} existingNodes={nodes} />
      </div>

      {/* Floating Context Menu */}
      {menu && (
        <div
          className="absolute z-30 bg-white/95 border border-slate-200 shadow-2xl rounded-xl py-1.5 w-48 text-xs font-semibold backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{ top: menu.top, left: menu.left }}
        >
          <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 mb-1">
            Node Actions
          </div>
          <button
            onClick={handleMenuDetails}
            className="px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors cursor-pointer"
          >
            <Info size={14} className="text-slate-400" />
            Show Details
          </button>
          <button
            onClick={handleMenuClone}
            className="px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors cursor-pointer"
          >
            <Copy size={14} className="text-slate-400" />
            Clone Node
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={handleMenuDelete}
            className="px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors font-bold cursor-pointer"
          >
            <Trash size={14} />
            Remove Node
          </button>
        </div>
      )}

      {/* Node Details Inspection Modal */}
      {detailsNode && (
        <div className="absolute top-4 right-4 z-40 w-80 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-5 text-xs text-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Node Details</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{detailsNode.id}</p>
            </div>
            <button
              onClick={() => setDetailsNode(null)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-bold">Type:</span>
              <span className="col-span-2 font-bold capitalize text-slate-900">
                {detailsNode.type} Node
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-bold">Position:</span>
              <span className="col-span-2 font-mono text-slate-600">
                X: {Math.round(detailsNode.position.x)}, Y: {Math.round(detailsNode.position.y)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-1">
              <span className="text-slate-400 font-bold block mb-2">State Data:</span>
              <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                {JSON.stringify(
                  {
                    id: detailsNode.id,
                    type: detailsNode.type,
                    data: {
                      topic: detailsNode.data.topic,
                      value: detailsNode.data.value,
                      operator: detailsNode.data.operator,
                      threshold: detailsNode.data.threshold,
                      status: detailsNode.data.status,
                      isMet: detailsNode.data.isMet,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
