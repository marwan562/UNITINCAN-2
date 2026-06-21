import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Power, Activity } from 'lucide-react';

export interface ActuatorNodeData {
  topic: string;
  status: 'ON' | 'OFF';
  onChange?: (id: string, field: string, value: any) => void;
}

export default function ActuatorNode({ id, data }: { id: string; data: ActuatorNodeData }) {
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange(id, 'topic', e.target.value);
    }
  };

  const isOn = data.status === 'ON';

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-lg w-52 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-orange-400">
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: '#f97316', width: 10, height: 10, border: '2px solid white' }}
      />

      {/* Node Header */}
      <div className="bg-orange-500 px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <Power size={16} className={isOn ? "animate-pulse" : ""} />
          <span>actuator Node</span>
        </div>
        <Activity size={14} className="opacity-80" />
      </div>

      {/* Node Body */}
      <div className="p-3 flex flex-col gap-2.5 text-xs text-gray-700 bg-gray-50/50">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-400">Topic</span>
          <input
            type="text"
            value={data.topic}
            onChange={handleTopicChange}
            className="w-28 px-2 py-1 bg-white border border-gray-200 rounded text-gray-800 text-xs font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-400">Status</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'}`} />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isOn 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {data.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
