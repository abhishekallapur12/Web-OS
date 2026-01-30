import { useState, useEffect } from 'react';
import { Folder, File, Upload, Download, Trash2, Plus, Search, X, Eye, ArrowLeft, FileText, Image, Video, Music, Code, Archive } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
  file_type?: string;
  content?: string; // For demo purposes, we'll simulate file content
}

// File Viewer Component
const FileViewer = ({ file, onClose }: { file: FileItem; onClose: () => void }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading file content
    const loadContent = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock content based on file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      let content = '';
      
      switch (extension) {
        case 'txt':
        case 'md':
          content = `# ${file.name}\n\nThis is a sample text file content.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
          break;
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          content = `// ${file.name}\nimport React from 'react';\n\nconst Component = () => {\n  const [state, setState] = useState(0);\n  \n  return (\n    <div>\n      <h1>Hello World</h1>\n      <p>Counter: {state}</p>\n      <button onClick={() => setState(state + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n};\n\nexport default Component;`;
          break;
        case 'json':
          content = `{\n  "name": "${file.name}",\n  "version": "1.0.0",\n  "description": "Sample JSON file",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "keywords": ["demo", "json"],\n  "author": "User",\n  "license": "MIT"\n}`;
          break;
        case 'css':
          content = `/* ${file.name} */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  text-align: center;\n  padding: 2rem;\n  border-radius: 8px;\n}\n\n.button {\n  background: #3b82f6;\n  color: white;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n\n.button:hover {\n  background: #2563eb;\n}`;
          break;
        default:
          content = `File: ${file.name}\nType: ${file.file_type}\nSize: ${file.size} bytes\n\nThis is a preview of your file. The actual content would be loaded from your storage system.\n\nFile details:\n- Created: ${file.modified.toLocaleDateString()}\n- Path: ${file.path}\n- Extension: ${extension || 'Unknown'}`;
      }
      
      setFileContent(content);
      setLoading(false);
    };
    
    loadContent();
  }, [file]);

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType?.startsWith('image/')) return <Image className="h-6 w-6 text-green-400" />;
    if (fileType?.startsWith('video/')) return <Video className="h-6 w-6 text-red-400" />;
    if (fileType?.startsWith('audio/')) return <Music className="h-6 w-6 text-purple-400" />;
    
    switch (extension) {
      case 'txt':
      case 'md':
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-400" />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <Code className="h-6 w-6 text-yellow-400" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-6 w-6 text-orange-400" />;
      default:
        return <File className="h-6 w-6 text-gray-400" />;
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

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between bg-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          {getFileIcon(file.name, file.file_type)}
          <div>
            <h2 className="text-lg font-semibold text-white">{file.name}</h2>
            <p className="text-sm text-slate-400">
              {file.size && `${formatFileSize(file.size)} • `}
              {file.modified.toLocaleDateString()} • {file.file_type || 'Unknown type'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-400">Loading file...</span>
          </div>
        ) : isTextFile(file.name, file.file_type) ? (
          <div className="bg-slate-800 rounded-lg p-6 font-mono text-sm text-white whitespace-pre-wrap">
            {fileContent}
          </div>
        ) : isImageFile(file.name, file.file_type) ? (
          <div className="flex justify-center">
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Image className="h-16 w-16 text-white opacity-50" />
              </div>
              <p className="text-slate-400">Image preview would appear here</p>
              <p className="text-xs text-slate-500 mt-2">
                In a real app, this would load the actual image from your storage
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            {getFileIcon(file.name, file.file_type)}
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">{file.name}</h3>
            <p className="text-slate-400 mb-4">
              This file type cannot be previewed directly.
            </p>
            <div className="text-sm text-slate-500 space-y-1">
              <p>Type: {file.file_type || 'Unknown'}</p>
              {file.size && <p>Size: {formatFileSize(file.size)}</p>}
              <p>Modified: {file.modified.toLocaleDateString()}</p>
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center mx-auto">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const FileManagerWithViewer = () => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'README.md',
      type: 'file',
      size: 2048,
      modified: new Date('2024-01-15'),
      path: '/files/README.md',
      file_type: 'text/markdown'
    },
    {
      id: '2',
      name: 'app.js',
      type: 'file',
      size: 5120,
      modified: new Date('2024-01-14'),
      path: '/files/app.js',
      file_type: 'application/javascript'
    },
    {
      id: '3',
      name: 'styles.css',
      type: 'file',
      size: 1024,
      modified: new Date('2024-01-13'),
      path: '/files/styles.css',
      file_type: 'text/css'
    },
    {
      id: '4',
      name: 'package.json',
      type: 'file',
      size: 512,
      modified: new Date('2024-01-12'),
      path: '/files/package.json',
      file_type: 'application/json'
    },
    {
      id: '5',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-10'),
      path: '/folders/Documents'
    },
    {
      id: '6',
      name: 'image.png',
      type: 'file',
      size: 15360,
      modified: new Date('2024-01-09'),
      path: '/files/image.png',
      file_type: 'image/png'
    },
    {
      id: '7',
      name: 'data.txt',
      type: 'file',
      size: 4096,
      modified: new Date('2024-01-08'),
      path: '/files/data.txt',
      file_type: 'text/plain'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Home' }]);
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (uploadedFiles.length === 0) return;

    setLoading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newFiles = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: 'file' as const,
      size: file.size,
      modified: new Date(),
      path: `/files/${file.name}`,
      file_type: file.type || 'application/octet-stream'
    }));

    setFiles(prev => [...newFiles, ...prev]);
    setLoading(false);
    
    // Clear the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const toggleFileSelection = (fileId: string, file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate into folder
      setCurrentFolderId(fileId);
      setFolderPath(prev => [...prev, { id: fileId, name: file.name }]);
      setSelectedFiles([]);
    } else {
      // Open file viewer
      setViewingFile(file);
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
    if (selectedFiles.length === 0) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
    setLoading(false);
  };

  const createNewFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName?.trim()) return;

    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      type: 'folder',
      modified: new Date(),
      path: `/folders/${folderName.trim()}`
    };

    setFiles(prev => [newFolder, ...prev]);
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
    if (fileType?.startsWith('video/')) return <Video className="h-5 w-5 text-red-400" />;
    if (fileType?.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-400" />;
    
    switch (extension) {
      case 'txt':
      case 'md':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
        return <Code className="h-5 w-5 text-yellow-400" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-orange-400" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  // Show file viewer if a file is being viewed
  if (viewingFile) {
    return <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Toolbar */}
      <div className="border-b border-slate-700 p-4 space-y-4">
        {/* Breadcrumb Navigation */}
        {folderPath.length > 1 && (
          <div className="flex items-center space-x-2 text-sm">
            {folderPath.map((folder, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {folder.name}
                </button>
                {index < folderPath.length - 1 && (
                  <span className="mx-2 text-slate-500">/</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={createNewFolder}
            className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Folder
          </button>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept="*/*"
          />
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {loading && files.length === 0 && (
          <div className="text-center text-slate-400 mt-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading files...</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedFiles.includes(file.id) && file.type !== 'folder'
                  ? 'bg-blue-600/30 border border-blue-500'
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
              onClick={() => toggleFileSelection(file.id, file)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (file.type !== 'folder') {
                  setSelectedFiles(prev =>
                    prev.includes(file.id)
                      ? prev.filter(id => id !== file.id)
                      : [...prev, file.id]
                  );
                }
              }}
            >
              <div className="flex-shrink-0">
                {file.type === 'folder' ? (
                  <Folder className="h-5 w-5 text-yellow-400" />
                ) : (
                  getFileIcon(file.name, file.file_type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate">{file.name}</span>
                  {file.type === 'file' && (
                    <Eye className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="text-sm text-slate-400 flex items-center space-x-4">
                  {file.size && <span>{formatFileSize(file.size)}</span>}
                  <span>{file.modified.toLocaleDateString()}</span>
                  {file.file_type && <span className="text-xs opacity-75">{file.file_type}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredFiles.length === 0 && (
          <div className="text-center text-slate-400 mt-12">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm ? 'No files found' : 
               currentFolderId ? 'This folder is empty' : 'No files uploaded yet'}
            </p>
            {searchTerm && (
              <p className="text-sm mt-2">Try adjusting your search term</p>
            )}
            {!searchTerm && !currentFolderId && (
              <p className="text-sm mt-2">Upload some files or create folders to get started</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};