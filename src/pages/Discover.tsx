import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Users, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SHG {
  id: string;
  name: string;
  leader_name?: string;
  village?: string;
  state?: string;
  focus_areas?: string[];
  member_count?: number;
  distance_km?: number;
  description?: string;
}

const Discover = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shgs, setShgs] = useState<SHG[]>([]);
  const [filteredShgs, setFilteredShgs] = useState<SHG[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusFilter, setFocusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchSHGs();
    }
  }, [user]);

  useEffect(() => {
    filterSHGs();
  }, [shgs, searchTerm, focusFilter, stateFilter]);

  const fetchSHGs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchNearbySHGs(latitude, longitude);
        },
        async () => {
          // Fallback to all SHGs if location is denied
          await fetchAllSHGs();
        }
      );
    } else {
      await fetchAllSHGs();
    }
  };

  const fetchNearbySHGs = async (lat: number, lon: number) => {
    try {
      const { data, error } = await supabase.rpc('nearby_shgs', {
        lat,
        lon,
        radius_km: 100
      });

      if (error) throw error;
      
      setShgs(data || []);
    } catch (error) {
      console.error('Error fetching nearby SHGs:', error);
      await fetchAllSHGs();
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSHGs = async () => {
    try {
      const { data, error } = await supabase
        .from('shgs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setShgs(data || []);
    } catch (error) {
      console.error('Error fetching SHGs:', error);
      toast({
        title: 'Error loading SHGs',
        description: 'Failed to load Self-Help Groups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSHGs = () => {
    let filtered = shgs;

    if (searchTerm) {
      filtered = filtered.filter(shg =>
        shg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shg.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shg.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (focusFilter !== 'all') {
      filtered = filtered.filter(shg =>
        shg.focus_areas?.includes(focusFilter)
      );
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter(shg => shg.state === stateFilter);
    }

    setFilteredShgs(filtered);
  };

  const uniqueStates = [...new Set(shgs.map(shg => shg.state).filter(Boolean))];
  const uniqueFocusAreas = [...new Set(shgs.flatMap(shg => shg.focus_areas || []))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Discovering SHGs near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Self-Help Groups</h1>
          <p className="text-muted-foreground">
            Connect with Self-Help Groups in your area and beyond
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, village, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={focusFilter} onValueChange={setFocusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by focus area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Focus Areas</SelectItem>
                  {uniqueFocusAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShgs.map((shg) => (
            <Card key={shg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{shg.name}</CardTitle>
                  {shg.distance_km && (
                    <Badge variant="outline">{shg.distance_km.toFixed(1)} km</Badge>
                  )}
                </div>
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
                    {shg.focus_areas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {shg.focus_areas.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{shg.focus_areas.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {shg.member_count || 0} members
                  </div>
                  <Button size="sm" className="bg-gradient-hero hover:shadow-glow">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShgs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No SHGs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;