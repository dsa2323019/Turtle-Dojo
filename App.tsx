import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import { GAME_LEVELS } from './constants';
import { executeCode } from './services/interpreter';
import { getGeminiHint } from './services/geminiService';
import CodeEditor from './components/CodeEditor';
import GameCanvas from './components/GameCanvas';
import TargetPreview from './components/TargetPreview';
import CommandPalette from './components/CommandPalette';
import { DrawingStep } from './types';

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [code, setCode] = useState(GAME_LEVELS[0].initialCode);
  const [steps, setSteps] = useState<DrawingStep[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const currentLevel = GAME_LEVELS[currentLevelIndex];

  useEffect(() => {
    // Reset state on level change
    setCode(currentLevel.initialCode);
    setSteps([]);
    setConsoleOutput(null);
    setIsLevelComplete(false);
    setActiveHint(null);
  }, [currentLevel]);

  const handleRun = useCallback(() => {
    setConsoleOutput({ type: 'info', text: '実行中...' });
    setIsLevelComplete(false);
    setActiveHint(null);

    // Execute Interpreter
    const result = executeCode(code);
    
    if (result.error) {
      setConsoleOutput({ type: 'error', text: `エラー: ${result.error}` });
      setSteps([]); 
    } else {
        setConsoleOutput({ type: 'info', text: '描画中...' });
    }
    
    setSteps(result.steps);
    setIsAnimating(true);
  }, [code]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    
    const lastStep = steps[steps.length - 1];
    if (!lastStep) return;

    // Calculate metrics
    const { pathLength, totalTurns, error } = executeCode(code);
    
    if (error) {
         return; 
    }

    const success = currentLevel.checkSuccess(lastStep, pathLength, totalTurns);
    
    if (success) {
        setIsLevelComplete(true);
        setConsoleOutput({ type: 'success', text: 'レベルクリア！素晴らしい！' });
    } else {
        setConsoleOutput({ type: 'error', text: '形が少し違います。ヒントを使ってみよう！' });
    }
  };

  const handleHint = async () => {
    if (isGettingHint) return;
    setIsGettingHint(true);
    const hint = await getGeminiHint(currentLevel.description, code, consoleOutput?.type === 'error' ? consoleOutput.text : null);
    setActiveHint(hint);
    setIsGettingHint(false);
  };

  const handleAddCode = (snippet: string) => {
    // Simple logic to append code at the end or current cursor (simplified to end for now)
    setCode(prev => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
  };

  const nextLevel = () => {
    if (currentLevelIndex < GAME_LEVELS.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
    }
  };
  
  const prevLevel = () => {
    if (currentLevelIndex > 0) {
        setCurrentLevelIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200">
      {/* Sidebar / Left Panel */}
      <div className="w-1/3 min-w-[350px] flex flex-col border-r border-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900">
            <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                🐢 Pythonタートル道場
            </h1>
        </div>

        {/* Level Info Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className="p-6 bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevLevel} disabled={currentLevelIndex === 0} className="p-1 hover:bg-slate-800 rounded disabled:opacity-30">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                        レベル {currentLevelIndex + 1} / {GAME_LEVELS.length}
                    </span>
                    <button onClick={nextLevel} disabled={currentLevelIndex === GAME_LEVELS.length - 1} className="p-1 hover:bg-slate-800 rounded disabled:opacity-30">
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{currentLevel.title}</h2>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {currentLevel.description}
                        </p>
                    </div>
                    {/* Target Preview */}
                    <div className="shrink-0">
                        <TargetPreview solutionCode={currentLevel.solutionCode} />
                    </div>
                </div>

                {/* Command Palette (Puzzle Blocks) */}
                <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2 font-semibold">コマンドパレット (クリックして追加)</p>
                    <CommandPalette onAddCode={handleAddCode} disabled={isAnimating} />
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 min-h-[200px] flex flex-col relative">
                <CodeEditor code={code} onChange={setCode} disabled={isAnimating} />
                
                {/* Action Bar */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    <button 
                        onClick={handleHint}
                        disabled={isGettingHint || isAnimating}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lightbulb size={16} />
                        {isGettingHint ? 'AIに聞く' : 'ヒント'}
                    </button>
                    <button 
                        onClick={handleRun}
                        disabled={isAnimating}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnimating ? <RotateCcw size={18} className="animate-spin" /> : <Play size={18} />}
                        {isAnimating ? '実行中...' : '実行する'}
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div className="h-auto min-h-[100px] max-h-[150px] bg-slate-950 border-t border-slate-800 p-4 font-mono text-sm overflow-y-auto shrink-0">
                {activeHint && (
                    <div className="mb-3 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded text-indigo-200 flex gap-2 items-start animate-fade-in">
                        <Lightbulb size={16} className="mt-0.5 shrink-0" />
                        <p>{activeHint}</p>
                    </div>
                )}
                
                {consoleOutput && (
                    <div className={`flex gap-2 items-center ${
                        consoleOutput.type === 'error' ? 'text-rose-400' : 
                        consoleOutput.type === 'success' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                        {consoleOutput.type === 'error' && <AlertCircle size={16} />}
                        {consoleOutput.type === 'success' && <CheckCircle2 size={16} />}
                        <span>{consoleOutput.text}</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="w-2/3 bg-slate-900 p-8 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-3xl aspect-[4/3] relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <GameCanvas 
                steps={steps} 
                isAnimating={isAnimating} 
                onAnimationComplete={handleAnimationComplete} 
            />
            
            {/* Level Complete Overlay */}
            {isLevelComplete && !isAnimating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-fade-in z-10">
                    <div className="bg-emerald-500 rounded-full p-4 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">おめでとう！</h2>
                    <p className="text-emerald-200 mb-8">完璧な {currentLevel.targetShapeName} です。</p>
                    <button 
                        onClick={nextLevel}
                        className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        次のレベルへ <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
        
        <div className="mt-6 flex gap-8 text-slate-500 text-sm font-mono">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div> スタート地点
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> カメの現在地
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;