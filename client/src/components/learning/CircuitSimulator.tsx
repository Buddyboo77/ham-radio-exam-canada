import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, 
  Zap, 
  ToggleLeft, 
  Lightbulb, 
  Wand2, 
  AlertTriangle, 
  Info,
  Plus,
  X,
  Maximize2,
  Minus
} from 'lucide-react';

// Circuit component types
type ComponentType = 'battery' | 'resistor' | 'capacitor' | 'inductor' | 'led' | 'switch';

// Circuit component interface
interface CircuitComponent {
  id: string;
  type: ComponentType;
  value: number;
  unit: string;
  x: number;
  y: number;
  rotation: number;
  connections: string[];
  state?: 'on' | 'off';
  label?: string;
}

// Predefined circuit templates
const CIRCUIT_TEMPLATES = [
  {
    name: 'Basic LED Circuit',
    description: 'Simple circuit with a battery, resistor, and LED',
    components: [
      {
        id: 'bat1',
        type: 'battery',
        value: 9,
        unit: 'V',
        x: 100,
        y: 200,
        rotation: 0,
        connections: ['res1'],
        label: 'Battery'
      },
      {
        id: 'res1',
        type: 'resistor',
        value: 330,
        unit: 'Ω',
        x: 250,
        y: 200,
        rotation: 0,
        connections: ['bat1', 'led1'],
        label: 'Current Limiter'
      },
      {
        id: 'led1',
        type: 'led',
        value: 20,
        unit: 'mA',
        x: 400,
        y: 200,
        rotation: 0,
        connections: ['res1', 'bat1'],
        state: 'off',
        label: 'LED'
      },
      {
        id: 'sw1',
        type: 'switch',
        value: 0,
        unit: '',
        x: 150,
        y: 120,
        rotation: 90,
        connections: ['bat1'],
        state: 'off',
        label: 'Power Switch'
      }
    ]
  },
  {
    name: 'RC Time Constant',
    description: 'Resistor-Capacitor circuit demonstrating charging/discharging',
    components: [
      {
        id: 'bat1',
        type: 'battery',
        value: 12,
        unit: 'V',
        x: 100,
        y: 200,
        rotation: 0,
        connections: ['res1', 'sw1'],
        label: 'Power Source'
      },
      {
        id: 'res1',
        type: 'resistor',
        value: 10000,
        unit: 'Ω',
        x: 250,
        y: 200,
        rotation: 0,
        connections: ['bat1', 'cap1'],
        label: 'Resistor'
      },
      {
        id: 'cap1',
        type: 'capacitor',
        value: 100,
        unit: 'μF',
        x: 400,
        y: 200,
        rotation: 0,
        connections: ['res1', 'bat1'],
        label: 'Capacitor'
      },
      {
        id: 'sw1',
        type: 'switch',
        value: 0,
        unit: '',
        x: 150,
        y: 120,
        rotation: 90,
        connections: ['bat1'],
        state: 'off',
        label: 'Charge/Discharge'
      }
    ]
  },
  {
    name: 'LC Resonant Circuit',
    description: 'Inductor-Capacitor circuit demonstrating resonance',
    components: [
      {
        id: 'bat1',
        type: 'battery',
        value: 9,
        unit: 'V',
        x: 100,
        y: 200,
        rotation: 0,
        connections: ['sw1'],
        label: 'Power Source'
      },
      {
        id: 'sw1',
        type: 'switch',
        value: 0,
        unit: '',
        x: 200,
        y: 200,
        rotation: 0,
        connections: ['bat1', 'ind1'],
        state: 'off',
        label: 'Power Switch'
      },
      {
        id: 'ind1',
        type: 'inductor',
        value: 10,
        unit: 'mH',
        x: 300,
        y: 200,
        rotation: 0,
        connections: ['sw1', 'cap1'],
        label: 'Inductor'
      },
      {
        id: 'cap1',
        type: 'capacitor',
        value: 100,
        unit: 'nF',
        x: 400,
        y: 200,
        rotation: 0,
        connections: ['ind1', 'bat1'],
        label: 'Capacitor'
      }
    ]
  }
];

