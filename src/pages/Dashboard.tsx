import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Users, MessageCircle, IndianRupee, Plus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  shg_id?: string;
}

interface SHG {
  id: string;
  name: string;
  leader_name?: string;
  village?: string;
  state?: string;
  focus_areas?: string[];
  member_count?: number;
  distance_km?: number;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nearbyShgs, setNearbyShgs] = useState<SHG[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchUserProfile();
      requestLocationAndFetchSHGs();
    }
  }, [user, authLoading, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error fetching profile',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setProfile(data);
    }
  };

  const requestLocationAndFetchSHGs = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchNearbySHGs(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Location access denied. Please enable location services to discover nearby SHGs.');
        setLoading(false);
      }
    );
  };

  const fetchNearbySHGs = async (lat: number, lon: number) => {
    try {
      const { data, error } = await supabase.rpc('nearby_shgs', {
        lat,
        lon,
        radius_km: 50
      });

      if (error) {
        console.error('Error fetching nearby SHGs:', error);
        toast({
          title: 'Error fetching nearby SHGs',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setNearbyShgs(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name || user.email}!
              </h1>
              <p className="text-muted-foreground">
                Manage your SHG connections and discover new opportunities
              </p>
            </div>
            <Badge variant={profile?.role === 'shg_admin' ? 'default' : 'secondary'} className="text-sm">
              {profile?.role || 'guest'}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/discover')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Discover SHGs</h3>
                <p className="text-sm text-muted-foreground">Find nearby groups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Chat</h3>
                <p className="text-sm text-muted-foreground">Connect with others</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">Join discussions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/funds')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-4">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Funds</h3>
                <p className="text-sm text-muted-foreground">Share resources</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email || user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant={profile?.role === 'shg_admin' ? 'default' : 'secondary'}>
                  {profile?.role || 'guest'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
              {!profile?.shg_id && (
                <Button className="w-full bg-gradient-hero hover:shadow-glow" onClick={() => navigate('/create-shg')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create SHG
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Nearby SHGs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nearby SHGs
              </CardTitle>
              <CardDescription>
                {locationError ? locationError : `Found ${nearbyShgs.length} Self-Help Groups near you`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nearbyShgs.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {nearbyShgs.slice(0, 5).map((shg) => (
                    <div key={shg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{shg.name}</h4>
                        <Badge variant="outline">{shg.distance_km?.toFixed(1)} km</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Led by {shg.leader_name} • {shg.village}, {shg.state}
                      </p>
                      {shg.focus_areas && shg.focus_areas.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {shg.focus_areas.slice(0, 3).map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {shg.member_count || 0} members
                        </span>
                        <Button size="sm" variant="outline">
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No SHGs found in your area yet.</p>
                  <p className="text-sm">Be the first to create one!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;