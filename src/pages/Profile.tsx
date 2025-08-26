import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Save, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  phone?: string;
  shg_id?: string;
  created_at: string;
  updated_at: string;
}

interface UserSHG {
  id: string;
  name: string;
  village?: string;
  state?: string;
  role_in_shg: string;
  joined_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userShgs, setUserShgs] = useState<UserSHG[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserShgs();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Failed to load your profile information',
        variant: 'destructive'
      });
    }
  };

  const fetchUserShgs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shg_members')
        .select(`
          role_in_shg,
          joined_at,
          shg:shgs(id, name, village, state)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const shgs = data?.map(item => ({
        ...item.shg,
        role_in_shg: item.role_in_shg,
        joined_at: item.joined_at
      })) || [];
      
      setUserShgs(shgs);
    } catch (error) {
      console.error('Error fetching user SHGs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      } : null);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="shgs">My SHGs</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Information */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">
                        {formData.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {formData.full_name || 'Unnamed User'}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge variant={profile.role === 'shg_admin' ? 'default' : 'secondary'} className="mt-2">
                        {profile.role || 'guest'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label>Member Since</Label>
                      <Input
                        value={new Date(profile.created_at).toLocaleDateString()}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="bg-gradient-hero hover:shadow-glow">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My SHGs */}
            <TabsContent value="shgs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My SHG Memberships</CardTitle>
                  <CardDescription>
                    Self-Help Groups you are a member of
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userShgs.length > 0 ? (
                    <div className="space-y-4">
                      {userShgs.map((shg) => (
                        <div key={shg.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{shg.name}</h3>
                            <Badge variant={shg.role_in_shg === 'leader' ? 'default' : 'secondary'}>
                              {shg.role_in_shg}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {shg.village}, {shg.state}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined on {new Date(shg.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">You are not a member of any SHGs yet.</p>
                      <Button 
                        className="mt-4 bg-gradient-hero hover:shadow-glow" 
                        onClick={() => navigate('/create-shg')}
                      >
                        Create Your First SHG
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and sign out
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated: Not available
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Change Password
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Danger Zone</h3>
                      <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg">
                        <div>
                          <h4 className="font-medium text-destructive">Sign Out</h4>
                          <p className="text-sm text-muted-foreground">
                            Sign out of your account on this device
                          </p>
                        </div>
                        <Button variant="destructive" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;