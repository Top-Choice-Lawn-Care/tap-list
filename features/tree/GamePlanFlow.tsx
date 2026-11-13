'use client';

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ATTACKING_POSITIONS,
  DEFENDING_POSITIONS,
  POSITION_GRAPH,
  type PositionData,
} from './positions';

function DefaultView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          Where are you?
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Tap a position to see your options
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px', fontStyle: 'italic' }}>
          Settle the position. The finish comes after.
        </div>
      </div>

      <div style={{ marginBottom: '4px' }}>
        <div
          style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#6b7280',
            marginBottom: '10px', paddingLeft: '2px',
          }}
        >
          Defending 🛡️
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {DEFENDING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#13131a', border: '1.5px solid #2a2a3a',
                borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', fontFamily: 'inherit', transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent', minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea', textAlign: 'center', lineHeight: 1.3 }}>
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#1e1e2e', margin: '16px 0 12px' }} />

      <div>
        <div
          style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#6b7280',
            marginBottom: '10px', paddingLeft: '2px',
          }}
        >
          Attacking ⚔️
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {ATTACKING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#0d1f12', border: '1.5px solid #1a3a22',
                borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', fontFamily: 'inherit', transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent', minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea', textAlign: 'center', lineHeight: 1.3 }}>
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Subgraph Computation ─────────────────────────────────────────────────────

const COL0 = 0;
const COL1 = 320;
const COL2 = 640;

function computeSubgraph(
  positionId: string,
  positionGraph: Record<string, PositionData>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const center = positionGraph[positionId];
  if (!center) return { nodes, edges };

  const l1Options = center.options;
  const l1Count = l1Options.length;

  // Center node — vertically centered
  const centerY = Math.max((l1Count - 1) * 90, 0) / 2;

  nodes.push({
    id: 'center',
    type: 'default',
    position: { x: COL0, y: centerY },
    data: { label: `${center.emoji} ${center.label}`, type: 'center' },
    style: {
      width: 180,
      height: 64,
      borderRadius: '10px',
      background: '#1e1e3f',
      border: '3px solid #ffffff',
      boxShadow: '0 0 20px rgba(255,255,255,0.25)',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      padding: '0 10px',
    },
  });

  // Track L2 y-offsets per L1 node
  let l2GlobalY = 0;

  l1Options.forEach((opt, l1i) => {
    const l1Y = l1i * 90;
    const isSubmission = opt.type === 'submission';
    const isTakedown = opt.type === 'takedown';
    const isTransition = opt.type === 'transition';
    const l1Id = `l1-${l1i}`;

    if (isSubmission || isTakedown) {
      nodes.push({
        id: l1Id,
        type: 'default',
        position: { x: COL1, y: l1Y },
        data: {
          label: `${isTakedown ? '🟣' : '🔴'} ${opt.label.toUpperCase()}`,
          type: isTakedown ? 'takedown' : 'submission',
          label_raw: opt.label,
        },
        style: {
          width: 150,
          height: 40,
          borderRadius: '999px',
          background: isTakedown ? '#1a0a2d' : '#2d0a0a',
          border: `2px solid ${isTakedown ? '#9333ea' : '#dc2626'}`,
          color: isTakedown ? '#d8b4fe' : '#fca5a5',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          cursor: 'pointer',
          padding: '0 8px',
        },
      });

      edges.push({
        id: `e-center-${l1Id}`,
        source: 'center',
        target: l1Id,
        type: 'smoothstep',
        animated: false,
        label: opt.edgeLabel,
        style: { stroke: '#dc2626', strokeWidth: 2 },
        labelStyle: { fill: '#6b7280', fontSize: 10 },
        labelBgStyle: { fill: 'transparent' },
      });
    } else if (isTransition) {
      nodes.push({
        id: l1Id,
        type: 'default',
        position: { x: COL1, y: l1Y },
        data: {
          label: opt.label,
          type: 'transition',
          targetId: opt.targetId,
        },
        style: {
          width: 160,
          height: 52,
          borderRadius: '10px',
          background: '#0f2d1a',
          border: '2px solid #22c55e',
          color: '#86efac',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          padding: '0 8px',
        },
      });

      edges.push({
        id: `e-center-${l1Id}`,
        source: 'center',
        target: l1Id,
        type: 'smoothstep',
        animated: true,
        label: opt.edgeLabel,
        style: { stroke: '#4a7cc7', strokeWidth: 1.5, strokeDasharray: '5,5' },
        labelStyle: { fill: '#6b7280', fontSize: 10 },
        labelBgStyle: { fill: 'transparent' },
      });

      // L2: expand options of this transition node
      if (opt.targetId && positionGraph[opt.targetId]) {
        const l2Pos = positionGraph[opt.targetId];
        const l2Options = l2Pos.options;
        const l2Count = l2Options.length;

        // Group L2 nodes near their L1 parent
        const l2GroupCenter = l1Y;
        const l2StartY = l2GlobalY;

        // Space them 80px apart, centered around the parent if possible
        const l2TotalHeight = (l2Count - 1) * 80;
        const l2GroupTop = l2GroupCenter - l2TotalHeight / 2;

        // Make sure no overlap with previous L2 group
        const actualStart = Math.max(l2StartY, l2GroupTop);

        l2Options.forEach((l2opt, l2i) => {
          const l2Y = actualStart + l2i * 80;
          const l2Id = `l2-${l1i}-${l2i}`;
          const l2IsSubmission = l2opt.type === 'submission';
          const l2IsTakedown = l2opt.type === 'takedown';
          const l2IsTransition = l2opt.type === 'transition';

          if (l2IsSubmission || l2IsTakedown) {
            nodes.push({
              id: l2Id,
              type: 'default',
              position: { x: COL2, y: l2Y },
              data: {
                label: `${l2IsTakedown ? '🟣' : '🔴'} ${l2opt.label.toUpperCase()}`,
                type: l2IsTakedown ? 'takedown' : 'submission',
                label_raw: l2opt.label,
              },
              style: {
                width: 150,
                height: 40,
                borderRadius: '999px',
                background: l2IsTakedown ? '#1a0a2d' : '#2d0a0a',
                border: `2px solid ${l2IsTakedown ? '#9333ea' : '#dc2626'}`,
                color: l2IsTakedown ? '#d8b4fe' : '#fca5a5',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center' as const,
                cursor: 'pointer',
                padding: '0 8px',
              },
            });

            edges.push({
              id: `e-${l1Id}-${l2Id}`,
              source: l1Id,
              target: l2Id,
              type: 'smoothstep',
              animated: false,
              label: l2opt.edgeLabel,
              style: { stroke: '#dc2626', strokeWidth: 1.5 },
              labelStyle: { fill: '#6b7280', fontSize: 10 },
              labelBgStyle: { fill: 'transparent' },
            });
          } else if (l2IsTransition) {
            nodes.push({
              id: l2Id,
              type: 'default',
              position: { x: COL2, y: l2Y },
              data: {
                label: l2opt.label,
                type: 'transition',
                targetId: l2opt.targetId,
              },
              style: {
                width: 150,
                height: 48,
                borderRadius: '10px',
                background: '#0a1a10',
                border: '1px solid #374151',
                color: '#9ca3af',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center' as const,
                padding: '0 8px',
              },
            });

            edges.push({
              id: `e-${l1Id}-${l2Id}`,
              source: l1Id,
              target: l2Id,
              type: 'smoothstep',
              animated: true,
              label: l2opt.edgeLabel,
              style: { stroke: '#374151', strokeWidth: 1, strokeDasharray: '5,5' },
              labelStyle: { fill: '#6b7280', fontSize: 10 },
              labelBgStyle: { fill: 'transparent' },
            });
          }
        });

        l2GlobalY = actualStart + l2Count * 80 + 20;
      }
    }
  });

  return { nodes, edges };
}

// ─── SubgraphView (inner, uses useReactFlow) ──────────────────────────────────

function SubgraphView({
  positionId,
  positionGraph,
  setNavStack,
  openVideo,
}: {
  positionId: string;
  positionGraph: Record<string, PositionData>;
  navStack: string[];
  setNavStack: Dispatch<SetStateAction<string[]>>;
  openVideo?: (query: string) => void;
}) {
  const { fitView } = useReactFlow();
  const { nodes, edges } = computeSubgraph(positionId, positionGraph);
  // Initialize to current positionId so the first render doesn't override onInit
  const prevPositionId = useRef<string | null>(positionId);

  // Smart zoom helper — fits to center node + L1 direct children only
  // L2+ nodes trail off the edges, hinting there's more to explore
  const fitToL1 = useCallback(() => {
    const l1Nodes = nodes.filter(n => n.id === 'center' || n.id.startsWith('l1-'));
    fitView({
      nodes: l1Nodes,
      padding: 0.18,
      duration: 350,
      minZoom: 0.5,
      maxZoom: 1.4,
    });
  }, [nodes, fitView]);

  // On position navigation (subsequent changes only — first render handled by onInit)
  useEffect(() => {
    if (prevPositionId.current !== positionId) {
      prevPositionId.current = positionId;
      const t = setTimeout(fitToL1, 80);
      return () => clearTimeout(t);
    }
  }, [positionId, fitToL1]);

  // onInit — runs once on mount, sets the initial smart zoom
  const onInit = useCallback((rfInstance: ReactFlowInstance) => {
    const l1Nodes = rfInstance.getNodes().filter(
      n => n.id === 'center' || n.id.startsWith('l1-')
    );
    setTimeout(() => {
      rfInstance.fitView({
        nodes: l1Nodes,
        padding: 0.18,
        duration: 350,
        minZoom: 0.5,
        maxZoom: 1.4,
      });
    }, 60);
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const d = node.data as { type: string; targetId?: string; label?: string; label_raw?: string };
      if (d.type === 'transition' && d.targetId) {
        setNavStack((prev) => [...prev, d.targetId!]);
      } else if (d.type === 'submission' || d.type === 'takedown') {
        const raw = (d.label_raw as string) || (d.label as string) || '';
        if (openVideo) {
          openVideo(raw);
        } else {
          window.open(
            `https://www.youtube.com/results?search_query=bjj+${encodeURIComponent(raw)}+tutorial`,
            '_blank'
          );
        }
      }
    },
    [setNavStack, openVideo]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onInit={onInit}
      fitView={false}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={0.3}
      maxZoom={2}
      style={{ background: '#09090d' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1e1e2e" gap={24} size={1} />
    </ReactFlow>
  );
}

export default function GamePlanFlow({ openVideo }: { openVideo?: (query: string) => void }) {
  const [navStack, setNavStack] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setNavStack([id]);
  };

  const handleBack = () => {
    setNavStack((stack) => stack.slice(0, -1));
  };

  const currentPositionId = navStack[navStack.length - 1];
  const currentPosition = currentPositionId ? POSITION_GRAPH[currentPositionId] : null;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#09090d', display: 'flex', flexDirection: 'column' }}>
      {navStack.length === 0 ? (
        <DefaultView onSelect={handleSelect} />
      ) : (
        <>
          <div
            style={{
              flexShrink: 0,
              backgroundColor: '#09090d',
              borderBottom: '1px solid #1a1a26',
              padding: '10px 16px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#e8e8ea',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              ← Back
            </button>
            {currentPosition && (
              <div style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#e8e8ea',
                letterSpacing: '-0.3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {currentPosition.emoji} {currentPosition.label}
              </div>
            )}
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <ReactFlowProvider>
              <SubgraphView
                positionId={currentPositionId}
                positionGraph={POSITION_GRAPH}
                navStack={navStack}
                setNavStack={setNavStack}
                openVideo={openVideo}
              />
            </ReactFlowProvider>
          </div>
        </>
      )}
    </div>
  );
}