interface CircuitSimulatorProps {
  initialTemplate?: string;
  onCircuitChange?: (isCorrect: boolean) => void;
}

export default function CircuitSimulator({ initialTemplate, onCircuitChange }: CircuitSimulatorProps) {
  // State
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [circuitPowered, setCircuitPowered] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    voltage: number;
    current: number;
    power: number;
    message: string;
    warnings: string[];
    isValid: boolean;
  }>({
    voltage: 0,
    current: 0,
    power: 0,
    message: 'Circuit not powered',
    warnings: [],
    isValid: false
  });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [showValues, setShowValues] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Load initial template if provided
  useEffect(() => {
    if (initialTemplate) {
      const template = CIRCUIT_TEMPLATES.find(t => t.name === initialTemplate);
      if (template) {
        setComponents(template.components);
      }
    }
  }, [initialTemplate]);
  
  // Handle component selection
  const handleSelectComponent = (id: string) => {
    setSelectedComponent(id);
  };
  
  // Handle component deletion
  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };
  
  // Handle component dragging
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDragging(true);
    setSelectedComponent(id);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle component movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && selectedComponent) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setComponents(prev => prev.map(c => {
        if (c.id === selectedComponent) {
          return { ...c, x: c.x + dx, y: c.y + dy };
        }
        return c;
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle component drop
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  // Handle component value change
  const handleValueChange = (id: string, value: number) => {
    setComponents(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, value };
      }
      return c;
    }));
  };
  
  // Handle switch toggle
  const handleToggleSwitch = (id: string) => {
    setComponents(prev => prev.map(c => {
      if (c.id === id && c.type === 'switch') {
        return { 
          ...c, 
          state: c.state === 'on' ? 'off' : 'on'
        };
      }
      return c;
    }));
  };
  
  // Handle circuit power toggle
  const handlePowerToggle = () => {
    setCircuitPowered(!circuitPowered);
  };
  
  // Reset circuit to initial template
  const resetCircuit = () => {
    if (initialTemplate) {
      const template = CIRCUIT_TEMPLATES.find(t => t.name === initialTemplate);
      if (template) {
        setComponents(template.components);
      }
    } else {
      setComponents([]);
    }
    setCircuitPowered(false);
    setSelectedComponent(null);
  };
  
  // Load a predefined template
  const loadTemplate = (templateName: string) => {
    const template = CIRCUIT_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setComponents(template.components);
      setCircuitPowered(false);
      setSelectedComponent(null);
    }
  };
  
  // Add a new component
  const addComponent = (type: ComponentType) => {
    const id = `${type}${Math.floor(Math.random() * 1000)}`;
    
    let value = 0;
    let unit = '';
    
    switch (type) {
      case 'battery':
        value = 9;
        unit = 'V';
        break;
      case 'resistor':
        value = 1000;
        unit = 'Ω';
        break;
      case 'capacitor':
        value = 100;
        unit = 'μF';
        break;
      case 'inductor':
        value = 10;
        unit = 'mH';
        break;
      case 'led':
        value = 20;
        unit = 'mA';
        break;
      case 'switch':
        value = 0;
        unit = '';
        break;
    }
    
    const newComponent: CircuitComponent = {
      id,
      type,
      value,
      unit,
      x: 200,
      y: 200,
      rotation: 0,
      connections: [],
      state: type === 'switch' ? 'off' : undefined,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    };
    
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(id);
  };
  
  // Simulate the circuit
  useEffect(() => {
    if (circuitPowered) {
      // This is a simplified simulation
      // In a real circuit simulator, we would solve Kirchhoff's laws
      
      // Check for errors/issues
      const warnings: string[] = [];
      let isValid = true;
      
      // Check if we have a battery
      const batteries = components.filter(c => c.type === 'battery');
      if (batteries.length === 0) {
        warnings.push('No power source in the circuit');
        isValid = false;
      }
      
      // Check for switches that might break the circuit
      const switches = components.filter(c => c.type === 'switch');
      const openSwitches = switches.filter(s => s.state === 'off');
      if (openSwitches.length > 0) {
        warnings.push(`${openSwitches.length} open switch${openSwitches.length > 1 ? 'es' : ''} breaking the circuit`);
        isValid = false;
      }
      
      // Check for components without connections
      const disconnected = components.filter(c => c.connections.length === 0);
      if (disconnected.length > 0) {
        warnings.push(`${disconnected.length} disconnected component${disconnected.length > 1 ? 's' : ''}`);
        isValid = false;
      }
      
      // Simulate current flow
      let totalVoltage = 0;
      let totalResistance = 0.001; // Avoid division by zero
      
      // Sum up all battery voltages
      batteries.forEach(battery => {
        totalVoltage += battery.value;
      });
      
      // Sum up all resistances (simplified series circuit)
      components.filter(c => c.type === 'resistor').forEach(resistor => {
        totalResistance += resistor.value;
      });
      
      // Calculate current (I = V/R)
      const current = totalVoltage / totalResistance;
      
      // Calculate power (P = I*V)
      const power = current * totalVoltage;
      
      // Check for potential issues
      const leds = components.filter(c => c.type === 'led');
      
      // Update LEDs based on current
      setComponents(prev => prev.map(c => {
        if (c.type === 'led') {
          // LED is on if circuit is valid and current is sufficient
          return { 
            ...c, 
            state: isValid && current > 0.001 ? 'on' : 'off'
          };
        }
        return c;
      }));
      
      // LED current checks
      leds.forEach(led => {
        if (current > led.value * 0.001 * 1.5) {
          warnings.push(`LED current too high (${(current * 1000).toFixed(1)} mA > ${led.value} mA)`);
        }
      });
      
      let message = 'Circuit powered';
      if (!isValid) {
        message = 'Circuit incomplete or disconnected';
      } else if (warnings.length > 0) {
        message = 'Circuit functioning with warnings';
      } else {
        message = 'Circuit functioning correctly';
      }
      
      // Update simulation result
      setSimulationResult({
        voltage: totalVoltage,
        current: current * 1000, // Convert to mA for display
        power: power * 1000, // Convert to mW for display
        message,
        warnings,
        isValid
      });
      
      // Notify parent component if needed
      if (onCircuitChange) {
        onCircuitChange(isValid && warnings.length === 0);
      }
    } else {
      // Reset simulation when power is off
      setSimulationResult({
        voltage: 0,
        current: 0,
        power: 0,
        message: 'Circuit not powered',
        warnings: [],
        isValid: false
      });
      
      // Reset LEDs to off state
      setComponents(prev => prev.map(c => {
        if (c.type === 'led') {
          return { ...c, state: 'off' };
        }
        return c;
      }));
    }
  }, [circuitPowered, components, onCircuitChange]);
  
  // Render a component based on its type
  const renderComponent = (component: CircuitComponent) => {
    const isSelected = selectedComponent === component.id;
    const componentStyle = {
      transform: `rotate(${component.rotation}deg) scale(${zoom})`,
      cursor: 'pointer',
      border: isSelected ? '2px solid #3b82f6' : 'none',
      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      padding: '8px',
      borderRadius: '4px',
      position: 'absolute' as 'absolute',
      left: `${component.x}px`,
      top: `${component.y}px`,
      zIndex: isSelected ? 10 : 1,
      userSelect: 'none' as 'none'
    };
    
    const renderLabel = () => {
      if (!showLabels || !component.label) return null;
      
      return (
        <div className="text-xs text-gray-300 mt-1 text-center">
          {component.label}
        </div>
      );
    };
    
    const renderValue = () => {
      if (!showValues || component.type === 'switch') return null;
      
      return (
        <div className="text-xs text-blue-300 mt-1 text-center font-mono">
          {component.value}{component.unit}
        </div>
      );
    };
    
    switch (component.type) {
      case 'battery':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-yellow-900 border border-yellow-700 rounded-md p-2 flex flex-col items-center">
              <Battery className="h-8 w-8 text-yellow-400" />
              {renderValue()}
            </div>
            {renderLabel()}
          </div>
        );
        
      case 'resistor':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex flex-col items-center">
              <div className="h-8 w-16 flex items-center justify-center relative">
                <div className="absolute h-2 bg-gray-500 w-full"></div>
                <div className="absolute h-6 w-10 bg-amber-900 rounded-sm flex items-center justify-center">
                  <div className="text-[10px] font-mono text-amber-400">R</div>
                </div>
              </div>
              {renderValue()}
            </div>
            {renderLabel()}
          </div>
        );
        
      case 'capacitor':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex flex-col items-center">
              <div className="h-8 w-12 flex items-center justify-center relative">
                <div className="absolute h-2 bg-gray-500 w-full"></div>
                <div className="absolute h-8 w-1 bg-gray-500 left-3"></div>
                <div className="absolute h-8 w-1 bg-gray-500 right-3"></div>
              </div>
              {renderValue()}
            </div>
            {renderLabel()}
          </div>
        );
        
      case 'inductor':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex flex-col items-center">
              <div className="h-8 w-16 flex items-center justify-center relative">
                <div className="absolute h-2 bg-gray-500 w-full"></div>
                <div className="absolute h-6 w-10 flex items-center justify-center">
                  <div className="text-blue-300 text-lg">∿∿∿</div>
                </div>
              </div>
              {renderValue()}
            </div>
            {renderLabel()}
          </div>
        );
        
      case 'led':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex flex-col items-center">
              <Lightbulb 
                className={`h-8 w-8 ${
                  component.state === 'on' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'text-gray-600'
                }`} 
              />
              {renderValue()}
            </div>
            {renderLabel()}
          </div>
        );
        
      case 'switch':
        return (
          <div 
            style={componentStyle}
            onClick={() => handleSelectComponent(component.id)}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex flex-col items-center">
              <button 
                className={`h-8 w-12 rounded-full flex items-center border ${
                  component.state === 'on' 
                    ? 'bg-green-900 border-green-700 justify-end' 
                    : 'bg-gray-900 border-gray-700 justify-start'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSwitch(component.id);
                }}
              >
                <div className={`h-6 w-6 rounded-full ${
                  component.state === 'on' 
                    ? 'bg-green-400 border-green-500' 
                    : 'bg-gray-400 border-gray-500'
                }`}></div>
              </button>
              <div className="text-xs text-gray-300 mt-1">
                {component.state === 'on' ? 'ON' : 'OFF'}
              </div>
            </div>
            {renderLabel()}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator">
          <div className="bg-gray-900 border border-gray-800 rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-800 p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePowerToggle}
                  className={`${
                    circuitPowered 
                      ? 'bg-green-800 hover:bg-green-700 border-green-700' 
                      : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                  }`}
                >
                  <Zap className={`h-4 w-4 mr-1 ${circuitPowered ? 'text-yellow-300' : 'text-gray-400'}`} />
                  {circuitPowered ? 'ON' : 'OFF'}
                </Button>
                
                <Select onValueChange={loadTemplate}>
                  <SelectTrigger className="w-[180px] h-8 text-xs bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Load template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CIRCUIT_TEMPLATES.map(template => (
                      <SelectItem key={template.name} value={template.name} className="text-xs">
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetCircuit}
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 h-8"
                >
                  Reset
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 h-8 p-0 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="text-xs text-gray-300 font-mono">{(zoom * 100).toFixed(0)}%</span>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 h-8 p-0 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setZoom(1)}
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 h-8 p-0 w-8"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Circuit canvas */}
            <div 
              ref={canvasRef}
              className="relative h-80 bg-gray-950 overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid lines */}
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'linear-gradient(to right, rgba(75, 85, 99, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(75, 85, 99, 0.1) 1px, transparent 1px)',
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`
              }}></div>
              
              {/* Components */}
              {components.map(component => renderComponent(component))}
              
              {/* Wire connections would go here in a more sophisticated simulator */}
            </div>
            
            {/* Info panel */}
            <div className="bg-gray-800 p-2">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-300 font-medium">Circuit Status</div>
                <Badge 
                  className={`${
                    !circuitPowered 
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : simulationResult.warnings.length > 0
                        ? 'bg-yellow-900 hover:bg-yellow-800'
                        : simulationResult.isValid
                          ? 'bg-green-900 hover:bg-green-800'
                          : 'bg-red-900 hover:bg-red-800'
                  }`}
                >
                  {simulationResult.message}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-900 rounded p-1">
                  <div className="text-xs text-gray-400">Voltage</div>
                  <div className="text-sm font-mono text-blue-300">{simulationResult.voltage.toFixed(1)} V</div>
                </div>
                <div className="bg-gray-900 rounded p-1">
                  <div className="text-xs text-gray-400">Current</div>
                  <div className="text-sm font-mono text-green-300">{simulationResult.current.toFixed(1)} mA</div>
                </div>
                <div className="bg-gray-900 rounded p-1">
                  <div className="text-xs text-gray-400">Power</div>
                  <div className="text-sm font-mono text-amber-300">{simulationResult.power.toFixed(1)} mW</div>
                </div>
              </div>
              
              {simulationResult.warnings.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-800 rounded p-1 mb-2">
                  <div className="flex items-center text-xs text-yellow-300 mb-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Warnings
                  </div>
                  <ul className="text-xs text-gray-300 list-disc pl-4">
                    {simulationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Label htmlFor="show-labels" className="text-xs text-gray-300">Show Labels</Label>
                  <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                </div>
                <div className="flex items-center gap-1">
                  <Label htmlFor="show-values" className="text-xs text-gray-300">Show Values</Label>
                  <Switch id="show-values" checked={showValues} onCheckedChange={setShowValues} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="components">
          <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('battery')}
              >
                <Battery className="h-8 w-8 text-yellow-400 mb-1" />
                <span className="text-xs text-gray-300">Battery</span>
              </button>
              
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('resistor')}
              >
                <div className="h-8 w-16 flex items-center justify-center relative mb-1">
                  <div className="h-2 bg-gray-500 w-full absolute"></div>
                  <div className="h-6 w-10 bg-amber-900 rounded-sm absolute flex items-center justify-center">
                    <div className="text-[10px] font-mono text-amber-400">R</div>
                  </div>
                </div>
                <span className="text-xs text-gray-300">Resistor</span>
              </button>
              
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('capacitor')}
              >
                <div className="h-8 w-12 flex items-center justify-center relative mb-1">
                  <div className="h-2 bg-gray-500 w-full absolute"></div>
                  <div className="h-8 w-1 bg-gray-500 absolute left-3"></div>
                  <div className="h-8 w-1 bg-gray-500 absolute right-3"></div>
                </div>
                <span className="text-xs text-gray-300">Capacitor</span>
              </button>
              
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('inductor')}
              >
                <div className="h-8 w-16 flex items-center justify-center relative mb-1">
                  <div className="h-2 bg-gray-500 w-full absolute"></div>
                  <div className="h-6 w-10 flex items-center justify-center absolute">
                    <div className="text-blue-300 text-lg">∿∿∿</div>
                  </div>
                </div>
                <span className="text-xs text-gray-300">Inductor</span>
              </button>
              
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('led')}
              >
                <Lightbulb className="h-8 w-8 text-gray-600 mb-1" />
                <span className="text-xs text-gray-300">LED</span>
              </button>
              
              <button 
                className="bg-gray-800 border border-gray-700 rounded-md p-2 hover:bg-gray-750 flex flex-col items-center"
                onClick={() => addComponent('switch')}
              >
                <ToggleLeft className="h-8 w-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-300">Switch</span>
              </button>
            </div>
            
            {/* Component properties editor - only shown when a component is selected */}
            {selectedComponent && (
              <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-100 font-medium">
                    Component Properties
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteComponent(selectedComponent)}
                    className="h-7 text-xs bg-red-900 hover:bg-red-800"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
                
                {components.filter(c => c.id === selectedComponent).map(component => (
                  <div key={component.id} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-300">Type</Label>
                        <div className="bg-gray-700 rounded p-1.5 text-sm text-gray-200">
                          {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-300">Label</Label>
                        <input 
                          type="text"
                          className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm text-gray-200"
                          value={component.label || ''}
                          onChange={(e) => setComponents(prev => prev.map(c => 
                            c.id === component.id ? { ...c, label: e.target.value } : c
                          ))}
                        />
                      </div>
                    </div>
                    
                    {/* Value adjustment - not applicable for switches */}
                    {component.type !== 'switch' && (
                      <div>
                        <div className="flex justify-between items-center">
                          <Label className="text-xs text-gray-300">
                            Value: {component.value} {component.unit}
                          </Label>
                        </div>
                        <Slider
                          value={[component.value]}
                          min={component.type === 'battery' ? 1.5 : 1}
                          max={
                            component.type === 'battery' ? 24 : 
                            component.type === 'resistor' ? 10000 :
                            component.type === 'capacitor' ? 1000 :
                            component.type === 'inductor' ? 100 :
                            component.type === 'led' ? 50 : 100
                          }
                          step={
                            component.type === 'battery' ? 0.1 :
                            component.type === 'resistor' ? 10 : 1
                          }
                          onValueChange={(value) => handleValueChange(component.id, value[0])}
                        />
                      </div>
                    )}
                    
                    {/* Switch toggle */}
                    {component.type === 'switch' && (
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-300">
                          Switch State
                        </Label>
                        <Switch 
                          checked={component.state === 'on'}
                          onCheckedChange={() => handleToggleSwitch(component.id)}
                        />
                      </div>
                    )}
                    
                    {/* Rotation control */}
                    <div>
                      <Label className="text-xs text-gray-300">
                        Rotation: {component.rotation}°
                      </Label>
                      <Slider
                        value={[component.rotation]}
                        min={0}
                        max={359}
                        step={90}
                        onValueChange={(value) => setComponents(prev => prev.map(c => 
                          c.id === component.id ? { ...c, rotation: value[0] } : c
                        ))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="help">
          <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
            <div className="text-sm text-gray-100 font-medium mb-3">Circuit Simulator Help</div>
            
            <div className="space-y-3">
              <div className="bg-blue-900/30 border border-blue-800 rounded p-2">
                <div className="flex items-center text-xs text-blue-300 mb-1">
                  <Info className="h-3 w-3 mr-1" />
                  How to Use
                </div>
                <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                  <li>Add components by selecting them from the Components tab</li>
                  <li>Drag components to position them on the canvas</li>
                  <li>Click on a component to select it and edit its properties</li>
                  <li>Toggle the power button to simulate the circuit</li>
                  <li>Use the zoom controls to adjust the view</li>
                </ul>
              </div>
              
              <div className="text-xs text-gray-400">
                <h3 className="font-medium text-gray-300 mb-1">Components:</h3>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><span className="text-yellow-400">Battery</span> - Power source with adjustable voltage</li>
                  <li><span className="text-amber-400">Resistor</span> - Limits current flow; higher values = more resistance</li>
                  <li><span className="text-blue-400">Capacitor</span> - Stores and releases energy</li>
                  <li><span className="text-blue-400">Inductor</span> - Resists changes in current flow</li>
                  <li><span className="text-green-400">LED</span> - Light-emitting diode; requires correct current</li>
                  <li><span className="text-gray-400">Switch</span> - Controls whether circuit is open or closed</li>
                </ul>
              </div>
              
              <div className="text-xs text-gray-400">
                <h3 className="font-medium text-gray-300 mb-1">Tips:</h3>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>LEDs need a current-limiting resistor to prevent damage</li>
                  <li>A complete circuit must have a path from power source positive to negative</li>
                  <li>All switches must be closed (ON) for current to flow</li>
                  <li>Capacitors block DC current after they're fully charged</li>
                  <li>Use the templates to see examples of working circuits</li>
                </ul>
              </div>
              
              <div className="text-center text-xs text-gray-400 italic mt-4">
                This is a simplified simulator for educational purposes.
                Real circuits would require more detailed analysis.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}