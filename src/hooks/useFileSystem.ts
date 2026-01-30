import { useState, useEffect } from 'react';

export interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  children?: { [key: string]: FileSystemNode };
  content?: string;
  createdAt?: Date;
}

const createInitialFileSystem = (): FileSystemNode => ({
  type: 'directory',
  name: '/',
  children: {
    'home': {
      type: 'directory',
      name: 'home',
      children: {
        'neuraos-user': {
          type: 'directory',
          name: 'neuraos-user',
          children: {
            'Documents': { type: 'directory', name: 'Documents', children: {}, createdAt: new Date() },
            'Projects': { type: 'directory', name: 'Projects', children: {}, createdAt: new Date() },
            'Downloads': { type: 'directory', name: 'Downloads', children: {}, createdAt: new Date() },
            'welcome.txt': { 
              type: 'file', 
              name: 'welcome.txt', 
              content: 'Welcome to WebOS!',
              createdAt: new Date()
            },
            'notes.md': { 
              type: 'file', 
              name: 'notes.md', 
              content: '# My Notes\n\nThis is a markdown file.',
              createdAt: new Date()
            },
          },
          createdAt: new Date()
        },
      },
      createdAt: new Date()
    },
    'bin': {
      type: 'directory',
      name: 'bin',
      children: {
        'neuraos': { type: 'file', name: 'neuraos', createdAt: new Date() },
      },
      createdAt: new Date()
    },
  },
  createdAt: new Date()
});

export const getNode = (path: string[], fs: FileSystemNode): FileSystemNode | null => {
  let node = fs;
  for (const part of path) {
    if (node.type === 'directory' && node.children?.[part]) {
      node = node.children[part];
    } else {
      return null;
    }
  }
  return node;
};

export const useFileSystem = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(() => {
    // Don't use localStorage in Claude artifacts - use memory only
    return createInitialFileSystem();
  });
  
  const [currentPath, setCurrentPath] = useState<string[]>(['home', 'neuraos-user']);

  const updateFileSystem = (newFileSystem: FileSystemNode) => {
    setFileSystem(newFileSystem);
  };

  const createDirectory = (path: string[], name: string): boolean => {
    const currentNode = getNode(path, fileSystem);
    if (currentNode && currentNode.type === 'directory' && currentNode.children) {
      if (currentNode.children[name]) {
        return false; // Already exists
      }
      
      const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
      const parentNode = getNode(path, newFileSystem);
      if (parentNode?.type === 'directory' && parentNode.children) {
        parentNode.children[name] = { 
          type: 'directory', 
          name, 
          children: {},
          createdAt: new Date()
        };
        setFileSystem(newFileSystem);
        return true;
      }
    }
    return false;
  };

  const createFile = (path: string[], name: string, content: string = ''): boolean => {
    const currentNode = getNode(path, fileSystem);
    if (currentNode && currentNode.type === 'directory' && currentNode.children) {
      const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
      const parentNode = getNode(path, newFileSystem);
      if (parentNode?.type === 'directory' && parentNode.children) {
        parentNode.children[name] = { 
          type: 'file', 
          name,
          content,
          createdAt: new Date()
        };
        setFileSystem(newFileSystem);
        return true;
      }
    }
    return false;
  };

  const removeItem = (path: string[], name: string): boolean => {
    const currentNode = getNode(path, fileSystem);
    if (currentNode && currentNode.type === 'directory' && currentNode.children) {
      if (currentNode.children[name]) {
        const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
        const parentNode = getNode(path, newFileSystem);
        if (parentNode?.type === 'directory' && parentNode.children) {
          delete parentNode.children[name];
          setFileSystem(newFileSystem);
          return true;
        }
      }
    }
    return false;
  };

  return {
    fileSystem,
    currentPath,
    setCurrentPath,
    updateFileSystem,
    createDirectory,
    createFile,
    removeItem,
    getNode: (path: string[]) => getNode(path, fileSystem)
  };
};