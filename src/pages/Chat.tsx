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

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [user]);

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
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === user?.id || newMessage.recipient_id === user?.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                      <Avatar>
                        <AvatarFallback>
                          {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {profile?.full_name || profile?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.content}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleDateString()}
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
                      <Avatar>
                        <AvatarFallback>
                          {profile.full_name?.[0] || profile.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {profile.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.email}
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
                    <Avatar>
                      <AvatarFallback>
                        {profiles.find(p => p.id === selectedChat)?.full_name?.[0] || 
                         profiles.find(p => p.id === selectedChat)?.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {profiles.find(p => p.id === selectedChat)?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {profiles.find(p => p.id === selectedChat)?.email}
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
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
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