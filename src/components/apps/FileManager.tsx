import { useState, useEffect } from 'react';
import { Folder, File, Upload, Download, Trash2, Plus, Search, X, ArrowLeft, FileText, Image, Video, Music, Code, Archive, Eye, Minus, Square, Terminal, Zap, Shield, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
  file_type?: string;
  storage_path?: string;
}

interface FileWindowProps {
  file: FileItem;
  onClose: () => void;
  initialPosition: { x: number; y: number };
  windowId: string;
}

// Enhanced File Window with Cyberpunk Design
const FileWindow = ({ file, onClose, initialPosition, windowId }: FileWindowProps) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      try {
        if (!file.storage_path) {
          await loadMockContent();
          return;
        }

        const { data, error } = await supabase.storage
          .from('files')
          .download(file.storage_path);

        if (error) {
          console.error('Storage download error:', error);
          await loadMockContent();
          return;
        }

        if (file.file_type?.startsWith('text/') || 
            file.file_type?.includes('json') ||
            file.file_type?.includes('javascript') ||
            file.file_type?.includes('css') ||
            file.file_type?.includes('html')) {
          const text = await data.text();
          setFileContent(text);
        } else if (file.file_type?.startsWith('image/')) {
          const url = URL.createObjectURL(data);
          setFileUrl(url);
        } else {
          setFileContent(`File: ${file.name}\nType: ${file.file_type || 'Unknown'}\nSize: ${file.size || 0} bytes\nPath: ${file.path}\nModified: ${file.modified.toLocaleString()}\n\nThis file type cannot be previewed as text. You can download it to view the contents.`);
        }
        
      } catch (error) {
        console.error('Error loading file content:', error);
        await loadMockContent();
      } finally {
        setLoading(false);
      }
    };

    const loadMockContent = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      let content = '';
      
      switch (extension) {
        case 'txt':
        case 'md':
          content = `# ${file.name}\n\nThis is your text file content.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;
          break;
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          content = `// ${file.name}\nimport React, { useState } from 'react';\n\nconst Component = () => {\n  const [count, setCount] = useState(0);\n  \n  const handleClick = () => {\n    setCount(prev => prev + 1);\n  };\n  \n  return (\n    <div className="container">\n      <h1>Counter App</h1>\n      <p>Current count: {count}</p>\n      <button onClick={handleClick}>\n        Increment\n      </button>\n    </div>\n  );\n};\n\nexport default Component;`;
          break;
        case 'json':
          content = `{\n  "name": "${file.name}",\n  "version": "1.0.0",\n  "description": "Sample JSON configuration file",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "build": "npm run build",\n    "test": "jest"\n  },\n  "dependencies": {\n    "react": "^18.0.0",\n    "typescript": "^4.9.0"\n  },\n  "keywords": ["demo", "json", "config"],\n  "author": "Your Name",\n  "license": "MIT"\n}`;
          break;
        case 'css':
          content = `/* ${file.name} */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n\n.header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  text-align: center;\n  padding: 2rem;\n  border-radius: 12px;\n  margin-bottom: 2rem;\n}\n\n.button {\n  background: #3b82f6;\n  color: white;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n\n.button:hover {\n  background: #2563eb;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);\n}`;
          break;
        case 'html':
          content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${file.name}</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 20px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Welcome to ${file.name}</h1>\n    <p>This is a sample HTML file.</p>\n    <button onclick="alert('Hello World!')">Click me!</button>\n</body>\n</html>`;
          break;
        default:
          content = `File: ${file.name}\nType: ${file.file_type || 'Unknown'}\nSize: ${file.size || 0} bytes\nPath: ${file.path}\nModified: ${file.modified.toLocaleString()}\n\nThis file cannot be previewed as text. You can download it to view the contents.`;
      }
      
      setFileContent(content);
    };
    
    loadContent();
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isMaximized) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType?.startsWith('image/')) return <Image className="h-6 w-6 text-emerald-400" />;
    if (fileType?.startsWith('video/')) return <Video className="h-6 w-6 text-red-400" />;
    if (fileType?.startsWith('audio/')) return <Music className="h-6 w-6 text-purple-400" />;
    
    switch (extension) {
      case 'txt':
      case 'md':
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-green-400" />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <Code className="h-6 w-6 text-green-400" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-6 w-6 text-green-400" />;
      default:
        return <File className="h-6 w-6 text-green-400" />;
    }
  };

  const isTextFile = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'csv'];
    return textExtensions.includes(extension || '') || fileType?.startsWith('text/');
  };

  const isImageFile = (fileName: string, fileType?: string) => {
    return fileType?.startsWith('image/');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async () => {
    if (!file.storage_path) {
      toast({
        title: "Download Failed",
        description: "File not available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Downloaded ${file.name}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ${file.name}`,
        variant: "destructive",
      });
    }
  };

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 bg-black/40 backdrop-blur-md rounded-lg p-4 border border-green-400/20 shadow-green-500/20 shadow-lg cursor-pointer hover:border-green-400/40 transition-all duration-300 z-40 group font-mono"
        style={{ left: `${20 + (parseInt(windowId.split('_')[1]) % 10 * 200)}px` }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {getFileIcon(file.name, file.file_type)}
          </div>
          <span className="text-sm text-green-300 font-semibold truncate max-w-32">{file.name}</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-150"></div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  const windowStyle = isMaximized ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 50
  } : {
    position: 'fixed' as const,
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    zIndex: 50
  };

  return (
    <div style={windowStyle} className="transition-all duration-300 ease-out">
      <div className="h-full bg-black/80 backdrop-blur-md rounded-lg shadow-green-500/20 shadow-lg border border-green-400/20 overflow-hidden">
        {/* Title Bar */}
        <div 
          className="bg-black/60 border-b border-green-500/20 p-4 flex items-center justify-between cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              {getFileIcon(file.name, file.file_type)}
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-green-300">{file.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-green-500/80 font-mono">
                <Terminal className="w-3 h-3" />
                <span>{file.size && `${formatFileSize(file.size)} • `}</span>
                <span>{file.modified.toLocaleDateString()} • </span>
                <span className="text-green-400">{file.file_type || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center transition-all duration-200"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-all duration-200"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Square className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all duration-200"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-78px)] overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-green-400/20 border-l-green-400 rounded-full animate-spin"></div>
              </div>
              <span className="ml-4 text-green-300 font-mono animate-pulse">Loading file content...</span>
            </div>
          ) : fileUrl ? (
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={fileUrl}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain rounded-lg border border-green-500/30"
                  onError={() => {
                    console.error('Image failed to load');
                    setFileUrl('');
                    setFileContent('Failed to load image content.');
                  }}
                />
              </div>
            </div>
          ) : isTextFile(file.name, file.file_type) ? (
            <div className="relative">
              <div className="relative bg-black/60 rounded-lg p-6 font-mono text-sm text-green-100 whitespace-pre-wrap max-w-full overflow-auto border border-green-500/20 shadow-inner backdrop-blur-sm">
                <div className="absolute top-4 right-4 flex space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
                </div>
                {fileContent}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative bg-black/60 rounded-lg p-10 text-center max-w-md mx-auto border border-green-500/30 shadow-lg backdrop-blur-sm">
                <div className="mb-6 flex justify-center relative">
                  <div className="relative">
                    {getFileIcon(file.name, file.file_type)}
                  </div>
                </div>
                <h3 className="text-xl font-mono font-bold text-green-300 mb-3">{file.name}</h3>
                <p className="text-green-500/80 mb-8 font-mono">
                  This file type cannot be previewed directly.
                </p>
                <div className="text-sm text-green-500/60 space-y-3 mb-8 font-mono bg-black/50 rounded-lg p-4 border border-green-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 flex items-center"><Cpu className="w-3 h-3 mr-2" />Type:</span>
                    <span>{file.file_type || 'Unknown'}</span>
                  </div>
                  {file.size && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 flex items-center"><Shield className="w-3 h-3 mr-2" />Size:</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 flex items-center"><Zap className="w-3 h-3 mr-2" />Modified:</span>
                    <span>{file.modified.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 flex items-center"><Terminal className="w-3 h-3 mr-2" />Path:</span>
                    <span className="truncate max-w-32">{file.path}</span>
                  </div>
                </div>
                <button 
                  onClick={downloadFile}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center mx-auto font-mono font-semibold shadow-green-500/30 shadow-md border border-green-400/30"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Main FileManager Component
export const FileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Root' }]);
  const [openWindows, setOpenWindows] = useState<{ [key: string]: FileItem }>({});
  const [lastTapTime, setLastTapTime] = useState<{ [key: string]: number }>({});
  const [lastTapFileId, setLastTapFileId] = useState<string>('');
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, currentFolderId]);

  const loadFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id);
      
      if (currentFolderId) {
        query = query.eq('parent_folder_id', currentFolderId);
      } else {
        query = query.is('parent_folder_id', null);
      }
      
      const { data, error } = await query.order('is_folder', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedFiles: FileItem[] = (data || []).map(file => ({
        id: file.id,
        name: file.name,
        type: file.is_folder ? 'folder' : 'file',
        size: file.size || undefined,
        modified: new Date(file.updated_at || file.created_at || ''),
        path: file.path,
        file_type: file.type,
        storage_path: file.storage_path
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error Loading Files",
        description: `Failed to load your files: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (uploadedFiles.length === 0) return;

    setLoading(true);
    try {
      for (const file of uploadedFiles) {
        console.log('Processing file:', file.name, file.size, file.type);
        
        const timestamp = Date.now();
        const storagePath = `${user.id}/${currentFolderId || 'root'}/${timestamp}_${file.name}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) {
          console.error('Storage upload error:', storageError);
          throw storageError;
        }

        console.log('File uploaded to storage:', storageData);

        const fileRecord = {
          user_id: user.id,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          path: currentFolderId ? `/uploads/${user.id}/${currentFolderId}/${file.name}` : `/uploads/${user.id}/${file.name}`,
          storage_path: storagePath,
          is_folder: false,
          parent_folder_id: currentFolderId
        };

        console.log('Inserting file record:', fileRecord);

        const { error: dbError } = await supabase
          .from('files')
          .insert(fileRecord);

        if (dbError) {
          console.error('Database insert error:', dbError);
          await supabase.storage.from('files').remove([storagePath]);
          throw dbError;
        }

        console.log('File record saved successfully for:', file.name);
      }

      toast({
        title: "Files Uploaded",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

      await loadFiles();
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload files: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId: string, isFolder?: boolean) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - (lastTapTime[fileId] || 0);
    
    if (timeDiff < 300 && lastTapFileId === fileId) {
      if (isFolder) {
        handleDoubleTabDelete(fileId);
      } else {
        handleDoubleTabDelete(fileId);
      }
      return;
    }
    
    setLastTapTime(prev => ({ ...prev, [fileId]: currentTime }));
    setLastTapFileId(fileId);
    
    if (isFolder) {
      if (selectedFiles.includes(fileId)) {
        navigateToFolder(fileId);
      } else {
        setSelectedFiles(prev => 
          prev.includes(fileId) 
            ? prev.filter(id => id !== fileId)
            : [...prev, fileId]
        );
      }
    } else {
      const file = files.find(f => f.id === fileId);
      if (file) {
        openFileWindow(file);
      }
    }
  };

  const handleDoubleTabDelete = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !user) return;

    const itemType = file.type === 'folder' ? 'folder' : 'file';
    const confirmed = window.confirm(`Are you sure you want to delete this ${itemType} "${file.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data: fileToDelete, error: fetchError } = await supabase
        .from('files')
        .select('storage_path, is_folder')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (fileToDelete.is_folder) {
        await deleteFolderRecursively(fileId, user.id);
      }

      if (!fileToDelete.is_folder && fileToDelete.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileToDelete.storage_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Deleted`,
        description: `"${file.name}" deleted successfully`,
      });

      await loadFiles();
      
      const windowId = `window_${fileId}`;
      if (openWindows[windowId]) {
        closeFileWindow(windowId);
      }
      
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete "${file.name}": ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFolderRecursively = async (folderId: string, userId: string) => {
    try {
      const { data: children, error: childrenError } = await supabase
        .from('files')
        .select('id, storage_path, is_folder')
        .eq('parent_folder_id', folderId)
        .eq('user_id', userId);

      if (childrenError) throw childrenError;

      if (children && children.length > 0) {
        for (const child of children) {
          if (child.is_folder) {
            await deleteFolderRecursively(child.id, userId);
          }
        }

        const storagePathsToDelete = children
          .filter(child => !child.is_folder && child.storage_path)
          .map(child => child.storage_path);

        if (storagePathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('files')
            .remove(storagePathsToDelete);

          if (storageError) {
            console.error('Storage deletion error for folder contents:', storageError);
          }
        }

        const { error: deleteChildrenError } = await supabase
          .from('files')
          .delete()
          .eq('parent_folder_id', folderId)
          .eq('user_id', userId);

        if (deleteChildrenError) throw deleteChildrenError;
      }
    } catch (error) {
      console.error('Error in recursive folder deletion:', error);
      throw error;
    }
  };

  const openFileWindow = (file: FileItem) => {
    const windowId = `window_${file.id}`;
    
    const windowCount = Object.keys(openWindows).length;
    const initialPosition = {
      x: 100 + (windowCount * 30),
      y: 100 + (windowCount * 30)
    };

    setOpenWindows(prev => ({
      ...prev,
      [windowId]: file
    }));
  };

  const closeFileWindow = (windowId: string) => {
    setOpenWindows(prev => {
      const newWindows = { ...prev };
      delete newWindows[windowId];
      return newWindows;
    });
  };

  const selectFile = (fileId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const navigateToFolder = async (folderId: string) => {
    try {
      const { data: folderData, error } = await supabase
        .from('files')
        .select('name')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCurrentFolderId(folderId);
      setFolderPath(prev => [...prev, { id: folderId, name: folderData.name }]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error navigating to folder:', error);
      toast({
        title: "Navigation Failed",
        description: "Failed to open folder",
        variant: "destructive",
      });
    }
  };

  const navigateToBreadcrumb = (targetIndex: number) => {
    const newPath = folderPath.slice(0, targetIndex + 1);
    const targetFolderId = newPath[newPath.length - 1].id;
    
    setCurrentFolderId(targetFolderId);
    setFolderPath(newPath);
    setSelectedFiles([]);
  };

  const deleteSelected = async () => {
    if (selectedFiles.length === 0 || !user) return;

    const selectedItems = files.filter(f => selectedFiles.includes(f.id));
    const folderCount = selectedItems.filter(f => f.type === 'folder').length;
    const fileCount = selectedItems.filter(f => f.type === 'file').length;
    
    let confirmMessage = `Are you sure you want to delete ${selectedFiles.length} item(s)?`;
    if (folderCount > 0 && fileCount > 0) {
      confirmMessage = `Are you sure you want to delete ${folderCount} folder(s) and ${fileCount} file(s)?`;
    } else if (folderCount > 0) {
      confirmMessage = `Are you sure you want to delete ${folderCount} folder(s)?`;
    } else {
      confirmMessage = `Are you sure you want to delete ${fileCount} file(s)?`;
    }
    confirmMessage += ' This action cannot be undone.';

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data: itemsToDelete, error: fetchError } = await supabase
        .from('files')
        .select('id, storage_path, is_folder, name')
        .in('id', selectedFiles)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const foldersToDelete = itemsToDelete?.filter(item => item.is_folder) || [];
      
      for (const folder of foldersToDelete) {
        await deleteFolderRecursively(folder.id, user.id);
      }

      const storagePathsToDelete = itemsToDelete
        ?.filter(item => !item.is_folder && item.storage_path)
        .map(item => item.storage_path) || [];

      if (storagePathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove(storagePathsToDelete);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .in('id', selectedFiles)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast({
        title: "Items Deleted",
        description: `${selectedFiles.length} item(s) deleted successfully`,
      });

      await loadFiles();
      setSelectedFiles([]);
      
      selectedFiles.forEach(fileId => {
        const windowId = `window_${fileId}`;
        if (openWindows[windowId]) {
          closeFileWindow(windowId);
        }
      });
      
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete selected items: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName?.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: folderName.trim(),
          type: 'folder',
          path: currentFolderId ? `/folders/${user.id}/${currentFolderId}/${folderName.trim()}` : `/folders/${user.id}/${folderName.trim()}`,
          is_folder: true,
          parent_folder_id: currentFolderId
        });

      if (error) throw error;

      toast({
        title: "Folder Created",
        description: `Folder "${folderName}" created successfully`,
      });

      await loadFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Creation Failed",
        description: `Failed to create folder: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType?.startsWith('image/')) return <Image className="h-5 w-5 text-green-400" />;
    if (fileType?.startsWith('video/')) return <Video className="h-5 w-5 text-green-400" />;
    if (fileType?.startsWith('audio/')) return <Music className="h-5 w-5 text-green-400" />;
    
    switch (extension) {
      case 'txt':
      case 'md':
        return <FileText className="h-5 w-5 text-green-400" />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
        return <Code className="h-5 w-5 text-green-400" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-green-400" />;
      default:
        return <File className="h-5 w-5 text-green-400" />;
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202] text-white relative overflow-hidden font-mono">
        {/* Cyberpunk background effects - matching Desktop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.05),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,255,0,0.05),transparent_50%)] animate-pulse-slow"></div>
        
        {/* Faint green grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

        {/* Matrix binary rain */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-green-400 text-xs animate-matrix"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            >
              {Array.from({ length: 40 }).map(() => (Math.random() > 0.5 ? "1" : "0")).join("")}
            </span>
          ))}
        </div>

        {/* Enhanced Toolbar with cyberpunk styling */}
        <div className="relative z-10 border-b border-green-500/20 bg-black/40 backdrop-blur-md p-6 space-y-4">
          {/* Breadcrumb Navigation */}
          {folderPath.length > 1 && (
            <div className="flex items-center space-x-3 text-sm font-mono">
              <Terminal className="w-4 h-4 text-green-400" />
              {folderPath.map((folder, index) => (
                <div key={index} className="flex items-center">
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className="text-green-400 hover:text-green-300 transition-all duration-200 px-2 py-1 rounded-md hover:bg-green-400/10 border border-transparent hover:border-green-400/30"
                  >
                    {folder.name}
                  </button>
                  {index < folderPath.length - 1 && (
                    <span className="mx-3 text-green-500/60 font-bold">/</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-500/60 font-mono rounded-lg focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
              />
            </div>
            <Button
              onClick={createNewFolder}
              size="sm"
              variant="outline"
              disabled={loading}
              className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 border-green-400/30 text-green-100 hover:from-green-500/80 hover:to-emerald-500/80 hover:border-green-300/50 font-mono px-4 py-3 rounded-lg shadow-green-500/30 shadow-md backdrop-blur-sm transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="*/*"
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              size="sm"
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-green-400/30 text-white hover:from-green-400 hover:to-emerald-500 hover:border-green-300/50 font-mono px-4 py-3 rounded-lg shadow-green-500/30 shadow-md backdrop-blur-sm transition-all duration-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Uploading...' : 'Upload Files'}
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                onClick={deleteSelected}
                size="sm"
                disabled={loading}
                className="bg-gradient-to-r from-red-600/80 to-red-500/80 border-red-400/30 text-red-100 hover:from-red-500/80 hover:to-red-400/80 hover:border-red-300/50 font-mono px-4 py-3 rounded-lg shadow-red-500/30 shadow-md backdrop-blur-sm transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedFiles.length})
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced File List */}
        <div className="relative z-10 flex-1 overflow-auto p-6">
          {loading && files.length === 0 && (
            <div className="text-center text-green-300 mt-20">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-green-400/20 border-l-green-400 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-300 rounded-full animate-spin animation-delay-300 mx-auto"></div>
              </div>
              <p className="font-mono text-lg animate-pulse">Initializing file system...</p>
              <p className="font-mono text-sm text-green-500/80 mt-2">Please wait while we load your files</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`relative group flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-300 font-mono ${
                  selectedFiles.includes(file.id)
                    ? 'bg-black/60 border-2 border-green-400/60 shadow-lg shadow-green-400/20 backdrop-blur-md'
                    : 'hover:bg-black/40 border-2 border-transparent hover:border-green-400/20 backdrop-blur-sm'
                }`}
                onClick={() => toggleFileSelection(file.id, file.type === 'folder')}
                onContextMenu={(e) => selectFile(file.id, e)}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                
                <div className="relative flex-shrink-0">
                  {file.type === 'folder' ? (
                    <div className="relative">
                      <Folder className="h-6 w-6 text-green-400" />
                      <div className="absolute -inset-1 bg-green-400/20 rounded-full blur-sm animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      {getFileIcon(file.name, file.file_type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-green-300 truncate group-hover:text-green-200 transition-colors duration-300">
                      {file.name}
                    </span>
                    {file.type === 'file' && (
                      <Eye className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                    )}
                  </div>
                  <div className="text-sm text-green-500/80 flex items-center space-x-4 mt-1">
                    {file.size && (
                      <span className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        {formatFileSize(file.size)}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {file.modified.toLocaleDateString()}
                    </span>
                    {file.file_type && (
                      <span className="text-xs opacity-75 px-2 py-1 bg-black/50 rounded-md border border-green-600/30">
                        {file.file_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedFiles.includes(file.id) && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!loading && filteredFiles.length === 0 && (
            <div className="text-center text-green-500/60 mt-20">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-2 border-dashed border-green-600/30 rounded-2xl mx-auto flex items-center justify-center">
                  <Folder className="h-10 w-10 opacity-50" />
                </div>
                <div className="absolute -inset-2 border border-green-400/20 rounded-3xl animate-pulse"></div>
              </div>
              <p className="text-lg font-mono text-green-300 mb-2">
                {searchTerm ? 'No matches found' : 
                 currentFolderId ? 'Empty directory' : 'File system empty'}
              </p>
              {searchTerm && (
                <p className="text-sm font-mono text-green-500/60">Try refining your search parameters</p>
              )}
              {!searchTerm && !currentFolderId && (
                <div className="space-y-2">
                  <p className="text-sm font-mono text-green-500/60">Initialize your file system</p>
                  <p className="text-xs font-mono text-green-600/40">Upload files or create directories to begin</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced File Windows */}
      {Object.entries(openWindows).map(([windowId, file]) => (
        <FileWindow
          key={windowId}
          file={file}
          onClose={() => closeFileWindow(windowId)}
          initialPosition={{
            x: 100 + (Object.keys(openWindows).indexOf(windowId) * 30),
            y: 100 + (Object.keys(openWindows).indexOf(windowId) * 30)
          }}
          windowId={windowId}
        />
      ))}
    </>
  );
};