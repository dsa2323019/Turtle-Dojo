export enum TurtleCommandType {
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  PEN_UP = 'PEN_UP',
  PEN_DOWN = 'PEN_DOWN',
  COLOR = 'COLOR',
}

export interface TurtleState {
  x: number;
  y: number;
  angle: number; // in degrees
  penDown: boolean;
  color: string;
}

export interface DrawingStep extends TurtleState {
  id: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string; // Added for Target Preview
  targetShapeName: string;
  hints: string[];
  checkSuccess: (endState: TurtleState, pathLength: number, turns: number) => boolean;
}

export interface ExecutionResult {
  steps: DrawingStep[];
  error: string | null;
  pathLength: number;
  totalTurns: number;
}