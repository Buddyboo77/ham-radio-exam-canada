import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLearningProgress } from '@/hooks/use-learning-progress';
import {
  Cpu,
  Lightbulb,
  Battery,
  AlertCircle,
  Zap,
  RotateCw,
  Plus,
  Cable,
  ArrowRight
} from 'lucide-react';

// Types
type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'led' | 'battery' | 'switch' | 'wire' | 'ground' | 'speaker' | 'antenna';
type UnitType = 'Ω' | 'kΩ' | 'MΩ' | 'F' | 'μF' | 'nF' | 'pF' | 'H' | 'mH' | 'μH' | 'V' | 'A' | 'mA' | 'W' | '';

interface CircuitComponent {
  id: string;
  type: ComponentType;
  value: number;
  unit: UnitType;
  x: number;
  y: number;
  rotation: number;
  connections: string[];
  label: string;
  state?: 'on' | 'off';
}

interface CircuitTemplate {
  name: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  components: CircuitComponent[];
  explanation: string;
  learningPoints: string[];
}

// Circuit templates
const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  {
    name: 'Basic LED Circuit',
    description: 'A simple LED circuit with a battery, resistor, and LED',
    difficulty: 'basic',
    components: [
      { 
        id: 'battery1', 
        type: 'battery', 
        value: 9, 
        unit: 'V', 
        x: 100, 
        y: 150, 
        rotation: 0, 
        connections: ['resistor1'], 
        label: '9V' 
      },
      { 
        id: 'resistor1', 
        type: 'resistor', 
        value: 220, 
        unit: 'Ω', 
        x: 200, 
        y: 150, 
        rotation: 0, 
        connections: ['battery1', 'led1'], 
        label: '220Ω' 
      },
      { 
        id: 'led1', 
        type: 'led', 
        value: 2, 
        unit: 'V', 
        x: 300, 
        y: 150, 
        rotation: 0, 
        connections: ['resistor1', 'ground1'], 
        label: 'LED',
        state: 'off'
      },
      { 
        id: 'ground1', 
        type: 'ground', 
        value: 0, 
        unit: '', 
        x: 400, 
        y: 200, 
        rotation: 0, 
        connections: ['led1', 'battery1'], 
        label: 'GND' 
      }
    ],
    explanation: 'This circuit demonstrates how current flows from the positive terminal of the battery, through the resistor (which limits the current to protect the LED), through the LED (which emits light when current flows through it), and back to the negative terminal of the battery.',
    learningPoints: [
      'Current flows from positive to negative in a circuit',
      'Resistors limit current flow to protect components',
      'LEDs require current limiting resistors to prevent damage',
      'The circuit must be closed (complete) for current to flow'
    ]
  },
  {
    name: 'RC Filter Circuit',
    description: 'A basic RC filter circuit with a resistor and capacitor',
    difficulty: 'intermediate',
    components: [
      { 
        id: 'battery1', 
        type: 'battery', 
        value: 12, 
        unit: 'V', 
        x: 100, 
        y: 150, 
        rotation: 0, 
        connections: ['resistor1'], 
        label: '12V' 
      },
      { 
        id: 'resistor1', 
        type: 'resistor', 
        value: 1, 
        unit: 'kΩ', 
        x: 200, 
        y: 150, 
        rotation: 0, 
        connections: ['battery1', 'capacitor1'], 
        label: '1kΩ' 
      },
      { 
        id: 'capacitor1', 
        type: 'capacitor', 
        value: 0.1, 
        unit: 'μF', 
        x: 300, 
        y: 200, 
        rotation: 90, 
        connections: ['resistor1', 'ground1'], 
        label: '0.1μF' 
      },
      { 
        id: 'ground1', 
        type: 'ground', 
        value: 0, 
        unit: '', 
        x: 400, 
        y: 250, 
        rotation: 0, 
        connections: ['capacitor1', 'battery1'], 
        label: 'GND' 
      }
    ],
    explanation: 'This circuit forms a low-pass filter. The resistor and capacitor together determine the cutoff frequency, which is the frequency above which signals are attenuated. This is commonly used in radio circuits to filter out unwanted high-frequency noise.',
    learningPoints: [
      'RC filters are fundamental in radio circuits',
      'The cutoff frequency is determined by the RC time constant',
      'Low-pass filters allow low frequencies to pass while blocking high frequencies',
      'The formula for cutoff frequency is f = 1/(2πRC)'
    ]
  },
  {
    name: 'FM Radio Antenna Match',
    description: 'A dipole antenna matching circuit',
    difficulty: 'advanced',
    components: [
      { 
        id: 'antenna1', 
        type: 'antenna', 
        value: 0, 
        unit: '', 
        x: 100, 
        y: 100, 
        rotation: 0, 
        connections: ['capacitor1'], 
        label: 'Dipole' 
      },
      { 
        id: 'capacitor1', 
        type: 'capacitor', 
        value: 10, 
        unit: 'pF', 
        x: 200, 
        y: 100, 
        rotation: 0, 
        connections: ['antenna1', 'inductor1'], 
        label: '10pF' 
      },
      { 
        id: 'inductor1', 
        type: 'inductor', 
        value: 0.1, 
        unit: 'μH', 
        x: 300, 
        y: 100, 
        rotation: 0, 
        connections: ['capacitor1', 'wire1'], 
        label: '0.1μH' 
      },
      { 
        id: 'wire1', 
        type: 'wire', 
        value: 0, 
        unit: '', 
        x: 400, 
        y: 100, 
        rotation: 0, 
        connections: ['inductor1'], 
        label: 'To Radio' 
      },
      { 
        id: 'ground1', 
        type: 'ground', 
        value: 0, 
        unit: '', 
        x: 250, 
        y: 200, 
        rotation: 0, 
        connections: [], 
        label: 'GND' 
      }
    ],
    explanation: 'This circuit matches the impedance of a dipole antenna to the input impedance of a radio receiver. The LC network (inductor and capacitor) acts as an impedance transformer to maximize power transfer from the antenna to the radio.',
    learningPoints: [
      'Impedance matching is critical for efficient power transfer',
      'LC networks can transform impedance to match source and load',
      'Proper matching improves signal reception and reduces losses',
      'Resonant circuits have minimum impedance at the resonant frequency'
    ]
  }
];

