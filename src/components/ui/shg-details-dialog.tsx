import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Calendar, Mail, Phone, Target, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SHG {
  id: string;
  name: string;
  leader_name?: string;
  village?: string;
  state?: string;
  pin_code?: string;
  focus_areas?: string[];
  member_count?: number;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  formation_date?: string;
  created_at: string;
  created_by?: string;
}

interface SHGDetailsDialogProps {
  shg: SHG | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SHGDetailsDialog = ({ shg, isOpen, onClose }: SHGDetailsDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!shg) return null;

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to connect with SHGs',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!shg.created_by) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to this SHG at the moment',
        variant: 'destructive'
      });
      return;
    }

    if (shg.created_by === user.id) {
      toast({
        title: 'That\'s Your SHG!',
        description: 'You cannot connect to your own SHG',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existingMessages, error: checkError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${shg.created_by}),and(sender_id.eq.${shg.created_by},recipient_id.eq.${user.id})`)
        .limit(1);

      if (checkError) throw checkError;

      let conversationExists = existingMessages && existingMessages.length > 0;

      if (!conversationExists) {
        // Create initial connection message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: shg.created_by,
            content: `Hi! I'm interested in connecting with ${shg.name}. I'd love to learn more about your group and how I can get involved or collaborate.`,
            read: false
          });

        if (messageError) throw messageError;
      }

      // Close dialog and navigate to chat
      onClose();
      navigate('/chat');
      
      toast({
        title: 'Connection Initiated!',
        description: conversationExists 
          ? 'Opened existing conversation' 
          : `Sent connection message to ${shg.name}`,
      });

    } catch (error) {
      console.error('Error connecting to SHG:', error);
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to this SHG. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{shg.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Leader</p>
                  <p className="font-medium">{shg.leader_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{shg.member_count || 0} members</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{shg.village}, {shg.state}</span>
                {shg.pin_code && <Badge variant="outline">{shg.pin_code}</Badge>}
              </div>

              {shg.formation_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Formed: {new Date(shg.formation_date).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {shg.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{shg.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Focus Areas */}
          {shg.focus_areas && shg.focus_areas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {shg.focus_areas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {(shg.contact_email || shg.contact_phone) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shg.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{shg.contact_email}</span>
                  </div>
                )}
                {shg.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{shg.contact_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1 bg-gradient-hero hover:shadow-glow"
              onClick={handleConnect}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Connect with Group
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};