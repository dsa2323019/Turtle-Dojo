import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
  return (
    <div className="relative w-full h-full flex flex-col font-mono text-sm border-t border-slate-700">
      <div className="bg-slate-800 text-slate-400 px-4 py-2 text-xs uppercase tracking-wider border-b border-slate-700 flex justify-between items-center">
        <span>エディタ (script.py)</span>
        <span className="text-slate-500">Python 3.x</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        className="flex-1 w-full bg-slate-900 text-slate-100 p-4 resize-none outline-none focus:ring-0 leading-6 code-scroll"
        placeholder="# ここにPythonコードを書くか、上のボタンを押してください..."
      />
    </div>
  );
};

export default CodeEditor;