// Main component
interface CircuitSimulatorProps {
  initialTemplate?: string;
}

export default function CircuitSimulator({ initialTemplate = 'Basic LED Circuit' }: CircuitSimulatorProps) {
  // State
  const [activeTemplate, setActiveTemplate] = useState<CircuitTemplate | null>(null);
  const [componentsState, setComponentsState] = useState<CircuitComponent[]>([]);
  const [circuitWorking, setCircuitWorking] = useState<boolean | null>(null);
  const [circuitVoltage, setCircuitVoltage] = useState<number>(9);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Learning progress
  const { recordCircuitSuccess } = useLearningProgress();
  
  // Initialize with selected template
  useEffect(() => {
    const template = CIRCUIT_TEMPLATES.find(t => t.name === initialTemplate);
    if (template) {
      setActiveTemplate(template);
      setComponentsState(JSON.parse(JSON.stringify(template.components)));
    }
  }, [initialTemplate]);
  
  // Draw circuit diagram
  useEffect(() => {
    if (!canvasRef.current || !componentsState.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.beginPath();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
    
    // Draw components
    componentsState.forEach(component => {
      // Save context
      ctx.save();
      
      // Transform to component position and rotation
      ctx.translate(component.x, component.y);
      ctx.rotate((component.rotation * Math.PI) / 180);
      
      // Draw based on component type
      switch (component.type) {
        case 'resistor':
          drawResistor(ctx, component);
          break;
        case 'capacitor':
          drawCapacitor(ctx, component);
          break;
        case 'inductor':
          drawInductor(ctx, component);
          break;
        case 'diode':
          drawDiode(ctx, component);
          break;
        case 'led':
          drawLED(ctx, component);
          break;
        case 'battery':
          drawBattery(ctx, component);
          break;
        case 'switch':
          drawSwitch(ctx, component);
          break;
        case 'wire':
          drawWire(ctx, component);
          break;
        case 'ground':
          drawGround(ctx, component);
          break;
        case 'speaker':
          drawSpeaker(ctx, component);
          break;
        case 'antenna':
          drawAntenna(ctx, component);
          break;
      }
      
      // Draw label
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '10px sans-serif';
      ctx.fillText(component.label, -15, 30);
      
      // Restore context
      ctx.restore();
    });
    
    // Draw connections
    drawConnections(ctx, componentsState);
    
  }, [componentsState]);
  
  // Draw resistor
  const drawResistor = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(10, 0);
    ctx.lineTo(20, 0);
    
    // Draw resistor body
    ctx.rect(-10, -7, 20, 14);
    ctx.stroke();
    
    // Fill
    ctx.fillStyle = '#555';
    ctx.fillRect(-10, -7, 20, 14);
  };
  
  // Draw capacitor
  const drawCapacitor = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-5, 0);
    ctx.moveTo(5, 0);
    ctx.lineTo(20, 0);
    
    // Draw capacitor plates
    ctx.moveTo(-5, -10);
    ctx.lineTo(-5, 10);
    ctx.moveTo(5, -10);
    ctx.lineTo(5, 10);
    ctx.stroke();
  };
  
  // Draw inductor
  const drawInductor = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-15, 0);
    ctx.moveTo(15, 0);
    ctx.lineTo(20, 0);
    
    // Draw inductor coils
    ctx.arc(-10, 0, 5, 0, Math.PI, false);
    ctx.arc(0, 0, 5, Math.PI, 0, false);
    ctx.arc(10, 0, 5, 0, Math.PI, false);
    ctx.stroke();
  };
  
  // Draw diode
  const drawDiode = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-5, 0);
    ctx.moveTo(5, 0);
    ctx.lineTo(20, 0);
    
    // Draw diode triangle
    ctx.moveTo(-5, -7);
    ctx.lineTo(-5, 7);
    ctx.lineTo(5, 0);
    ctx.closePath();
    
    // Draw diode line
    ctx.moveTo(5, -7);
    ctx.lineTo(5, 7);
    
    ctx.stroke();
    
    // Fill triangle
    ctx.fillStyle = '#555';
    ctx.fill();
  };
  
  // Draw LED
  const drawLED = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-5, 0);
    ctx.moveTo(5, 0);
    ctx.lineTo(20, 0);
    
    // Draw diode triangle
    ctx.moveTo(-5, -7);
    ctx.lineTo(-5, 7);
    ctx.lineTo(5, 0);
    ctx.closePath();
    
    // Draw diode line
    ctx.moveTo(5, -7);
    ctx.lineTo(5, 7);
    
    // Draw light rays
    if (component.state === 'on') {
      ctx.moveTo(8, -5);
      ctx.lineTo(15, -10);
      ctx.moveTo(8, 0);
      ctx.lineTo(18, 0);
      ctx.moveTo(8, 5);
      ctx.lineTo(15, 10);
    }
    
    ctx.stroke();
    
    // Fill triangle with appropriate color
    ctx.fillStyle = component.state === 'on' ? '#f00' : '#900';
    ctx.fill();
  };
  
  // Draw battery
  const drawBattery = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-15, 0);
    ctx.moveTo(15, 0);
    ctx.lineTo(20, 0);
    
    // Draw battery cells
    ctx.moveTo(-15, -10);
    ctx.lineTo(-15, 10);
    ctx.moveTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.moveTo(-5, -10);
    ctx.lineTo(-5, 10);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.moveTo(5, -10);
    ctx.lineTo(5, 10);
    ctx.moveTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.moveTo(15, -10);
    ctx.lineTo(15, 10);
    
    ctx.stroke();
    
    // Draw + and - symbols
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('+', -5, -15);
    ctx.fillText('-', 5, -15);
  };
  
  // Draw switch
  const drawSwitch = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(10, 0);
    ctx.lineTo(20, 0);
    
    // Draw switch
    ctx.arc(-10, 0, 3, 0, 2 * Math.PI);
    ctx.moveTo(10, 0);
    ctx.arc(10, 0, 3, 0, 2 * Math.PI);
    
    // Draw switch lever
    if (component.state === 'on') {
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
    } else {
      ctx.moveTo(-10, 0);
      ctx.lineTo(5, -7);
    }
    
    ctx.stroke();
  };
  
  // Draw wire
  const drawWire = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw wire
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    
    ctx.stroke();
  };
  
  // Draw ground
  const drawGround = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw lead
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 0);
    
    // Draw ground symbol
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(-7, 5);
    ctx.lineTo(7, 5);
    ctx.moveTo(-4, 10);
    ctx.lineTo(4, 10);
    
    ctx.stroke();
  };
  
  // Draw speaker
  const drawSpeaker = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw leads
    ctx.moveTo(-20, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(10, 0);
    ctx.lineTo(20, 0);
    
    // Draw speaker symbol
    ctx.rect(-10, -10, 20, 20);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    
    ctx.stroke();
  };
  
  // Draw antenna
  const drawAntenna = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    
    // Draw lead
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 20);
    
    // Draw antenna elements
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, -15);
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.moveTo(-5, -5);
    ctx.lineTo(5, -5);
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 0);
    
    ctx.stroke();
  };
  
  // Draw connections between components
  const drawConnections = (ctx: CanvasRenderingContext2D, components: CircuitComponent[]) => {
    ctx.beginPath();
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;
    
    // Create a map of component positions
    const positionMap = new Map<string, { x: number, y: number }>();
    components.forEach(component => {
      positionMap.set(component.id, { x: component.x, y: component.y });
    });
    
    // Draw connections
    components.forEach(component => {
      component.connections.forEach(connectionId => {
        const targetPosition = positionMap.get(connectionId);
        if (targetPosition) {
          // Calculate midpoint for connection routing
          const midX = (component.x + targetPosition.x) / 2;
          const midY = (component.y + targetPosition.y) / 2;
          
          // Draw connection
          ctx.moveTo(component.x, component.y);
          // Avoid diagonal lines for cleaner appearance
          if (Math.abs(component.x - targetPosition.x) > Math.abs(component.y - targetPosition.y)) {
            ctx.lineTo(midX, component.y);
            ctx.lineTo(midX, targetPosition.y);
          } else {
            ctx.lineTo(component.x, midY);
            ctx.lineTo(targetPosition.x, midY);
          }
          ctx.lineTo(targetPosition.x, targetPosition.y);
        }
      });
    });
    
    ctx.stroke();
  };
  
  // Toggle switch state
  const toggleSwitch = (switchId: string) => {
    setComponentsState(prev => 
      prev.map(comp => 
        comp.id === switchId 
          ? { ...comp, state: comp.state === 'on' ? 'off' : 'on' } 
          : comp
      )
    );
  };
  
  // Simulate circuit
  const simulateCircuit = () => {
    setSimulating(true);
    
    // In a real app, this would be a more complex simulation
    // For this demo, we'll use some simplified logic
    
    // Check if circuit has a battery
    const hasBattery = componentsState.some(c => c.type === 'battery');
    
    // Check if circuit has a ground
    const hasGround = componentsState.some(c => c.type === 'ground');
    
    // Check if any switch is off
    const allSwitchesOn = componentsState
      .filter(c => c.type === 'switch')
      .every(c => c.state === 'on');
    
    // Check for LEDs
    const leds = componentsState.filter(c => c.type === 'led');
    
    // Simple simulation
    setTimeout(() => {
      if (!hasBattery) {
        setSimResult('Circuit is missing a power source');
        setCircuitWorking(false);
      } else if (!hasGround) {
        setSimResult('Circuit is missing a ground connection');
        setCircuitWorking(false);
      } else if (componentsState.some(c => c.type === 'switch') && !allSwitchesOn) {
        setSimResult('One or more switches are open');
        setCircuitWorking(false);
      } else {
        setSimResult('Circuit is working correctly!');
        setCircuitWorking(true);
        
        // Turn on LEDs
        if (leds.length > 0) {
          setComponentsState(prev => 
            prev.map(comp => 
              comp.type === 'led' ? { ...comp, state: 'on' } : comp
            )
          );
        }
        
        // Record success
        recordCircuitSuccess();
      }
      
      setSimulating(false);
    }, 1500);
  };
  
  // Load a template
  const loadTemplate = (templateName: string) => {
    const template = CIRCUIT_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setActiveTemplate(template);
      setComponentsState(JSON.parse(JSON.stringify(template.components)));
      setCircuitWorking(null);
      setSimResult(null);
    }
  };
  
  // Reset the circuit to its original state
  const resetCircuit = () => {
    if (activeTemplate) {
      setComponentsState(JSON.parse(JSON.stringify(activeTemplate.components)));
      setCircuitWorking(null);
      setSimResult(null);
    }
  };
  
  // Update battery voltage
  const updateBatteryVoltage = (voltage: number) => {
    setCircuitVoltage(voltage);
    
    // Update all batteries in the circuit
    setComponentsState(prev => 
      prev.map(comp => 
        comp.type === 'battery' 
          ? { ...comp, value: voltage, label: `${voltage}V` } 
          : comp
      )
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-blue-400" />
          Circuit Simulator
        </h2>
        
        <Select 
          value={activeTemplate?.name}
          onValueChange={loadTemplate}
        >
          <SelectTrigger className="w-[220px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {CIRCUIT_TEMPLATES.map(template => (
              <SelectItem key={template.name} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {activeTemplate && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-gray-100">{activeTemplate.name}</CardTitle>
                <CardDescription>{activeTemplate.description}</CardDescription>
              </div>
              <Badge variant={
                activeTemplate.difficulty === 'basic' ? 'outline' :
                activeTemplate.difficulty === 'intermediate' ? 'default' : 'secondary'
              }>
                {activeTemplate.difficulty}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Circuit canvas */}
            <div className="bg-gray-950 rounded-md border border-gray-800 overflow-hidden">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={300} 
                className="w-full h-[300px]"
              />
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Battery Voltage</h3>
                <div className="flex items-center gap-3">
                  <Battery className="text-blue-400 h-5 w-5" />
                  <Slider
                    value={[circuitVoltage]}
                    onValueChange={(value) => updateBatteryVoltage(value[0])}
                    max={12}
                    min={1.5}
                    step={1.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{circuitVoltage}V</span>
                </div>
              </div>
              
              <div className="flex items-end gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetCircuit}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={simulateCircuit}
                  disabled={simulating}
                  className="bg-green-800 hover:bg-green-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {simulating ? 'Simulating...' : 'Run Simulation'}
                </Button>
              </div>
            </div>
            
            {/* Simulation result */}
            {simResult && (
              <Alert variant={circuitWorking ? "default" : "destructive"} className={
                circuitWorking 
                  ? "bg-green-900 bg-opacity-20 border-green-800" 
                  : "bg-red-900 bg-opacity-20 border-red-800"
              }>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {circuitWorking ? "Success!" : "Simulation Failed"}
                </AlertTitle>
                <AlertDescription>
                  {simResult}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Explanation */}
            <div className="p-3 bg-blue-900 bg-opacity-20 rounded-md border border-blue-800">
              <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                How It Works
              </h3>
              <p className="text-sm text-gray-300 mb-3">{activeTemplate.explanation}</p>
              
              <h4 className="text-xs font-medium text-blue-300 mb-1">Key Concepts:</h4>
              <ul className="space-y-1">
                {activeTemplate.learningPoints.map((point, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}