import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FUND-TRANSFER] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    // Get request data
    const { amount, senderShgId, recipientShgId, purpose } = await req.json();
    logStep("Request data received", { amount, senderShgId, recipientShgId, purpose });

    // Validate input
    const MIN_INR = 50;
    if (!amount || !senderShgId || !recipientShgId) {
      return new Response(JSON.stringify({ error: "Missing required fields: amount, senderShgId, recipientShgId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (amount < MIN_INR) {
      return new Response(JSON.stringify({ error: `Minimum amount is ₹${MIN_INR} due to Stripe minimum charge.` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (senderShgId === recipientShgId) {
      return new Response(JSON.stringify({ error: "Cannot transfer funds to the same SHG" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user is a member of sender SHG
    const { data: membershipData, error: membershipError } = await supabaseClient
      .from('shg_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('shg_id', senderShgId)
      .single();

    if (membershipError || !membershipData) {
      throw new Error("You are not authorized to send funds from this SHG");
    }
    logStep("User membership verified");

    // Get SHG details for metadata
    const { data: shgData, error: shgError } = await supabaseClient
      .from('shgs')
      .select('id, name')
      .in('id', [senderShgId, recipientShgId]);

    if (shgError || !shgData || shgData.length !== 2) {
      throw new Error("Invalid SHG IDs provided");
    }

    const senderShg = shgData.find(shg => shg.id === senderShgId);
    const recipientShg = shgData.find(shg => shg.id === recipientShgId);
    logStep("SHG details retrieved", { senderShg: senderShg?.name, recipientShg: recipientShg?.name });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Create checkout session with dynamic amount
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Fund Transfer: ${senderShg?.name} → ${recipientShg?.name}`,
              description: purpose || 'SHG Fund Transfer',
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/funds?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/funds?cancelled=true`,
      metadata: {
        senderShgId,
        recipientShgId,
        userId: user.id,
        purpose: purpose || '',
        amount: amount.toString(),
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-fund-transfer", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});