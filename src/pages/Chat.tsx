import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Send, Users, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  timestamp: string;
  read: boolean;
  sender_profile?: {
    full_name?: string;
    email?: string;
  };
}

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchMessages();
      const cleanup = setupRealtimeSubscription();
      
      return cleanup;
    }
  }, [user]);

  // Mark messages as read when viewing a chat and clear unseen count
  useEffect(() => {
    if (selectedChat && user) {
      markMessagesAsRead();
      // Force re-render to clear unseen count in UI
      setMessages(prev => [...prev]);
    }
  }, [selectedChat, user]);

  // Handle typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (newMessage && selectedChat) {
      if (!isTyping) {
        setIsTyping(true);
        broadcastTypingStatus(true);
      }
      
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        broadcastTypingStatus(false);
      }, 1000);
    }
    
    return () => clearTimeout(typingTimeout);
  }, [newMessage, selectedChat, isTyping]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error loading messages',
        description: 'Failed to load chat messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return () => {};

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Messages subscription
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === user.id || newMessage.recipient_id === user.id) {
            setMessages(prev => [...prev, newMessage]);
            
            // Show notification for received messages
            if (newMessage.sender_id !== user.id) {
              const sender = profiles.find(p => p.id === newMessage.sender_id);
              toast({
                title: 'New Message',
                description: `${sender?.full_name || 'Someone'}: ${newMessage.content}`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as Message;
          if (updatedMessage.sender_id === user.id || updatedMessage.recipient_id === user.id) {
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ));
          }
        }
      )
      .subscribe();

    // Presence channel for online status and typing indicators
    const presenceChannel = supabase
      .channel('chat-presence')
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync');
        const newState = presenceChannel.presenceState();
        const onlineIds = new Set<string>();
        const typingState = new Map<string, boolean>();
        
        Object.keys(newState).forEach(userId => {
          const presences = newState[userId] as any[];
          if (presences.length > 0) {
            onlineIds.add(userId);
            const latestPresence = presences[presences.length - 1];
            if (latestPresence.typing) {
              typingState.set(userId, true);
            }
          }
        });
        
        setOnlineUsers(onlineIds);
        setTypingUsers(typingState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Tracking presence for user:', user.id);
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            typing: false
          });
        }
      });

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat || !user) return;

    try {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id === selectedChat && 
        msg.recipient_id === user.id && 
        !msg.read
      );

      if (unreadMessages.length === 0) return;

      const ids = unreadMessages.map(msg => msg.id);

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', ids);

      if (error) throw error;

      // Optimistically update local state so badges clear immediately
      setMessages(prev =>
        prev.map(m => (ids.includes(m.id) ? { ...m, read: true } : m))
      );

      console.log(`Marked ${unreadMessages.length} messages as read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const broadcastTypingStatus = async (typing: boolean) => {
    if (!user) return;

    try {
      const presenceChannel = supabase.channel('chat-presence');
      await presenceChannel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
        typing,
        typing_to: selectedChat
      });
      console.log('Typing status broadcasted:', typing);
    } catch (error) {
      console.error('Error broadcasting typing status:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          recipient_id: selectedChat,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      
      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been delivered',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const getConversations = () => {
    const conversations = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      if (!otherUserId) return;
      
      if (!conversations.has(otherUserId) || 
          new Date(message.timestamp) > new Date(conversations.get(otherUserId).timestamp)) {
        conversations.set(otherUserId, message);
      }
    });

    return Array.from(conversations.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const getMessagesForChat = () => {
    if (!selectedChat) return [];
    
    return messages.filter(message => 
      (message.sender_id === user?.id && message.recipient_id === selectedChat) ||
      (message.sender_id === selectedChat && message.recipient_id === user?.id)
    );
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat & Messages</h1>
          <p className="text-muted-foreground">
            Connect and communicate with other SHG members
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {/* Recent Conversations */}
              {getConversations().map((message) => {
                const otherUserId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
                const profile = profiles.find(p => p.id === otherUserId);
                
                return (
                  <div
                    key={otherUserId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === otherUserId ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedChat(otherUserId)}
                  >
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <Avatar>
                           <AvatarFallback>
                             {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                           </AvatarFallback>
                         </Avatar>
                         {onlineUsers.has(otherUserId) && (
                           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                           <p className="font-medium truncate">
                             {profile?.full_name || profile?.email || 'Unknown User'}
                           </p>
                           {typingUsers.get(otherUserId) && (
                             <Badge variant="secondary" className="text-xs">typing...</Badge>
                           )}
                         </div>
                         <p className="text-sm text-muted-foreground truncate">
                           {message.content}
                         </p>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                         <div className="text-xs text-muted-foreground">
                           {new Date(message.timestamp).toLocaleDateString()}
                         </div>
                         {/* Unread message count */}
                         {(() => {
                           const unreadCount = messages.filter(msg => 
                             msg.sender_id === otherUserId && 
                             msg.recipient_id === user?.id && 
                             !msg.read
                           ).length;
                           return unreadCount > 0 ? (
                             <Badge variant="destructive" className="text-xs min-w-5 h-5 flex items-center justify-center">
                               {unreadCount > 9 ? '9+' : unreadCount}
                             </Badge>
                           ) : null;
                         })()}
                       </div>
                     </div>
                  </div>
                );
              })}

              {/* Available Users to Chat */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Start New Chat</p>
                {filteredProfiles.slice(0, 5).map((profile) => (
                  <div
                    key={profile.id}
                    className="p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedChat(profile.id)}
                  >
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <Avatar>
                           <AvatarFallback>
                             {profile.full_name?.[0] || profile.email?.[0] || '?'}
                           </AvatarFallback>
                         </Avatar>
                         {onlineUsers.has(profile.id) && (
                           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-medium truncate">
                           {profile.full_name || 'Unnamed User'}
                         </p>
                         <p className="text-sm text-muted-foreground truncate">
                           {onlineUsers.has(profile.id) ? 'Online' : profile.email}
                         </p>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                 <CardHeader className="border-b">
                   <CardTitle className="flex items-center gap-3">
                     <div className="relative">
                       <Avatar>
                         <AvatarFallback>
                           {profiles.find(p => p.id === selectedChat)?.full_name?.[0] || 
                            profiles.find(p => p.id === selectedChat)?.email?.[0] || '?'}
                         </AvatarFallback>
                       </Avatar>
                       {onlineUsers.has(selectedChat) && (
                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                       )}
                     </div>
                     <div>
                       <p className="font-medium">
                         {profiles.find(p => p.id === selectedChat)?.full_name || 'Unknown User'}
                       </p>
                       <p className="text-sm text-muted-foreground font-normal">
                         {onlineUsers.has(selectedChat) ? 'Online' : profiles.find(p => p.id === selectedChat)?.email}
                       </p>
                     </div>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col h-full">
                   {/* Messages */}
                   <div className="flex-1 space-y-4 p-4 max-h-[450px] overflow-y-auto">
                     {getMessagesForChat().map((message) => (
                       <div
                         key={message.id}
                         className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                       >
                         <div
                           className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                             message.sender_id === user?.id
                               ? 'bg-gradient-hero text-primary-foreground'
                               : 'bg-muted'
                           }`}
                         >
                           <p className="text-sm">{message.content}</p>
                           <div className={`flex items-center justify-between text-xs mt-1 ${
                             message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                           }`}>
                             <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                             {message.sender_id === user?.id && (
                               <span className="ml-2">
                                 {message.read ? '✓✓' : '✓'}
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                     
                     {/* Typing Indicator */}
                     {typingUsers.get(selectedChat) && (
                       <div className="flex justify-start">
                         <div className="bg-muted px-4 py-2 rounded-lg">
                           <div className="flex items-center gap-1">
                             <div className="flex gap-1">
                               <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                               <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                               <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                             </div>
                             <span className="text-xs text-muted-foreground ml-2">typing...</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2 p-4 border-t">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} className="bg-gradient-hero hover:shadow-glow">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose someone to start chatting with
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;