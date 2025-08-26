import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, IndianRupee, Send, TrendingUp, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  sender_shg_id?: string;
  recipient_shg_id?: string;
  sender_shg?: {
    name: string;
  };
  recipient_shg?: {
    name: string;
  };
}

interface SHG {
  id: string;
  name: string;
  village?: string;
  state?: string;
}

const Funds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userShgs, setUserShgs] = useState<SHG[]>([]);
  const [availableShgs, setAvailableShgs] = useState<SHG[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendAmount, setSendAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchUserShgs();
      fetchAvailableShgs();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          sender_shg:shgs!transactions_sender_shg_id_fkey(name),
          recipient_shg:shgs!transactions_recipient_shg_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error loading transactions',
        description: 'Failed to load fund transactions',
        variant: 'destructive'
      });
    }
  };

  const fetchUserShgs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shg_members')
        .select('shg:shgs(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const shgs = data?.map(item => item.shg).filter(Boolean) || [];
      setUserShgs(shgs);
    } catch (error) {
      console.error('Error fetching user SHGs:', error);
    }
  };

  const fetchAvailableShgs = async () => {
    try {
      const { data, error } = await supabase
        .from('shgs')
        .select('id, name, village, state')
        .order('name');

      if (error) throw error;
      setAvailableShgs(data || []);
    } catch (error) {
      console.error('Error fetching available SHGs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFunds = async () => {
    if (!sendAmount || !selectedRecipient || !selectedSender) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount,
          currency: 'INR',
          sender_shg_id: selectedSender,
          recipient_shg_id: selectedRecipient,
          status: 'pending',
          payment_method: 'bank_transfer'
        });

      if (error) throw error;

      toast({
        title: 'Fund transfer initiated',
        description: 'Your fund transfer request has been submitted',
      });

      // Reset form
      setSendAmount('');
      setSelectedRecipient('');
      setSelectedSender('');
      setPurpose('');
      setIsDialogOpen(false);

      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Error sending funds:', error);
      toast({
        title: 'Transfer failed',
        description: 'Failed to initiate fund transfer',
        variant: 'destructive'
      });
    }
  };

  const getTransactionStats = () => {
    const totalSent = transactions
      .filter(t => userShgs.some(shg => shg.id === t.sender_shg_id))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalReceived = transactions
      .filter(t => userShgs.some(shg => shg.id === t.recipient_shg_id))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

    return { totalSent, totalReceived, pendingTransactions };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading fund information...</p>
        </div>
      </div>
    );
  }

  const { totalSent, totalReceived, pendingTransactions } = getTransactionStats();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Fund Management</h1>
              <p className="text-muted-foreground">
                Share resources and manage fund transfers between SHGs
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero hover:shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Funds</DialogTitle>
                  <DialogDescription>
                    Transfer funds from your SHG to another SHG
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sender">From SHG</Label>
                    <select
                      id="sender"
                      value={selectedSender}
                      onChange={(e) => setSelectedSender(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select your SHG</option>
                      {userShgs.map(shg => (
                        <option key={shg.id} value={shg.id}>
                          {shg.name} - {shg.village}, {shg.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="recipient">To SHG</Label>
                    <select
                      id="recipient"
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select recipient SHG</option>
                      {availableShgs
                        .filter(shg => !userShgs.some(userShg => userShg.id === shg.id))
                        .map(shg => (
                          <option key={shg.id} value={shg.id}>
                            {shg.name} - {shg.village}, {shg.state}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose (Optional)</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe the purpose of this transfer"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendFunds} className="w-full bg-gradient-hero hover:shadow-glow">
                    <Send className="h-4 w-4 mr-2" />
                    Send Funds
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center mr-4">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalSent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mr-4">
                <ArrowDownLeft className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalReceived.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Received</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTransactions}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Recent fund transfers and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const isSent = userShgs.some(shg => shg.id === transaction.sender_shg_id);
                  const isReceived = userShgs.some(shg => shg.id === transaction.recipient_shg_id);
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSent ? 'bg-destructive/10' : 'bg-success/10'
                        }`}>
                          {isSent ? (
                            <ArrowUpRight className="h-5 w-5 text-destructive" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {isSent ? 'Sent to' : 'Received from'}{' '}
                            {isSent ? transaction.recipient_shg?.name : transaction.sender_shg?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()} • 
                            {transaction.payment_method || 'Bank Transfer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isSent ? 'text-destructive' : 'text-success'}`}>
                          {isSent ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <IndianRupee className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground">
                  Start by sending funds to other SHGs in your network.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Funds;