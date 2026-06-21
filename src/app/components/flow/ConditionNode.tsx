import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export interface ConditionNodeData {
  sensorValue?: number | string;
  operator: string;
  threshold: number;
  isMet?: boolean;
  onChange?: (id: string, field: string, value: any) => void;
}

export default function ConditionNode({ id, data }: { id: string; data: ConditionNodeData }) {
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange(id, 'operator', e.target.value);
    }
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (data.onChange) {
      data.onChange(id, 'threshold', isNaN(val) ? 0 : val);
    }
  };

  const currentVal = data.sensorValue !== undefined ? data.sensorValue : 'Idle';
  const showIsMet = data.isMet === true;
  const showIsNotMet = data.isMet === false;

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-lg w-56 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-purple-400">
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: '#9333ea', width: 10, height: 10, border: '2px solid white' }}
      />

      {/* Node Header */}
      <div className="bg-purple-600 px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <GitBranch size={16} />
          <span>Condition</span>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 flex flex-col gap-2 bg-gray-50/50 text-xs">
        {/* Dynamic Condition Equation Setup */}
        <div className="flex items-center gap-1 mb-1 justify-between">
          <span className="text-gray-400 font-semibold">if</span>
          <span className="font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold max-w-[60px] truncate">
            {currentVal}
          </span>
          <select
            value={data.operator}
            onChange={handleOperatorChange}
            className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
            <option value="==">==</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
          </select>
          <input
            type="number"
            value={data.threshold}
            onChange={handleThresholdChange}
            className="w-12 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-center font-semibold text-xs focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Condition Met Path (True) */}
        <div className={`py-1.5 px-3 rounded-lg flex items-center justify-center font-semibold transition-all text-center ${
          showIsMet 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
            : 'bg-white border border-gray-100 text-gray-400 opacity-60'
        }`}>
          Condition Met
        </div>

        {/* Condition Not Met Path (False) */}
        <div className={`py-1.5 px-3 rounded-lg flex flex-col gap-0.5 items-center justify-center font-semibold transition-all border text-center ${
          showIsNotMet 
            ? 'bg-rose-50 border-rose-200 text-rose-700' 
            : 'bg-white border-transparent text-gray-400 opacity-60'
        }`}>
          <span className="text-[9px] opacity-75 font-mono">{currentVal} {data.operator} {data.threshold} (False)</span>
          <span className="text-xs">Condition Not Met</span>
        </div>
      </div>

      {/* Handles at the Bottom */}
      <div className="flex justify-between px-6 pb-2.5 bg-gray-50/50 relative h-1">
        {/* Left handle for TRUE (Green) */}
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ background: '#10b981', left: '0%', width: 10, height: 10, border: '2px solid white' }}
          />
        </div>

        {/* Right handle for FALSE (Red) */}
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ background: '#f43f5e', left: '100%', width: 10, height: 10, border: '2px solid white' }}
          />
        </div>
      </div>
    </div>
  );
}
