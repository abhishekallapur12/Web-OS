import { useState, useRef, useEffect } from 'react';
import { Send, Copy, User, Bot, Sparkles, Download, Trash2, Minus, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useGemini } from '@/hooks/useGemini';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant powered by Gemini. I can help you with coding, writing, analysis, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateResponse, streamResponse, loading } = useGemini();
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data && data.length > 0) {
        const chatMessages: ChatMessage[] = data.map(chat => ({
          id: chat.id,
          role: chat.role as 'user' | 'assistant',
          content: chat.content,
          timestamp: new Date(chat.created_at)
        }));
        setMessages([messages[0], ...chatMessages]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (message: ChatMessage) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
          message_id: message.id
        });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    // Save user message
    await saveChatMessage(userMessage);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      let fullResponse = '';
      await streamResponse(inputMessage, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      });

      // Save complete assistant response
      const finalAssistantMessage = { ...assistantMessage, content: fullResponse };
      await saveChatMessage(finalAssistantMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Message Copied",
      description: "Message copied to clipboard",
    });
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuraos-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat Exported",
      description: "Chat history downloaded as text file",
    });
  };

  const clearChat = async () => {
    if (!user) return;

    try {
      await supabase
        .from('ai_chat_history')
        .delete()
        .eq('user_id', user.id);

      setMessages([messages[0]]); // Keep welcome message
      toast({
        title: "Chat Cleared",
        description: "Chat history has been cleared",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202] text-green-300 font-mono relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.03),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,255,0,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Header */}
      <div className="border-b border-green-400/20 p-4 backdrop-blur-sm bg-black/20 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg shadow-green-500/50 shadow-lg">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-green-400 font-semibold font-mono tracking-wide">AI ASSISTANT</h2>
              <p className="text-green-300/60 text-sm font-mono">Powered by Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={exportChat} 
              size="sm" 
              className="bg-black/40 backdrop-blur-md border border-green-400/30 text-green-300 hover:bg-green-500/20 hover:border-green-400/50 font-mono"
            >
              <Download className="h-4 w-4 mr-2" />
              EXPORT
            </Button>
            <Button 
              onClick={clearChat} 
              size="sm" 
              className="bg-black/40 backdrop-blur-md border border-green-400/30 text-green-300 hover:bg-green-500/20 hover:border-green-400/50 font-mono"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              CLEAR
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 relative z-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 p-2 rounded-full border-2 ${
              message.role === 'user' 
                ? 'bg-green-500/20 border-green-500/50 shadow-green-500/30 shadow-lg' 
                : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-400/50 shadow-green-500/30 shadow-lg'
            }`}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-green-400" />
              ) : (
                <Bot className="h-4 w-4 text-green-400" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              <div className={`rounded-2xl p-4 backdrop-blur-md border ${
                message.role === 'user'
                  ? 'bg-green-500/20 text-green-200 border-green-500/30 shadow-green-500/30 shadow-lg'
                  : 'bg-black/40 text-green-300 border-green-400/20 shadow-green-500/20 shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap font-mono">
                  {message.content.includes('```') ? (
                    <div>
                      {message.content.split('```').map((part, index) => (
                        <div key={index}>
                          {index % 2 === 0 ? (
                            <span>{part}</span>
                          ) : (
                            <div className="relative my-3">
                              <pre className="bg-black/60 backdrop-blur-md p-3 rounded-lg text-sm overflow-x-auto border border-green-400/30">
                                <code className="text-green-400 font-mono">{part}</code>
                              </pre>
                              <Button
                                onClick={() => copyMessage(part)}
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/60 backdrop-blur-md border border-green-400/30 hover:bg-green-500/20"
                              >
                                <Copy className="h-3 w-3 text-green-400" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <button
                  onClick={() => copyMessage(message.content)}
                  className="mt-2 text-xs opacity-50 hover:opacity-100 transition-opacity text-green-300/70 font-mono"
                >
                  [COPY]
                </button>
              </div>
              <p className="text-xs text-green-300/50 mt-1 px-2 font-mono">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 p-2 rounded-full border-2 border-green-400/50 shadow-green-500/30 shadow-lg">
              <Bot className="h-4 w-4 text-green-400" />
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-green-400/20 shadow-green-500/20 shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400/70 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-400/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-green-400/20 p-4 backdrop-blur-sm bg-black/20 relative z-10">
        <div className="flex space-x-3">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-black/40 backdrop-blur-md border-green-400/30 text-green-300 resize-none font-mono placeholder:text-green-300/50 focus:border-green-400/50 focus:ring-green-500/30"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading || isStreaming}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-mono shadow-green-500/50 shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};