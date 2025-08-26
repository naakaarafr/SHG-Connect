import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, TrendingUp, Calendar, Award, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SHG {
  id: string;
  name: string;
  leader_name?: string;
  village?: string;
  state?: string;
  focus_areas?: string[];
  member_count?: number;
  description?: string;
  created_at: string;
}

interface TrackRecord {
  id: string;
  project_name: string;
  description?: string;
  funds_raised?: number;
  funds_spent?: number;
  start_date?: string;
  end_date?: string;
  impact_metrics?: any;
  testimonials?: string[];
  shg: {
    name: string;
    village?: string;
    state?: string;
  };
}

interface Member {
  id: string;
  role_in_shg: string;
  joined_at: string;
  user_profile: {
    full_name?: string;
    email?: string;
  };
  shg: {
    name: string;
  };
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shgs, setShgs] = useState<SHG[]>([]);
  const [trackRecords, setTrackRecords] = useState<TrackRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommunityData();
    }
  }, [user]);

  const fetchCommunityData = async () => {
    try {
      // Fetch recent SHGs
      const { data: shgData, error: shgError } = await supabase
        .from('shgs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (shgError) throw shgError;
      setShgs(shgData || []);

      // Fetch track records with SHG info
      const { data: trackData, error: trackError } = await supabase
        .from('shg_track_records')
        .select(`
          *,
          shg:shgs(name, village, state)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (trackError) throw trackError;
      setTrackRecords(trackData || []);

      // Fetch recent members
      const { data, error } = await supabase
        .from('shg_members')
        .select(`
          role_in_shg,
          joined_at,
          shg_id,
          user_id
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setMembers(data || []);

    } catch (error) {
      console.error('Error fetching community data:', error);
      toast({
        title: 'Error loading community data',
        description: 'Failed to load community information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading community data...</p>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const totalSHGs = shgs.length;
  const totalFundsRaised = trackRecords.reduce((sum, record) => sum + (record.funds_raised || 0), 0);
  const activeProjects = trackRecords.filter(record => !record.end_date).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Hub</h1>
          <p className="text-muted-foreground">
            Discover the collective impact of our Self-Help Group network
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSHGs}</p>
                <p className="text-sm text-muted-foreground">SHG Groups</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-trust rounded-lg flex items-center justify-center mr-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalFundsRaised.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Funds Raised</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different content */}
        <Tabs defaultValue="shgs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shgs">Recent SHGs</TabsTrigger>
            <TabsTrigger value="projects">Success Stories</TabsTrigger>
            <TabsTrigger value="members">Active Members</TabsTrigger>
          </TabsList>

          {/* Recent SHGs */}
          <TabsContent value="shgs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shgs.map((shg) => (
                <Card key={shg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{shg.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {shg.member_count || 0} members
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Led by {shg.leader_name || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {shg.village}, {shg.state}
                    </div>
                    
                    {shg.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {shg.description}
                      </p>
                    )}

                    {shg.focus_areas && shg.focus_areas.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {shg.focus_areas.slice(0, 2).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {shg.focus_areas.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{shg.focus_areas.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(shg.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Success Stories */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trackRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{record.project_name}</span>
                      <Badge variant={record.end_date ? "secondary" : "default"}>
                        {record.end_date ? "Completed" : "Active"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {record.shg.name} • {record.shg.village}, {record.shg.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {record.description && (
                      <p className="text-sm text-muted-foreground">
                        {record.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Funds Raised</p>
                        <p className="font-semibold text-success">
                          ₹{(record.funds_raised || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Funds Spent</p>
                        <p className="font-semibold">
                          ₹{(record.funds_spent || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {record.start_date && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {new Date(record.start_date).toLocaleDateString()}</span>
                        {record.end_date && (
                          <span>Completed: {new Date(record.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}

                    {record.testimonials && record.testimonials.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">Community Impact:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{record.testimonials[0]}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Members */}
          <TabsContent value="members" className="space-y-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Member Directory</h3>
              <p className="text-muted-foreground">
                Connect with other SHG members through the Chat feature
              </p>
              <Button className="mt-4 bg-gradient-hero hover:shadow-glow" onClick={() => window.location.href = '/chat'}>
                Start Chatting
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;