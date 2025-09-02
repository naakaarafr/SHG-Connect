import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X, Users, MapPin, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateSHG = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_name: '',
    village: '',
    state: '',
    pin_code: '',
    contact_email: '',
    contact_phone: '',
    formation_date: '',
  });
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [newFocusArea, setNewFocusArea] = useState('');
  const [memberCount, setMemberCount] = useState<string>('5');

  const commonFocusAreas = [
    'Microfinance', 'Agriculture', 'Handicrafts', 'Women Empowerment',
    'Education', 'Healthcare', 'Small Business', 'Skill Development',
    'Livestock', 'Organic Farming', 'Dairy', 'Tailoring'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFocusArea = (area: string) => {
    if (area && !focusAreas.includes(area)) {
      setFocusAreas(prev => [...prev, area]);
      setNewFocusArea('');
    }
  };

  const removeFocusArea = (area: string) => {
    setFocusAreas(prev => prev.filter(a => a !== area));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create an SHG',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.name || !formData.leader_name || !formData.village || !formData.state) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Create latitude and longitude from village and state (mock coordinates for now)
      const mockLat = 20.5937 + (Math.random() - 0.5) * 10; // Random coordinates around India
      const mockLon = 78.9629 + (Math.random() - 0.5) * 20;

      const { data, error } = await supabase
        .from('shgs')
        .insert({
          name: formData.name,
          description: formData.description,
          leader_name: formData.leader_name,
          village: formData.village,
          state: formData.state,
          pin_code: formData.pin_code,
          contact_email: formData.contact_email || user.email,
          contact_phone: formData.contact_phone,
          formation_date: formData.formation_date || new Date().toISOString().split('T')[0],
          focus_areas: focusAreas,
          member_count: parseInt(memberCount),
          created_by: user.id,
          location: `POINT(${mockLon} ${mockLat})`
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a leader member
      const { error: memberError } = await supabase
        .from('shg_members')
        .insert({
          shg_id: data.id,
          user_id: user.id,
          role_in_shg: 'leader'
        });

      if (memberError) throw memberError;

      // Update user profile with SHG ID
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          shg_id: data.id,
          role: 'shg_admin'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: 'SHG created successfully!',
        description: 'Your Self-Help Group has been created and you are now the leader.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating SHG:', error);
      toast({
        title: 'Failed to create SHG',
        description: 'There was an error creating your SHG. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your SHG</h1>
          <p className="text-muted-foreground">
            Start a new Self-Help Group and empower your community
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                SHG Information
              </CardTitle>
              <CardDescription>
                Provide details about your Self-Help Group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">SHG Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your SHG name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your SHG's mission and goals"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="leader_name">Leader Name *</Label>
                    <Input
                      id="leader_name"
                      name="leader_name"
                      placeholder="Enter the leader's name"
                      value={formData.leader_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="member_count">Number of Members</Label>
                    <Select value={memberCount} onValueChange={setMemberCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                        <SelectItem value="5">5 members</SelectItem>
                        <SelectItem value="6">6 members</SelectItem>
                        <SelectItem value="7">7 members</SelectItem>
                        <SelectItem value="8">8 members</SelectItem>
                        <SelectItem value="9">9 members</SelectItem>
                        <SelectItem value="10">10 members</SelectItem>
                        <SelectItem value="11">11 members</SelectItem>
                        <SelectItem value="12">12 members</SelectItem>
                        <SelectItem value="15">15 members</SelectItem>
                        <SelectItem value="20">20 members</SelectItem>
                        <SelectItem value="25">25 members</SelectItem>
                        <SelectItem value="30">30+ members</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Typical SHGs have 5-20 members. You can update this count later as your group grows.
                    </p>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <Label className="text-base font-semibold">Location Information</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="village">Village *</Label>
                      <Input
                        id="village"
                        name="village"
                        placeholder="Village name"
                        value={formData.village}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="State name"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pin_code">PIN Code</Label>
                    <Input
                      id="pin_code"
                      name="pin_code"
                      placeholder="PIN code"
                      value={formData.pin_code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      placeholder="Contact email address"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      placeholder="Contact phone number"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="formation_date">Formation Date</Label>
                    <Input
                      id="formation_date"
                      name="formation_date"
                      type="date"
                      value={formData.formation_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <Label className="text-base font-semibold">Focus Areas</Label>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom focus area"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusArea(newFocusArea))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addFocusArea(newFocusArea)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Common focus areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonFocusAreas.map(area => (
                        <Button
                          key={area}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addFocusArea(area)}
                          className="text-xs"
                        >
                          {area}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {focusAreas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected focus areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {focusAreas.map(area => (
                          <Badge key={area} variant="secondary" className="flex items-center gap-1">
                            {area}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeFocusArea(area)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-hero hover:shadow-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating SHG...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Create SHG
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSHG;