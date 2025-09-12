import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }
    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });
    logStep("Stripe session retrieved", { 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    if (session.payment_status === 'paid') {
      // Extract metadata
      const { senderShgId, recipientShgId, userId, purpose, amount } = session.metadata;
      
      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          amount: parseFloat(amount),
          currency: 'INR',
          sender_shg_id: senderShgId,
          recipient_shg_id: recipientShgId,
          status: 'completed',
          payment_method: 'stripe_card',
          transaction_id: session.payment_intent?.id || session.id,
        })
        .select()
        .single();

      if (transactionError) {
        logStep("Error creating transaction", { error: transactionError });
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }

      logStep("Transaction created successfully", { transactionId: transactionData.id });

      return new Response(JSON.stringify({ 
        success: true, 
        transactionId: transactionData.id,
        paymentStatus: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        paymentStatus: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});