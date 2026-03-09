import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const callerUid = userData.user.id;
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUid)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminCheck) throw new Error("Not authorized: admin role required");

    const { action, ...params } = await req.json();

    // LIST USERS
    if (action === "list_users") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, display_name, country, created_at")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, string[]> = {};
      for (const r of roles || []) {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      }

      const users = (profiles || []).map((p: any) => ({
        ...p,
        roles: rolesMap[p.id] || [],
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADD ROLE
    if (action === "add_role") {
      const { userId, role } = params;
      if (!userId || !role) throw new Error("userId and role required");
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // REMOVE ROLE
    if (action === "remove_role") {
      const { userId, role } = params;
      if (!userId || !role) throw new Error("userId and role required");
      // Prevent removing own admin role
      if (userId === callerUid && role === "admin") {
        throw new Error("No puedes quitarte el rol de admin a ti mismo");
      }
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER
    if (action === "delete_user") {
      const { userId } = params;
      if (!userId) throw new Error("userId required");
      if (userId === callerUid) throw new Error("No puedes eliminarte a ti mismo");
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE PROFILE
    if (action === "update_profile") {
      const { userId, display_name, country } = params;
      if (!userId) throw new Error("userId required");
      const updates: any = {};
      if (display_name !== undefined) updates.display_name = display_name;
      if (country !== undefined) updates.country = country;
      updates.updated_at = new Date().toISOString();
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
