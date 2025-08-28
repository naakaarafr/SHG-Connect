import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Calendar, Mail, Phone, Target } from 'lucide-react';

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
}

interface SHGDetailsDialogProps {
  shg: SHG | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SHGDetailsDialog = ({ shg, isOpen, onClose }: SHGDetailsDialogProps) => {
  if (!shg) return null;

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
            <Button className="flex-1 bg-gradient-hero hover:shadow-glow">
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