import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Role = "admin" | "manager" | "member";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const bootstrap = req.headers.get("x-bootstrap") === "1";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Allow bootstrap (no auth) ONLY when there is no admin yet.
    let callerId: string | null = null;
    if (!bootstrap) {
      const userClient = createClient(SUPABASE_URL, ANON, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: u } = await userClient.auth.getUser();
      if (!u?.user) return json({ error: "Unauthorized" }, 401);
      callerId = u.user.id;

      const { data: roleRow } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) return json({ error: "Forbidden — admin only" }, 403);
    } else {
      const { count } = await admin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) > 0) return json({ error: "Bootstrap not allowed — admin already exists" }, 403);
    }

    const body = await req.json();
    const action = body.action as "create" | "delete" | "set_role";

    if (action === "create") {
      const { email, password, full_name, role } = body as {
        email: string; password: string; full_name?: string; role: Role;
      };
      const { data, error } = await admin.auth.admin.createUser({
        email, password,
        email_confirm: true,
        user_metadata: { full_name: full_name ?? email },
      });
      if (error) return json({ error: error.message }, 400);
      const uid = data.user!.id;

      // Trigger gắn 'member' mặc định — nếu role khác thì xoá member rồi gắn role mới.
      if (role !== "member") {
        await admin.from("user_roles").delete().eq("user_id", uid).eq("role", "member");
      }
      await admin.from("user_roles").insert({ user_id: uid, role }).select();
      return json({ ok: true, user_id: uid });
    }

    if (action === "set_role") {
      const { user_id, role } = body as { user_id: string; role: Role };
      await admin.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await admin.from("user_roles").insert({ user_id, role });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const { user_id } = body as { user_id: string };
      if (user_id === callerId) return json({ error: "Cannot delete yourself" }, 400);
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}