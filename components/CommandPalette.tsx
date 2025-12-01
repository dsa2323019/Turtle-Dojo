import React from 'react';
import { ArrowUp, RotateCw, RotateCcw, Repeat } from 'lucide-react';

interface CommandPaletteProps {
  onAddCode: (codeSnippet: string) => void;
  disabled: boolean;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onAddCode, disabled }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-800/50">
      <button
        onClick={() => onAddCode('forward(100)\n')}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded shadow transition-colors text-sm font-bold"
      >
        <ArrowUp size={16} /> 前に進む
      </button>

      <div className="col-span-1 grid grid-cols-2 gap-2">
         <button
            onClick={() => onAddCode('left(90)\n')}
            disabled={disabled}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-2 py-2 rounded shadow transition-colors text-xs font-bold"
        >
            <RotateCcw size={14} /> 左へ
        </button>
        <button
            onClick={() => onAddCode('right(90)\n')}
            disabled={disabled}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-2 py-2 rounded shadow transition-colors text-xs font-bold"
        >
            <RotateCw size={14} /> 右へ
        </button>
      </div>

      <button
        onClick={() => onAddCode('for i in range(4):\n    ')}
        disabled={disabled}
        className="col-span-2 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded shadow transition-colors text-sm font-bold"
      >
        <Repeat size={16} /> 繰り返し (4回)
      </button>
    </div>
  );
};

export default CommandPalette;