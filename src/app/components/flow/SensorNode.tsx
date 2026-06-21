import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Thermometer, Activity } from 'lucide-react';

export interface SensorNodeData {
  label?: string;
  topic: string;
  value: number | string;
  onChange?: (id: string, field: string, value: any) => void;
}

export default function SensorNode({ id, data }: { id: string; data: SensorNodeData }) {
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange(id, 'topic', e.target.value);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val === '' ? '' : Number(val);
    if (data.onChange) {
      data.onChange(id, 'value', isNaN(num as any) ? val : num);
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-lg w-52 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-blue-400">
      {/* Node Header */}
      <div className="bg-blue-600 px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <Thermometer size={16} />
          <span>sensor Node</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping" />
          <Activity size={14} className="opacity-80" />
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 flex flex-col gap-2.5 text-xs text-gray-700 bg-gray-50/50">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-400">Topic</span>
          <input
            type="text"
            value={data.topic}
            onChange={handleTopicChange}
            className="w-28 px-2 py-1 bg-white border border-gray-200 rounded text-gray-800 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-400">Value</span>
          <input
            type="number"
            value={data.value}
            onChange={handleValueChange}
            className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-gray-800 text-xs font-semibold text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ background: '#2563eb', width: 10, height: 10, border: '2px solid white' }}
      />
    </div>
  );
}
