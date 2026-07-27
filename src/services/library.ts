import { supabase } from "@/integrations/supabase/client";
import type { Child, Moment, MomentInput } from "@/types";

const BUCKET = "memorias";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchChild(): Promise<Child | null> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Child | null) ?? null;
}

export async function upsertChild(values: Partial<Child>): Promise<Child> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sessão expirada.");

  if (values.id) {
    const { id, ...rest } = values;
    const { data, error } = await supabase
      .from("children")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Child;
  }

  const { data, error } = await supabase
    .from("children")
    .insert({ ...values, user_id: userId, name: values.name ?? "Meu bebê" })
    .select()
    .single();
  if (error) throw error;
  return data as Child;
}

export async function fetchMoments(): Promise<Moment[]> {
  const { data, error } = await supabase
    .from("moments")
    .select("*, moment_media(*)")
    .order("happened_on", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Moment[];
}

export async function createMoment(input: MomentInput, childId: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sessão expirada.");

  const { media, ...moment } = input;
  const { data, error } = await supabase
    .from("moments")
    .insert({ ...moment, user_id: userId, child_id: childId })
    .select()
    .single();
  if (error) throw error;

  if (media.length) {
    const { error: mediaError } = await supabase.from("moment_media").insert(
      media.map((m, i) => ({
        user_id: userId,
        moment_id: (data as Moment).id,
        url: m.url,
        media_type: m.media_type,
        position: i,
      })),
    );
    if (mediaError) throw mediaError;
  }

  return data as Moment;
}

export async function updateMomentStory(id: string, story_text: string) {
  const { error } = await supabase.from("moments").update({ story_text }).eq("id", id);
  if (error) throw error;
}

export async function deleteMoment(id: string) {
  const { error } = await supabase.from("moments").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadFile(file: File): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sessão expirada.");

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function signUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function fetchCustomChapters() {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data
    .filter((row) => row.title !== "__DELETED__")
    .map((row, idx) => ({
      slug: row.slug,
      index: row.position || 10 + idx,
      title: row.title,
      subtitle: row.subtitle || "Um capítulo especial da nossa história.",
    }));
}

export async function upsertCustomChapter(
  slug: string,
  title: string,
  subtitle?: string,
  position?: number
) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  try {
    await supabase.from("chapters").upsert(
      {
        slug,
        title,
        subtitle: subtitle || "Um capítulo especial da nossa história.",
        user_id: userId,
        position: position ?? (Date.now() % 1000000),
      },
      { onConflict: "slug" },
    );
  } catch (err) {
    console.error("Failed to save custom chapter to db:", err);
  }
}

export async function deleteCustomChapter(slug: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  try {
    // We upsert as __DELETED__ so even default chapters can be hidden by the user!
    await supabase.from("chapters").upsert(
      {
        slug,
        title: "__DELETED__",
        subtitle: "",
        user_id: userId,
        position: 999999,
      },
      { onConflict: "slug" },
    );
  } catch (err) {
    console.error("Failed to delete custom chapter from db:", err);
  }
}


