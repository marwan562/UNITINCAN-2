import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Send,
  Paperclip,
  Compass,
  X,
  Bot,
  User,
  CheckCircle,
} from 'lucide-react';
import { type Node, type Edge } from '@xyflow/react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AICopilotProps {
  onApplyFlow: (nodes: Node[], edges: Edge[], clearFirst: boolean) => void;
  existingNodes: Node[];
}

export default function AICopilot({ onApplyFlow, existingNodes }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your UNITINCAN Flow Copilot. Tell me what automation you want to build (e.g., 'If temperature is above 35 then turn on cooler' or 'add a humidity sensor'), and I'll generate it instantly!",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Voice Input Simulation
  const handleMicToggle = () => {
    if (!micActive) {
      setMicActive(true);
      setInputVal("Listening...");
      setTimeout(() => {
        setInputVal("If temperature is greater than 30 then turn on fan");
        setMicActive(false);
      }, 2000);
    } else {
      setMicActive(false);
      setInputVal("");
    }
  };

  // Prompt Templates list
  const promptTemplates = [
    { label: "AC Controller", text: "Create temperature automation: if temperature is above 32 then turn on ac" },
    { label: "Moisture Alert", text: "Wipe canvas and create condition if humidity is less than 30 then turn on sprinkler" },
    { label: "Light Automation", text: "If lux sensor is below 10 then turn on office light" },
    { label: "Clear board", text: "Clear automation workspace" },
  ];

  const handleSelectTemplate = (text: string) => {
    setInputVal(text);
    setPromptsOpen(false);
    setIsOpen(true);
  };

  // The local natural language processing (NLP) parser
  const parsePrompt = (prompt: string) => {
    const text = prompt.toLowerCase();
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let clearFirst = false;

    // A. Check for clear workspace command
    if (
      text.includes('clear') ||
      text.includes('reset') ||
      text.includes('wipe') ||
      text.includes('delete all')
    ) {
      clearFirst = true;
      if (text.trim() === 'clear' || text.trim() === 'clear automation' || text.trim() === 'clear workspace') {
        return { nodes: [], edges: [], clearFirst: true, explanation: "I've cleared the automation workspace for you." };
      }
    }

    // B. Detect Sensor keywords
    let hasSensor = false;
    let sensorTopic = 'tmp';
    let sensorValue: any = 80;

    if (text.includes('temp') || text.includes('temperature') || text.includes('heat') || text.includes('hot')) {
      hasSensor = true;
      sensorTopic = 'temperature';
      sensorValue = 85;
    } else if (text.includes('humidity') || text.includes('moist') || text.includes('water level')) {
      hasSensor = true;
      sensorTopic = 'humidity';
      sensorValue = 45;
    } else if (text.includes('lux') || text.includes('light sensor') || text.includes('dark')) {
      hasSensor = true;
      sensorTopic = 'lux_sensor';
      sensorValue = 8;
    } else if (text.includes('sensor')) {
      hasSensor = true;
      sensorTopic = 'generic_sensor';
      sensorValue = 50;
    }

    // C. Detect Condition operators and numbers
    let hasCondition = false;
    let operator = '>=';
    let threshold = 30;

    // Check operator
    if (text.includes('above') || text.includes('greater') || text.includes('more') || text.includes('>')) {
      hasCondition = true;
      operator = '>=';
    } else if (text.includes('below') || text.includes('less') || text.includes('under') || text.includes('<')) {
      hasCondition = true;
      operator = '<=';
    } else if (text.includes('equal') || text.includes('is') || text.includes('==') || text.includes('=')) {
      hasCondition = true;
      operator = '==';
    }

    // Extract numbers in text
    const numbers = text.match(/\b\d+\b/g);
    if (numbers && numbers.length > 0) {
      hasCondition = true;
      threshold = Number(numbers[0]);
    }

    // D. Detect Actuator keywords
    let hasActuator = false;
    let actuatorTopic = 'sprinkler-11';

    if (text.includes('fan') || text.includes('cooler') || text.includes('ventilator')) {
      hasActuator = true;
      actuatorTopic = 'cooling_fan';
    } else if (text.includes('ac') || text.includes('air conditioner')) {
      hasActuator = true;
      actuatorTopic = 'ac_unit';
    } else if (text.includes('sprinkler') || text.includes('pump') || text.includes('irrigation')) {
      hasActuator = true;
      actuatorTopic = 'water_pump';
    } else if (text.includes('light') || text.includes('lamp') || text.includes('bulb')) {
      hasActuator = true;
      actuatorTopic = 'office_light';
    } else if (text.includes('actuator') || text.includes('switch') || text.includes('relay')) {
      hasActuator = true;
      actuatorTopic = 'power_relay';
    }

    const timestamp = Date.now();

    // E. Build the Flow Graph nodes/edges
    if (hasSensor && hasCondition && hasActuator) {
      // Complete flow chain
      nodes = [
        {
          id: `sensor_${timestamp}`,
          type: 'sensor',
          position: { x: 100, y: 40 },
          data: { topic: sensorTopic, value: sensorValue },
        },
        {
          id: `condition_${timestamp}`,
          type: 'condition',
          position: { x: 100, y: 210 },
          data: { operator, threshold },
        },
        {
          id: `actuator_${timestamp}`,
          type: 'actuator',
          position: { x: 100, y: 470 },
          data: { topic: actuatorTopic, status: 'OFF' },
        },
      ];

      edges = [
        {
          id: `e_sc_${timestamp}`,
          source: `sensor_${timestamp}`,
          target: `condition_${timestamp}`,
          sourceHandle: 'a',
          targetHandle: 'input',
          animated: true,
          style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
        },
        {
          id: `e_ca_${timestamp}`,
          source: `condition_${timestamp}`,
          target: `actuator_${timestamp}`,
          sourceHandle: 'true',
          targetHandle: 'input',
          animated: true,
          style: { strokeDasharray: '5,5', stroke: '#94a3b8', strokeWidth: 2 },
        },
      ];

      const explain = `I've created a complete automation chain: A **Sensor Node** (topic: \`${sensorTopic}\`) connected to a **Condition Node** (\`if value ${operator} ${threshold}\`) leading to your **Actuator Node** (topic: \`${actuatorTopic}\`).`;
      return { nodes, edges, clearFirst, explanation: explain };
    }

    // F. Standalone nodes
    if (hasSensor && !hasCondition && !hasActuator) {
      nodes = [
        {
          id: `sensor_${timestamp}`,
          type: 'sensor',
          position: { x: 150, y: 150 },
          data: { topic: sensorTopic, value: sensorValue },
        },
      ];
      return { nodes, edges, clearFirst, explanation: `I've spawned a new **Sensor Node** with topic \`${sensorTopic}\` and preset reading \`${sensorValue}\`.` };
    }

    if (hasActuator && !hasSensor && !hasCondition) {
      nodes = [
        {
          id: `actuator_${timestamp}`,
          type: 'actuator',
          position: { x: 150, y: 150 },
          data: { topic: actuatorTopic, status: 'OFF' },
        },
      ];
      return { nodes, edges, clearFirst, explanation: `I've spawned a new **Actuator Node** with topic \`${actuatorTopic}\`.` };
    }

    if (hasCondition && !hasSensor && !hasActuator) {
      nodes = [
        {
          id: `condition_${timestamp}`,
          type: 'condition',
          position: { x: 150, y: 150 },
          data: { operator, threshold },
        },
      ];
      return { nodes, edges, clearFirst, explanation: `I've spawned a **Condition Node** checking \`if value ${operator} ${threshold}\`.` };
    }

    // fallback
    return {
      nodes: [],
      edges: [],
      clearFirst: false,
      explanation: "I couldn't identify the exact IoT devices you want to build. Try typing: *'If temperature is above 30 degrees then turn on the fan'* or click the **Prompts** templates to see examples!",
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || inputVal === 'Listening...') return;

    const userText = inputVal;
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    setIsOpen(true);

    // Simulate AI response typing delay
    setTimeout(() => {
      const result = parsePrompt(userText);
      
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: result.explanation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      // Apply the generated automation nodes and connections on the canvas!
      if (result.nodes.length > 0 || result.clearFirst) {
        onApplyFlow(result.nodes, result.edges, result.clearFirst);
      }
    }, 1500);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-[550px] flex flex-col items-center">
      {/* Chat Messages History popover panel */}
      {isOpen && (
        <div className="w-full bg-[#0b0f19]/95 border border-slate-800 shadow-2xl rounded-2xl p-4 mb-4 flex flex-col h-[280px] backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-white">
              <Bot size={16} className="text-violet-400" />
              <span className="font-bold text-xs">Copilot Builder Log</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                    msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-violet-400 border border-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 self-start max-w-[85%]">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-slate-800 text-violet-400 border border-slate-700">
                  <Bot size={12} />
                </div>
                <div className="rounded-xl px-3 py-2 text-xs bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Prompts list selection menu */}
      {promptsOpen && (
        <div className="w-full bg-[#0b0f19]/95 border border-slate-800 shadow-2xl rounded-2xl p-3 mb-4 flex flex-col gap-1.5 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1 pb-1 flex justify-between items-center">
            <span>Flow Presets Templates</span>
            <button onClick={() => setPromptsOpen(false)} className="hover:text-white"><X size={12} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {promptTemplates.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTemplate(tpl.text)}
                className="p-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 hover:text-white rounded-xl text-xs flex flex-col gap-0.5 transition-all cursor-pointer group"
              >
                <span className="font-bold text-violet-400 group-hover:text-violet-300 flex items-center gap-1">
                  <Sparkles size={10} />
                  {tpl.label}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full">{tpl.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Capsule glowing input bar widget */}
      <div className="relative w-full p-[1px] rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all">
        <form
          onSubmit={handleSend}
          className="w-full bg-[#0d121f]/95 backdrop-blur-md rounded-[15px] p-2 flex flex-col gap-2 border border-white/5"
        >
          {/* Main typing text input */}
          <div className="px-2 pt-1 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Copilot to build your automation flow..."
              className="flex-1 bg-transparent border-none text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-0 leading-normal"
              disabled={isTyping || micActive}
            />
          </div>

          {/* Bottom actions strip */}
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 px-1">
            {/* Prompts Badge */}
            <button
              type="button"
              onClick={() => setPromptsOpen(!promptsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold tracking-wide transition-colors cursor-pointer"
            >
              <Compass size={12} className="text-violet-400" />
              Prompts
            </button>

            <div className="flex items-center gap-3">
              {/* Attachment Icon */}
              <button
                type="button"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Add context file"
              >
                <Paperclip size={14} />
              </button>

              {/* Mic / Voice toggle badge */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
                  micActive 
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse' 
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Mic size={12} className={micActive ? 'text-rose-400' : 'text-slate-400'} />
                <span>Mic</span>
                <span className={`w-6 h-3 rounded-full relative p-0.5 transition-colors duration-200 flex items-center ${micActive ? 'bg-rose-500' : 'bg-slate-600'}`}>
                  <span className={`block w-2 h-2 rounded-full bg-white shadow transition-all transform duration-200 ${micActive ? 'translate-x-3' : 'translate-x-0'}`} />
                </span>
              </button>

              {/* Submit Send circle button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping || micActive}
                className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer shadow shadow-indigo-500/20"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
