import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Users, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}

interface SignInFormData {
  email: string;
  password: string;
}

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUpForm = useForm<SignUpFormData>();
  const signInForm = useForm<SignInFormData>();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        phone: data.phone
      });

      if (error) {
        console.error('Sign up error:', error);
        setAuthError(error.message);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email for verification link.',
        });
      }
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      setAuthError('An unexpected error occurred');
      toast({
        title: 'Sign up failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    setAuthError('');

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        console.error('Sign in error:', error);
        setAuthError(error.message);
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setAuthError('An unexpected error occurred');
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      toast({
        title: 'Google sign in failed',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SHG</span>
              </div>
              <span className="text-primary font-semibold">Connect India</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Empowering Rural Communities Through
              <span className="text-primary"> Digital Connection</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Join thousands of Self-Help Groups across India in sharing resources, 
              collaborating on projects, and building stronger communities together.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Discover Nearby SHGs</h3>
                <p className="text-muted-foreground">Find and connect with Self-Help Groups in your area using real-time location-based discovery.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Secure Communication</h3>
                <p className="text-muted-foreground">Chat securely with other SHG leaders and members to share ideas and coordinate activities.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Fund Sharing</h3>
                <p className="text-muted-foreground">Support each other through secure fund transfers and collaborative financing projects.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="shadow-elegant">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
              <CardDescription>
                Join the SHG Connect India community today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        {...signInForm.register('email', { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        {...signInForm.register('password', { required: true })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        {...signUpForm.register('fullName', { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...signUpForm.register('email', { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        {...signUpForm.register('phone')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        {...signUpForm.register('password', { required: true, minLength: 6 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        {...signUpForm.register('confirmPassword', { required: true })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;