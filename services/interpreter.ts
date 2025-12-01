import { DrawingStep, TurtleState, ExecutionResult } from '../types';

const MAX_STEPS = 1000;

interface LoopContext {
  startLineIndex: number;
  iterations: number;
  currentIteration: number;
  variable: string;
}

export const executeCode = (code: string): ExecutionResult => {
  const lines = code.split('\n');
  
  let state: TurtleState = {
    x: 0,
    y: 0,
    angle: 90, // Start facing up
    penDown: true,
    color: '#34d399', // Default Emerald-400
  };

  const steps: DrawingStep[] = [{ ...state, id: 0 }];
  let pathLength = 0;
  let totalTurns = 0;
  let stepCount = 0;

  // Parser state
  let i = 0;
  const loopStack: LoopContext[] = [];

  try {
    while (i < lines.length && stepCount < MAX_STEPS) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) {
        i++;
        continue;
      }

      // Check for Loop End (dedent simulation) - Simplified for this demo
      const currentIndent = lines[i].search(/\S|$/);

      // Parse specific commands
      // 1. Loop Start: for x in range(N):
      // Allow optional spaces inside range()
      const forMatch = line.match(/^for\s+(\w+)\s+in\s+range\(\s*(\d+)\s*\):/);
      if (forMatch) {
        const loopVar = forMatch[1];
        const count = parseInt(forMatch[2], 10);
        
        // Find the block of code inside this loop
        let blockEndIndex = i + 1;
        while (blockEndIndex < lines.length) {
            const nextLine = lines[blockEndIndex];
            if (nextLine.trim() !== '' && !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
                break;
            }
            blockEndIndex++;
        }

        const loopBody = lines.slice(i + 1, blockEndIndex);
        
        // Remove indent from body
        const cleanBody = loopBody.map(l => l.replace(/^\s+/, ''));
        
        i = blockEndIndex; // Skip past the loop definition in the main flow
        
        for (let iter = 0; iter < count; iter++) {
           const subResult = executeSubBlock(cleanBody, state, pathLength, totalTurns);
           state = subResult.state;
           pathLength = subResult.pathLength;
           totalTurns = subResult.totalTurns;
           steps.push(...subResult.newSteps.map(s => ({...s, id: stepCount++})));
        }
        continue;
      }

      // 2. Simple Commands
      if (processCommand(line, state)) {
         const delta = calculateDelta(line, state);
         if (delta) {
             state = { ...state, ...delta.newState };
             if (delta.moved) pathLength += delta.distance;
             if (delta.turned) totalTurns += Math.abs(delta.angleChange);
             
             steps.push({ ...state, id: stepCount++ });
         }
      }

      i++;
    }
  } catch (err: any) {
    return { steps, error: err.message, pathLength, totalTurns };
  }

  return { steps, error: null, pathLength, totalTurns };
};

// Helper to execute a block of lines (used for loop unrolling)
const executeSubBlock = (lines: string[], initialState: TurtleState, initialPath: number, initialTurns: number) => {
    let state = { ...initialState };
    let pathLength = initialPath;
    let totalTurns = initialTurns;
    const newSteps: DrawingStep[] = [];

    for (const line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        
        const delta = calculateDelta(line, state);
        if (delta) {
            state = { ...state, ...delta.newState };
            if (delta.moved) pathLength += delta.distance;
            if (delta.turned) totalTurns += Math.abs(delta.angleChange);
            newSteps.push({ ...state, id: -1 }); 
        }
    }
    return { state, pathLength, totalTurns, newSteps };
};

const calculateDelta = (line: string, currentState: TurtleState) => {
    const l = line.trim();
    
    // Movement: Allow optional spaces inside parens
    const forwardMatch = l.match(/^(?:turtle\.|t\.)?(?:forward|fd)\(\s*(\d+)\s*\)/);
    if (forwardMatch) {
        const dist = parseInt(forwardMatch[1], 10);
        const rad = (currentState.angle * Math.PI) / 180;
        return {
            newState: {
                x: currentState.x + Math.cos(rad) * dist,
                y: currentState.y + Math.sin(rad) * dist
            },
            moved: true,
            distance: dist,
            turned: false
        };
    }

    const backwardMatch = l.match(/^(?:turtle\.|t\.)?(?:backward|bk|back)\(\s*(\d+)\s*\)/);
    if (backwardMatch) {
        const dist = parseInt(backwardMatch[1], 10);
        const rad = (currentState.angle * Math.PI) / 180;
        return {
            newState: {
                x: currentState.x - Math.cos(rad) * dist,
                y: currentState.y - Math.sin(rad) * dist
            },
            moved: true,
            distance: dist,
            turned: false
        };
    }

    // Rotation
    const leftMatch = l.match(/^(?:turtle\.|t\.)?(?:left|lt)\(\s*(\d+)\s*\)/);
    if (leftMatch) {
        const deg = parseInt(leftMatch[1], 10);
        return {
            newState: { angle: currentState.angle + deg },
            moved: false,
            turned: true,
            angleChange: deg
        };
    }

    const rightMatch = l.match(/^(?:turtle\.|t\.)?(?:right|rt)\(\s*(\d+)\s*\)/);
    if (rightMatch) {
        const deg = parseInt(rightMatch[1], 10);
        return {
            newState: { angle: currentState.angle - deg },
            moved: false,
            turned: true,
            angleChange: deg
        };
    }
    
    // Color
    const colorMatch = l.match(/^(?:turtle\.|t\.)?pencolor\(['"](.+)['"]\)/);
    if (colorMatch) {
        return {
            newState: { color: colorMatch[1] },
            moved: false,
            turned: false
        };
    }

    return null;
};

// Validates command existence
const processCommand = (line: string, state: TurtleState): boolean => {
    return !!calculateDelta(line, state);
};