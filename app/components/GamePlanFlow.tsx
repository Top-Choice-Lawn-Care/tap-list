'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Submission IDs ───────────────────────────────────────────────────────────

const SUBMISSION_IDS = new Set([
  'triangle-choke', 'armbar', 'kimura', 'americana',
  'rear-naked-choke', 'guillotine', 'darce-choke',
  'omoplata', 'bow-arrow', 'ankle-lock', 'heel-hook',
]);

// "Advance" edges = transitions going toward dominant position
const ADVANCE_EDGE_IDS = new Set(['e8', 'e10', 'e14', 'e24', 'e25', 'e32', 'e36']);

// ─── Custom Node Components ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PositionNode({ data }: { data: any }) {
  const zone: string = data.zone;
  const opacity: number = data.opacity ?? 1;
  const isSelected: boolean = data.isSelected ?? false;

  let bg = '#1e3a5f';
  let border = '#3b82f6';
  if (zone === 'winning')  { bg = '#14532d'; border = '#22c55e'; }
  if (zone === 'losing')   { bg = '#3b1515'; border = '#ef4444'; }
  if (zone === 'standing') { bg = '#1c1c1e'; border = '#6b7280'; }

  const activeBorder = isSelected ? '#ffffff' : border;
  const boxShadow = isSelected
    ? '0 0 0 2px #fff, 0 0 16px 4px rgba(255,255,255,0.35)'
    : 'none';

  return (
    <div
      style={{
        background: bg,
        color: '#fff',
        border: `2px solid ${activeBorder}`,
        borderRadius: '8px',
        width: '160px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center',
        lineHeight: '1.3',
        padding: '0 10px',
        boxSizing: 'border-box',
        opacity,
        boxShadow,
        transition: 'opacity 0.2s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: 'hidden', width: 0, height: 0 }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: 'hidden', width: 0, height: 0 }}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubmissionNode({ data }: { data: any }) {
  const opacity: number = data.opacity ?? 1;
  const isSelected: boolean = data.isSelected ?? false;

  const activeBorder = isSelected ? '#ffffff' : '#dc2626';
  const boxShadow = isSelected
    ? '0 0 0 2px #fff, 0 0 16px 4px rgba(255,255,255,0.35)'
    : 'none';

  return (
    <div
      style={{
        background: '#450a0a',
        color: '#fca5a5',
        border: `2px solid ${activeBorder}`,
        borderRadius: '999px',
        width: '140px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        textAlign: 'center',
        lineHeight: '1.3',
        boxSizing: 'border-box',
        opacity,
        boxShadow,
        transition: 'opacity 0.2s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: 'hidden', width: 0, height: 0 }}
      />
      <span style={{ fontSize: '7px', lineHeight: 1 }}>🔴</span>
      <span>{data.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: 'hidden', width: 0, height: 0 }}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ZoneLabelNode({ data }: { data: any }) {
  return (
    <div
      style={{
        color: '#1e1e1e',
        fontSize: '32px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {data.label}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  position: PositionNode,
  submission: SubmissionNode,
  zoneLabel: ZoneLabelNode,
};

// ─── Manual Layout Positions ─────────────────────────────────────────────────
//
//  Col 0  Guard/neutral   x = 0
//  Col 1  Losing/bottom   x = 280
//  Col 2  Winning/top     x = 560
//  Col 3a Submissions-A   x = 840
//  Col 3b Submissions-B   x = 1010
//  Standing above cols 1–2: x = 340, y = 0
//  Row spacing: 130px  (y: 140, 270, 400, 530)

const BASE_NODES: Node[] = [
  // ── Zone labels (rendered first = behind position nodes) ──
  {
    id: 'zone-guard',
    type: 'zoneLabel',
    position: { x: -10, y: 80 },
    data: { label: 'GUARD' },
    selectable: false,
    draggable: false,
    focusable: false,
    zIndex: -1,
  },
  {
    id: 'zone-escaping',
    type: 'zoneLabel',
    position: { x: 248, y: 80 },
    data: { label: 'ESCAPING' },
    selectable: false,
    draggable: false,
    focusable: false,
    zIndex: -1,
  },
  {
    id: 'zone-attacking',
    type: 'zoneLabel',
    position: { x: 524, y: 80 },
    data: { label: 'ATTACKING' },
    selectable: false,
    draggable: false,
    focusable: false,
    zIndex: -1,
  },
  {
    id: 'zone-finishing',
    type: 'zoneLabel',
    position: { x: 810, y: -20 },
    data: { label: 'FINISHING' },
    selectable: false,
    draggable: false,
    focusable: false,
    zIndex: -1,
  },

  // ── Entry ──
  { id: 'standing',           type: 'position', position: { x: 340, y: 0   }, data: { label: 'Standing',           zone: 'standing' } },

  // ── Guard / Neutral (col 0) ──
  { id: 'closed-guard-bottom', type: 'position', position: { x: 0,   y: 140 }, data: { label: 'Closed Guard',        zone: 'neutral'  } },
  { id: 'open-guard-bottom',   type: 'position', position: { x: 0,   y: 270 }, data: { label: 'Open Guard',          zone: 'neutral'  } },
  { id: 'half-guard-bottom',   type: 'position', position: { x: 0,   y: 400 }, data: { label: 'Half Guard',          zone: 'neutral'  } },

  // ── Losing / Bottom (col 1) ──
  { id: 'side-control-bottom', type: 'position', position: { x: 280, y: 140 }, data: { label: 'Side Control ↓',      zone: 'losing'   } },
  { id: 'mount-bottom',        type: 'position', position: { x: 280, y: 270 }, data: { label: 'Mount ↓',             zone: 'losing'   } },
  { id: 'back-bottom',         type: 'position', position: { x: 280, y: 400 }, data: { label: 'Back ↓',              zone: 'losing'   } },
  { id: 'turtle',              type: 'position', position: { x: 280, y: 530 }, data: { label: 'Turtle',               zone: 'losing'   } },

  // ── Winning / Top (col 2) ──
  { id: 'side-control-top',    type: 'position', position: { x: 560, y: 140 }, data: { label: 'Side Control ↑',      zone: 'winning'  } },
  { id: 'mount-top',           type: 'position', position: { x: 560, y: 270 }, data: { label: 'Mount ↑',             zone: 'winning'  } },
  { id: 'back-mount-top',      type: 'position', position: { x: 560, y: 400 }, data: { label: 'Back Mount ↑',        zone: 'winning'  } },

  // ── Submissions col A (x=840) ──
  { id: 'guillotine',          type: 'submission', position: { x: 840, y: 10  }, data: { label: 'Guillotine'       } },
  { id: 'triangle-choke',      type: 'submission', position: { x: 840, y: 110 }, data: { label: 'Triangle Choke'   } },
  { id: 'armbar',              type: 'submission', position: { x: 840, y: 210 }, data: { label: 'Armbar'           } },
  { id: 'kimura',              type: 'submission', position: { x: 840, y: 310 }, data: { label: 'Kimura'           } },
  { id: 'americana',           type: 'submission', position: { x: 840, y: 410 }, data: { label: 'Americana'        } },
  { id: 'omoplata',            type: 'submission', position: { x: 840, y: 510 }, data: { label: 'Omoplata'         } },

  // ── Submissions col B (x=1010) ──
  { id: 'darce-choke',         type: 'submission', position: { x: 1010, y: 110 }, data: { label: "D'Arce Choke"    } },
  { id: 'rear-naked-choke',    type: 'submission', position: { x: 1010, y: 210 }, data: { label: 'Rear Naked Choke' } },
  { id: 'bow-arrow',           type: 'submission', position: { x: 1010, y: 310 }, data: { label: 'Bow & Arrow'     } },
  { id: 'ankle-lock',          type: 'submission', position: { x: 1010, y: 410 }, data: { label: 'Ankle Lock'      } },
  { id: 'heel-hook',           type: 'submission', position: { x: 1010, y: 510 }, data: { label: 'Heel Hook'       } },
];

// ─── Edge Definitions ─────────────────────────────────────────────────────────

type RawEdge = { id: string; source: string; target: string; label?: string };

const EDGE_DEFS: RawEdge[] = [
  // Standing
  { id: 'e1',  source: 'standing',           target: 'closed-guard-bottom', label: 'guard pull'        },
  { id: 'e2',  source: 'standing',           target: 'guillotine',          label: 'snap down'         },
  { id: 'e3',  source: 'standing',           target: 'side-control-top',    label: 'takedown'          },
  // Closed Guard (bottom)
  { id: 'e4',  source: 'closed-guard-bottom', target: 'triangle-choke'                                 },
  { id: 'e5',  source: 'closed-guard-bottom', target: 'armbar'                                         },
  { id: 'e6',  source: 'closed-guard-bottom', target: 'kimura'                                         },
  { id: 'e7',  source: 'closed-guard-bottom', target: 'omoplata'                                       },
  { id: 'e8',  source: 'closed-guard-bottom', target: 'mount-top',          label: 'hip bump sweep'    },
  { id: 'e9',  source: 'closed-guard-bottom', target: 'open-guard-bottom',  label: 'open guard'        },
  // Open Guard (bottom)
  { id: 'e10', source: 'open-guard-bottom',   target: 'back-mount-top',     label: 'back take'         },
  { id: 'e11', source: 'open-guard-bottom',   target: 'triangle-choke'                                 },
  { id: 'e12', source: 'open-guard-bottom',   target: 'omoplata'                                       },
  { id: 'e13', source: 'open-guard-bottom',   target: 'closed-guard-bottom'                            },
  // Half Guard (bottom)
  { id: 'e14', source: 'half-guard-bottom',   target: 'back-mount-top',     label: 'take back'         },
  { id: 'e15', source: 'half-guard-bottom',   target: 'kimura'                                         },
  { id: 'e16', source: 'half-guard-bottom',   target: 'closed-guard-bottom', label: 'recover guard'    },
  // Side Control (bottom)
  { id: 'e17', source: 'side-control-bottom', target: 'closed-guard-bottom', label: 'shrimp out'       },
  { id: 'e18', source: 'side-control-bottom', target: 'half-guard-bottom',  label: 'half guard'        },
  { id: 'e19', source: 'side-control-bottom', target: 'turtle',             label: 'roll to turtle'    },
  // Mount (bottom)
  { id: 'e20', source: 'mount-bottom',        target: 'closed-guard-bottom', label: 'elbow-knee escape' },
  { id: 'e21', source: 'mount-bottom',        target: 'half-guard-bottom',  label: 'half guard escape' },
  // Back (bottom)
  { id: 'e22', source: 'back-bottom',         target: 'side-control-bottom', label: 'escape to side'   },
  { id: 'e23', source: 'back-bottom',         target: 'turtle',             label: 'turtle'            },
  // Side Control (top)
  { id: 'e24', source: 'side-control-top',    target: 'mount-top',          label: 'advance'           },
  { id: 'e25', source: 'side-control-top',    target: 'back-mount-top',     label: 'take back'         },
  { id: 'e26', source: 'side-control-top',    target: 'americana'                                      },
  { id: 'e27', source: 'side-control-top',    target: 'kimura'                                         },
  { id: 'e28', source: 'side-control-top',    target: 'darce-choke'                                    },
  // Mount (top)
  { id: 'e29', source: 'mount-top',           target: 'armbar'                                         },
  { id: 'e30', source: 'mount-top',           target: 'americana'                                      },
  { id: 'e31', source: 'mount-top',           target: 'kimura'                                         },
  { id: 'e32', source: 'mount-top',           target: 'back-mount-top',     label: 'take back'         },
  // Back Mount (top)
  { id: 'e33', source: 'back-mount-top',      target: 'rear-naked-choke'                               },
  { id: 'e34', source: 'back-mount-top',      target: 'bow-arrow'                                      },
  { id: 'e35', source: 'back-mount-top',      target: 'armbar'                                         },
  // Turtle
  { id: 'e36', source: 'turtle',             target: 'back-mount-top',     label: 'take back'          },
  { id: 'e37', source: 'turtle',             target: 'darce-choke'                                     },
];

// ─── Build base edges ─────────────────────────────────────────────────────────

function buildBaseEdges(defs: RawEdge[]): Edge[] {
  return defs.map(({ id, source, target, label }) => {
    const isSubmission = SUBMISSION_IDS.has(target);
    const isAdvance = ADVANCE_EDGE_IDS.has(id);

    let stroke = '#374151';
    if (isSubmission) stroke = '#dc2626';
    else if (isAdvance) stroke = '#22c55e';

    const strokeWidth = isSubmission ? 2.5 : isAdvance ? 2 : 1.5;

    return {
      id,
      source,
      target,
      label: label ?? undefined,
      animated: !isSubmission,
      type: 'smoothstep' as const,
      style: { stroke, strokeWidth },
      labelStyle: { fill: '#6b7280', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#111', fillOpacity: 0.95 },
      labelBgPadding: [3, 5] as [number, number],
      labelBgBorderRadius: 3,
    };
  });
}

const BASE_EDGES = buildBaseEdges(EDGE_DEFS);

// ─── Inner Component ──────────────────────────────────────────────────────────

function GamePlanFlowInner() {
  const { fitView } = useReactFlow();
  const [nodes, , onNodesChange] = useNodesState(BASE_NODES);
  const [edges, , onEdgesChange] = useEdgesState(BASE_EDGES);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Set of node IDs connected to the selected node
  const connectedNodeIds = useMemo<Set<string>>(() => {
    if (!selectedNodeId) return new Set();
    const connected = new Set<string>();
    EDGE_DEFS.forEach((e) => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        connected.add(e.source);
        connected.add(e.target);
      }
    });
    return connected;
  }, [selectedNodeId]);

  // Derive display nodes with opacity/selection state injected into data
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      // Zone labels are never highlighted
      if (node.type === 'zoneLabel') return node;

      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      let opacity = 1;
      if (selectedNodeId) {
        opacity = isSelected ? 1 : isConnected ? 0.85 : 0.12;
      }
      return {
        ...node,
        data: { ...node.data, opacity, isSelected },
      };
    });
  }, [nodes, selectedNodeId, connectedNodeIds]);

  // Derive display edges with opacity/highlight injected into style
  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const isConnected =
        !selectedNodeId ||
        edge.source === selectedNodeId ||
        edge.target === selectedNodeId;

      const isSubmission = SUBMISSION_IDS.has(edge.target);
      const isAdvance = ADVANCE_EDGE_IDS.has(edge.id);

      let baseStroke = '#374151';
      if (isSubmission) baseStroke = '#dc2626';
      else if (isAdvance) baseStroke = '#22c55e';

      const stroke = selectedNodeId && isConnected ? '#ffffff' : baseStroke;
      const opacity = !selectedNodeId ? 1 : isConnected ? 1 : 0.04;
      const strokeWidth =
        isSubmission ? 2.5 : isAdvance ? 2 : selectedNodeId && isConnected ? 2 : 1.5;

      return {
        ...edge,
        style: {
          stroke,
          strokeWidth,
          opacity,
          transition: 'opacity 0.2s ease',
        },
        labelStyle: {
          fill: selectedNodeId && isConnected ? '#d1d5db' : '#6b7280',
          fontSize: 10,
          fontWeight: 600,
          opacity,
        },
      };
    });
  }, [edges, selectedNodeId]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.12, duration: 400 });
  }, [fitView]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === 'zoneLabel') return;
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.04}
        maxZoom={3}
        style={{ backgroundColor: '#080808' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1a1a1a"
          gap={20}
          size={1.5}
        />

        {/* Header info panel */}
        <Panel position="top-left">
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(12,12,12,0.85)',
              border: '1px solid #222',
              borderRadius: '8px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
              🗺️ BJJ GAME PLAN
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '3px' }}>
              {selectedNodeId ? 'tap again or tap canvas to clear' : 'tap a position to highlight'}
            </div>
          </div>
        </Panel>

        {/* Fit View button */}
        <Panel position="top-right">
          <button
            onClick={handleFitView}
            style={{
              backgroundColor: 'rgba(12,12,12,0.85)',
              color: '#9ca3af',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.05em',
              backdropFilter: 'blur(6px)',
            }}
          >
            ⊙ FIT
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function GamePlanFlow() {
  return (
    <ReactFlowProvider>
      <GamePlanFlowInner />
    </ReactFlowProvider>
  );
}
