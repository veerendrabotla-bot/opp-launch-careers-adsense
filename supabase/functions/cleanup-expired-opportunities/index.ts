
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mark opportunities as expired if deadline has passed
    const { data: expiredOpportunities, error: markError } = await supabaseClient
      .from('opportunities')
      .update({ is_expired: true })
      .lt('deadline', new Date().toISOString().split('T')[0])
      .eq('is_expired', false)
      .select()

    if (markError) {
      throw markError
    }

    // Optionally delete opportunities that have been expired for more than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: deletedOpportunities, error: deleteError } = await supabaseClient
      .from('opportunities')
      .delete()
      .lt('deadline', sevenDaysAgo.toISOString().split('T')[0])
      .eq('is_expired', true)
      .select()

    if (deleteError) {
      throw deleteError
    }

    return new Response(
      JSON.stringify({
        success: true,
        marked_expired: expiredOpportunities?.length || 0,
        deleted_old: deletedOpportunities?.length || 0,
        message: `Marked ${expiredOpportunities?.length || 0} opportunities as expired and deleted ${deletedOpportunities?.length || 0} old expired opportunities`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
