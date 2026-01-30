import { useState, useRef } from 'react';
import { Play, Save, Plus, Copy, MessageSquare, AlertCircle, Sparkles, Bug, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useGemini } from '@/hooks/useGemini';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isImportant: boolean;
}

export const CodeEditor = () => {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'hello.js',
      language: 'javascript',
      content: '// Welcome to WebOS Code Editor\nconsole.log("Hello, WebOS!");',
      isImportant: false,
    },
  ]);
  const [activeFile, setActiveFile] = useState<CodeFile>(files[0]);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const { generateResponse, loading: aiLoading } = useGemini();
  const { user } = useAuth();
  const { isConnected } = useWallet();

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: 'untitled.txt',
      language: 'text',
      content: '',
      isImportant: false,
    };
    setFiles([...files, newFile]);
    setActiveFile(newFile);
  };

  const saveFile = async (isImportant: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save files",
        variant: "destructive",
      });
      return;
    }

    if (isImportant && !isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to save important files on-chain.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileData = {
        user_id: user.id,
        name: activeFile.name,
        type: 'code',
        size: activeFile.content.length,
        path: `/code/${activeFile.name}`,
        is_folder: false,
        content: activeFile.content,
        language: activeFile.language
      };

      const { error } = await supabase
        .from('files')
        .upsert(fileData);

      if (error) throw error;

      const updatedFile = { ...activeFile, isImportant };
      setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
      setActiveFile(updatedFile);

      toast({
        title: "File Saved",
        description: isImportant ? "File saved on-chain" : "File saved locally",
      });
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the file",
        variant: "destructive",
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    toast({
      title: "Code Copied",
      description: "Code copied to clipboard",
    });
  };

  const runCode = () => {
    setShowConsole(true);
    const output: string[] = [];
    
    // Capture console.log
    const originalLog = console.log;
    console.log = (...args) => {
      output.push(args.join(' '));
      originalLog(...args);
    };

    try {
      if (activeFile.language === 'javascript') {
        eval(activeFile.content);
        if (output.length === 0) {
          output.push('Code executed successfully (no output)');
        }
      } else if (activeFile.language === 'python') {
        // For Python, we'd need Pyodide - for now, show placeholder
        output.push('Python execution requires Pyodide integration (coming soon)');
      } else {
        output.push(`Code execution not supported for ${activeFile.language}`);
      }
    } catch (error) {
      output.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log = originalLog;
    }

    setConsoleOutput(prev => [...prev, ...output]);
    setTimeout(() => {
      consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const askAI = async (action: 'explain' | 'fix' | 'optimize' | 'custom') => {
    let prompt = '';
    
    switch (action) {
      case 'explain':
        prompt = `Explain this ${activeFile.language} code:\n\n${activeFile.content}`;
        break;
      case 'fix':
        prompt = `Find and fix any bugs in this ${activeFile.language} code:\n\n${activeFile.content}`;
        break;
      case 'optimize':
        prompt = `Optimize this ${activeFile.language} code for better performance:\n\n${activeFile.content}`;
        break;
      case 'custom':
        prompt = `${aiPrompt}\n\nCode:\n${activeFile.content}`;
        break;
    }

    try {
      const response = await generateResponse(prompt);
      setAiResponse(response);
      setShowAI(true);
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    }
  };

  const applyAISuggestion = () => {
    // Extract code from AI response if it contains code blocks
    const codeMatch = aiResponse.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeMatch) {
      setActiveFile({ ...activeFile, content: codeMatch[1] });
      toast({
        title: "Code Applied",
        description: "AI suggestion applied to editor",
      });
    } else {
      toast({
        title: "No Code Found",
        description: "No code block found in AI response",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-black font-mono text-green-400 relative">
      {/* Background with desktop theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0, 255, 0, 0.02),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0, 255, 0, 0.02),transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0, 255, 0, 0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0, 255, 0, 0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0, 255, 0, 0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 border-b border-green-500/20 bg-black/40 backdrop-blur-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={createNewFile}
              className="bg-green-600/80 hover:bg-green-500/80 text-black px-3 py-1 rounded font-mono text-sm transition-all shadow-green-500/30 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              New File
            </button>
            <select 
              value={activeFile.language} 
              onChange={(e) => setActiveFile({...activeFile, language: e.target.value})}
              className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm focus:border-green-400/50 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={copyCode}
              className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
            >
              <Copy className="h-4 w-4 mr-2 inline" />
              Copy
            </button>
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
            >
              Console
            </button>
            <button 
              onClick={() => setShowAI(!showAI)}
              className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2 inline" />
              AI
            </button>
            <button 
              onClick={runCode}
              className="bg-green-600/80 hover:bg-green-500/80 text-black px-3 py-1 rounded font-mono text-sm transition-all shadow-green-500/30 shadow-md"
            >
              <Play className="h-4 w-4 mr-2 inline" />
              Run
            </button>
            <button 
              onClick={() => saveFile(false)}
              className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Save
            </button>
            <button 
              onClick={() => saveFile(true)}
              className="bg-orange-600/80 hover:bg-orange-500/80 text-black px-3 py-1 rounded font-mono text-sm transition-all shadow-orange-500/30 shadow-md"
            >
              <AlertCircle className="h-4 w-4 mr-2 inline" />
              Important
            </button>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      <div className="relative z-10 border-b border-green-500/20 bg-black/20 px-4">
        <div className="flex space-x-1">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`px-4 py-2 text-sm font-mono rounded-t-lg transition-all ${
                activeFile.id === file.id
                  ? 'bg-black/60 text-green-300 border-t border-l border-r border-green-500/20 shadow-green-500/20 shadow-lg'
                  : 'bg-black/30 text-green-400/70 hover:bg-black/50 hover:text-green-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{file.name}</span>
                {file.isImportant && (
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-green-400/50 shadow-sm"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex relative z-10">
        <div className={showAI ? 'flex-1' : 'w-full'}>
          <textarea
            value={activeFile.content}
            onChange={(e) => setActiveFile({...activeFile, content: e.target.value})}
            placeholder="Start coding..."
            className="w-full h-full resize-none bg-black/60 border-none text-green-400 font-mono text-sm leading-relaxed p-4 focus:outline-none backdrop-blur-sm"
            style={{ minHeight: '100%' }}
          />
        </div>

        {showAI && (
          <div className="w-80 border-l border-green-500/20 bg-black/60 backdrop-blur-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center text-green-300 font-mono">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </h3>
              <button 
                onClick={() => setShowAI(false)}
                className="text-green-400 hover:text-green-300 font-mono text-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => askAI('explain')} 
                  disabled={aiLoading}
                  className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-2 rounded font-mono text-sm hover:border-green-400/50 transition-all text-left"
                >
                  <Lightbulb className="h-4 w-4 mr-2 inline" />
                  Explain Code
                </button>
                <button 
                  onClick={() => askAI('fix')} 
                  disabled={aiLoading}
                  className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-2 rounded font-mono text-sm hover:border-green-400/50 transition-all text-left"
                >
                  <Bug className="h-4 w-4 mr-2 inline" />
                  Fix Bugs
                </button>
                <button 
                  onClick={() => askAI('optimize')} 
                  disabled={aiLoading}
                  className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-2 rounded font-mono text-sm hover:border-green-400/50 transition-all text-left"
                >
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Optimize
                </button>
              </div>
              
              <div className="space-y-2">
                <textarea
                  placeholder="Ask AI about your code..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-black/60 border border-green-500/20 text-green-400 font-mono text-sm p-3 rounded focus:border-green-400/50 focus:outline-none backdrop-blur-sm"
                  rows={3}
                />
                <button 
                  onClick={() => askAI('custom')}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-purple-600/80 hover:bg-purple-500/80 text-black px-3 py-2 rounded font-mono text-sm transition-all shadow-purple-500/30 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask AI
                </button>
              </div>

              {aiResponse && (
                <div className="bg-black/60 border border-green-500/20 p-3 rounded text-sm max-h-64 overflow-auto backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-300 font-mono">AI Response:</span>
                    <button 
                      onClick={applyAISuggestion}
                      className="text-green-400 hover:text-green-300 font-mono text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-green-400/80 font-mono">{aiResponse}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Console */}
      {showConsole && (
        <div className="relative z-10 border-t border-green-500/20 bg-black/80 text-green-400 p-4 h-48 overflow-auto font-mono text-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-300 font-semibold font-mono">Console Output</span>
            <button 
              onClick={() => setConsoleOutput([])}
              className="text-green-400/70 hover:text-green-400 font-mono text-sm"
            >
              Clear
            </button>
          </div>
          {consoleOutput.map((line, index) => (
            <div key={index} className="mb-1 font-mono">
              <span className="text-green-500/60">{'>'}</span> <span className="text-green-400">{line}</span>
            </div>
          ))}
          <div ref={consoleRef} />
        </div>
      )}
    </div>
  );
};