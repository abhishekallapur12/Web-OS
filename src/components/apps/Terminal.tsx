import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Lightbulb } from 'lucide-react';
import { useFileSystem, FileSystemNode } from '@/hooks/useFileSystem.ts';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'suggestion' | 'ai';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  fileSystemHook?: ReturnType<typeof useFileSystem>;
}

export const Terminal = ({ fileSystemHook }: TerminalProps) => {
  // Use provided hook or create new one
  const fsHook = fileSystemHook || useFileSystem();
  const { fileSystem, currentPath, setCurrentPath, createDirectory, createFile, removeItem, getNode } = fsHook;

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to NeuraOS Terminal v2.0',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for commands. Files/folders created here appear on desktop!',
      timestamp: new Date(),
    },
  ]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = async (command: string) => {
    const cmdParts = command.trim().split(' ');
    const baseCommand = cmdParts[0].toLowerCase();
    const args = cmdParts.slice(1);
    
    setCommandHistory(prev => [...prev, command]);
    
    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date(),
    };

    let output = '';
    let suggestion = '';

    setLines(prev => [...prev, commandLine]);

    switch (baseCommand) {
      case 'help':
        output = `Available commands:
help - Show this help message
clear - Clear terminal
ls - List files and directories
pwd - Show current working directory
cd [directory] - Change directory
mkdir [directory] - Create directory (appears on desktop!)
touch [file] - Create file (appears on desktop!)
rm [item] - Remove file or directory
cat [file] - Display file content
echo [text] > [file] - Write text to file
whoami - Show current user
date - Show current date`;
        break;
      
      case 'clear':
        setLines([]);
        setCurrentCommand('');
        return;
      
      case 'ls': {
        const currentNode = getNode(currentPath);
        if (currentNode && currentNode.type === 'directory') {
          const items = Object.keys(currentNode.children || {})
            .map(name => {
              const childNode = currentNode.children?.[name];
              return childNode?.type === 'directory' ? `${name}/` : name;
            });
          output = items.length > 0 ? items.join('  ') : 'Directory is empty';
        } else {
          output = 'Error: Cannot list files in a non-directory.';
        }
        break;
      }
      
      case 'pwd':
        output = `/${currentPath.join('/')}`;
        break;
      
      case 'whoami':
        output = 'neuraos-user';
        break;
      
      case 'date':
        output = new Date().toString();
        break;
      
      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCurrentPath(['home', 'neuraos-user']);
          output = 'Changed directory to: /home/neuraos-user';
        } else {
          const newPath = [...currentPath];
          if (target === '..') {
            if (newPath.length > 0) {
              newPath.pop();
            }
          } else if (target === '/') {
            newPath.splice(0, newPath.length);
          } else {
            newPath.push(target);
          }

          const targetNode = getNode(newPath);
          if (targetNode && targetNode.type === 'directory') {
            setCurrentPath(newPath);
            output = `Changed directory to: /${newPath.join('/')}`;
          } else {
            output = `cd: No such directory: ${target}`;
          }
        }
        break;
      }

      case 'mkdir': {
        const dirName = args[0];
        if (!dirName) {
          output = 'Usage: mkdir <directory name>';
        } else {
          if (createDirectory(currentPath, dirName)) {
            output = `Created directory: ${dirName} (visible on desktop!)`;
          } else {
            output = `mkdir: Directory already exists: ${dirName}`;
          }
        }
        break;
      }

      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          output = 'Usage: touch <file name>';
        } else {
          const currentNode = getNode(currentPath);
          if (currentNode && currentNode.type === 'directory' && currentNode.children?.[fileName]) {
            output = `touch: File already exists: ${fileName}`;
          } else {
            if (createFile(currentPath, fileName, '')) {
              output = `Created file: ${fileName} (visible on desktop!)`;
            } else {
              output = `Error creating file: ${fileName}`;
            }
          }
        }
        break;
      }

      case 'rm': {
        const itemName = args[0];
        if (!itemName) {
          output = 'Usage: rm <file or directory name>';
        } else {
          if (removeItem(currentPath, itemName)) {
            output = `Removed: ${itemName}`;
          } else {
            output = `rm: No such file or directory: ${itemName}`;
          }
        }
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) {
          output = 'Usage: cat <file name>';
        } else {
          const currentNode = getNode(currentPath);
          if (currentNode && currentNode.type === 'directory' && currentNode.children) {
            const file = currentNode.children[fileName];
            if (file && file.type === 'file') {
              output = file.content || '(empty file)';
            } else {
              output = `cat: No such file: ${fileName}`;
            }
          } else {
            output = 'Error: Current path is not a directory.';
          }
        }
        break;
      }

      case 'echo': {
        const text = args.join(' ');
        const redirectIndex = args.findIndex(arg => arg === '>');
        
        if (redirectIndex !== -1 && args[redirectIndex + 1]) {
          const content = args.slice(0, redirectIndex).join(' ');
          const fileName = args[redirectIndex + 1];
          
          if (createFile(currentPath, fileName, content)) {
            output = `Wrote to file: ${fileName}`;
          } else {
            output = `Error writing to file: ${fileName}`;
          }
        } else {
          output = text;
        }
        break;
      }
      
      default:
        output = `Command not found: ${baseCommand}`;
        suggestion = 'Type "help" for available commands';
    }

    const outputLine: TerminalLine = {
      id: (Date.now() + 1).toString(),
      type: 'output',
      content: output,
      timestamp: new Date(),
    };

    const newLines = [outputLine];

    if (suggestion) {
      const suggestionLine: TerminalLine = {
        id: (Date.now() + 2).toString(),
        type: 'suggestion',
        content: `💡 Suggestion: ${suggestion}`,
        timestamp: new Date(),
      };
      newLines.push(suggestionLine);
    }

    setLines(prev => [...prev, ...newLines]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentCommand.trim()) {
        executeCommand(currentCommand);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'clear', 'ls', 'pwd', 'whoami', 'date', 'mkdir ', 'touch ', 'rm ', 'cat ', 'echo ', 'cd '];
      const matches = commands.filter(cmd => cmd.startsWith(currentCommand));
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    }
  };

  const promptPath = currentPath.length > 0 ? `/${currentPath.join('/')}` : '/';

  return (
    <div className="h-full bg-black text-green-400 font-mono flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center space-x-3">
        <TerminalIcon className="h-5 w-5" />
        <span className="text-white font-semibold">NeuraOS Terminal</span>
        <div className="flex-1" />
        <div className="text-xs text-slate-400">
          Files created here appear on desktop!
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`${
              line.type === 'command'
                ? 'text-white font-bold'
                : line.type === 'suggestion'
                ? 'text-yellow-400'
                : line.type === 'ai'
                ? 'text-blue-400'
                : 'text-green-400'
            }`}
          >
            {line.type === 'suggestion' && (
              <Lightbulb className="inline h-4 w-4 mr-2" />
            )}
            <pre className="whitespace-pre-wrap">{line.content}</pre>
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <span className="text-white font-bold">{promptPath} $</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </div>

      <div className="border-t border-slate-700 p-3">
        <div className="flex flex-wrap gap-2">
          {['help', 'ls', 'mkdir testfolder', 'touch newfile.txt', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setCurrentCommand(cmd);
                inputRef.current?.focus();
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};