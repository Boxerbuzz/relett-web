
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from '@xyflow/react';

interface DataFlowEdgeData {
  label?: string;
  type?: 'data' | 'event' | 'trigger';
  animated?: boolean;
}

export function DataFlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  markerEnd,
}: EdgeProps<DataFlowEdgeData>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const getEdgeStyle = () => {
    const baseStyle: React.CSSProperties = {
      strokeWidth: 2,
      ...style,
    };

    switch (data?.type) {
      case 'event':
        return {
          ...baseStyle,
          stroke: '#f59e0b',
          strokeDasharray: '5,5',
        };
      case 'trigger':
        return {
          ...baseStyle,
          stroke: '#ef4444',
          strokeWidth: 3,
        };
      default:
        return {
          ...baseStyle,
          stroke: '#3b82f6',
        };
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={getEdgeStyle()}
        className={data?.animated ? 'animate-pulse' : ''}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="nodrag nopan pointer-events-auto"
          >
            <div className="bg-white px-2 py-1 rounded shadow-sm border text-xs font-medium">
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
