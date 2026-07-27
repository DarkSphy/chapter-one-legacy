import { supabase } from "@/integrations/supabase/client";
import type { Child, Moment, MomentInput } from "@/types";

const BUCKET = "memorias";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchChild(): Promise<Child | null> {
  try {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      localStorage.setItem("cached_child_profile", JSON.stringify(data));
      return data as Child;
    }
  } catch (err) {
    console.warn("Failed to fetch child from Supabase, using local cache:", err);
  }
  const cached = localStorage.getItem("cached_child_profile");
  return cached ? JSON.parse(cached) : null;
}

export async function upsertChild(values: Partial<Child>): Promise<Child> {
  const currentLocal = localStorage.getItem("cached_child_profile");
  const parsedLocal = currentLocal ? JSON.parse(currentLocal) : {};
  const merged = { ...parsedLocal, ...values, id: values.id || parsedLocal.id || "local-child-id" };
  localStorage.setItem("cached_child_profile", JSON.stringify(merged));

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return merged as Child;

  if (values.id && values.id !== "local-child-id") {
    const { id, ...rest } = values;
    const { data, error } = await supabase
      .from("children")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("Supabase update child failed (using local fallback):", error);
      return merged as Child;
    }
    localStorage.setItem("cached_child_profile", JSON.stringify(data));
    return data as Child;
  }

  const { data, error } = await supabase
    .from("children")
    .insert({ ...values, user_id: userId, name: values.name ?? "Meu bebê" })
    .select()
    .single();
  if (error) {
    console.warn("Supabase insert child failed (using local fallback):", error);
    return merged as Child;
  }
  localStorage.setItem("cached_child_profile", JSON.stringify(data));
  return data as Child;
}

export async function fetchMoments(): Promise<Moment[]> {
  const { data, error } = await supabase
    .from("moments")
    .select("*, moment_media(*)")
    .order("happened_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    const local = localStorage.getItem("cached_moments");
    return local ? JSON.parse(local) : [];
  }
  localStorage.setItem("cached_moments", JSON.stringify(data ?? []));
  return (data as Moment[]) ?? [];
}

export async function createMoment(values: MomentInput, childId: string | null): Promise<Moment> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sessão expirada.");

  const { media, ...rest } = values;
  const { data: moment, error } = await supabase
    .from("moments")
    .insert({
      ...rest,
      user_id: userId,
      child_id: childId,
    })
    .select()
    .single();
  if (error) throw error;

  if (media && media.length > 0) {
    const mediaRows = media.map((m, idx) => ({
      user_id: userId,
      moment_id: moment.id,
      url: m.url,
      media_type: m.media_type,
      position: idx,
    }));
    await supabase.from("moment_media").insert(mediaRows);
  }

  return moment as Moment;
}

export async function updateMomentStory(id: string, story: string) {
  const { error } = await supabase
    .from("moments")
    .update({ story_text: story })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMoment(id: string) {
  const { error } = await supabase.from("moments").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return path;
}\n\nexport async function uploadCoverImage(childId: string, file: File): Promise<string> {\n  const path = `cover/${childId}/${file.name}`;\n  await uploadFile(file, path);\n  return path;\n}

export async function getSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function fetchCustomChapters() {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .order("position", { ascending: true });
    if (!error && data) {
      const formatted = data
        .filter((row) => row.title !== "__DELETED__")
        .map((row, idx) => ({
          slug: row.slug,
          index: row.position || 10 + idx,
          title: row.title.replace(/^\d+\.\s*/, ""),
          subtitle: row.subtitle || "Um capítulo especial da nossa história.",
        }));
      localStorage.setItem("cached_chapters", JSON.stringify(formatted));
      return formatted;
    }
  } catch (err) {}
  const cached = localStorage.getItem("cached_chapters");
  return cached ? JSON.parse(cached) : [];
}

export async function upsertCustomChapter(
  slug: string,
  title: string,
  subtitle?: string,
  position?: number
) {
  const cached = localStorage.getItem("cached_chapters");
  let list: any[] = cached ? JSON.parse(cached) : [];
  if (title === "__DELETED__") {
    list = list.filter((c) => c.slug !== slug);
  } else {
    const existingIdx = list.findIndex((c) => c.slug === slug);
    const newObj = { slug, title: title.replace(/^\d+\.\s*/, ""), subtitle: subtitle || "Um capítulo especial da nossa história.", index: position || 100 };
    if (existingIdx >= 0) list[existingIdx] = newObj;
    else list.push(newObj);
  }
  localStorage.setItem("cached_chapters", JSON.stringify(list));

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
      { onConflict: "user_id,slug" },
    );
  } catch (err) {
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
    } catch (e) {
      console.error("Failed to save custom chapter to db:", e);
    }
  }
}

export async function deleteCustomChapter(slug: string) {
  return upsertCustomChapter(slug, "__DELETED__", "", 999999);
}

export async function fetchCustomCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("categories" as any).select("name").order("created_at", { ascending: true });
    if (!error && data) {
      const names = data.map((r: any) => r.name);
      localStorage.setItem("custom_categories", JSON.stringify(names));
      return names;
    }
  } catch (err) {}
  const local = localStorage.getItem("custom_categories");
  return local ? JSON.parse(local) : ["Mesversário", "Primeira Vez", "Família", "Passeio", "Ultrassom"];
}

export async function upsertCustomCategory(name: string, oldName?: string) {
  const local = localStorage.getItem("custom_categories");
  let list: string[] = local ? JSON.parse(local) : ["Mesversário", "Primeira Vez", "Família", "Passeio", "Ultrassom"];
  if (oldName && list.includes(oldName)) {
    list = list.map((item) => (item === oldName ? name : item));
  } else if (!list.includes(name)) {
    list.push(name);
  }
  localStorage.setItem("custom_categories", JSON.stringify(list));

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  try {
    if (oldName) {
      await supabase.from("categories" as any).update({ name }).eq("user_id", userId).eq("name", oldName);
    } else {
      await supabase.from("categories" as any).upsert({ user_id: userId, name }, { onConflict: "user_id,name" });
    }
  } catch (err) {
    console.error("Failed to save category to Supabase:", err);
  }
}

export async function deleteCustomCategory(name: string) {
  const local = localStorage.getItem("custom_categories");
  if (local) {
    let list: string[] = JSON.parse(local);
    list = list.filter((item) => item !== name);
    localStorage.setItem("custom_categories", JSON.stringify(list));
  }
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  try {
    await supabase.from("categories" as any).delete().eq("user_id", userId).eq("name", name);
  } catch (err) {
    console.error("Failed to delete category from Supabase:", err);
  }
}

export type FeelingDef = { label: string; emoji: string };

export async function fetchCustomFeelings(): Promise<FeelingDef[]> {
  try {
    const { data, error } = await supabase.from("feelings" as any).select("label, emoji").order("created_at", { ascending: true });
    if (!error && data) {
      localStorage.setItem("custom_feelings", JSON.stringify(data));
      return data as FeelingDef[];
    }
  } catch (err) {}
  const local = localStorage.getItem("custom_feelings");
  return local ? JSON.parse(local) : [
    { label: "Amor infinito", emoji: "💖" },
    { label: "Paz e gratidão", emoji: "🕊️" },
    { label: "Muita emoção", emoji: "😭" },
    { label: "Encantada", emoji: "😍" },
    { label: "Abençoada", emoji: "🙏" },
  ];
}

export async function upsertCustomFeeling(label: string, emoji: string, oldLabel?: string) {
  const local = localStorage.getItem("custom_feelings");
  let list: FeelingDef[] = local ? JSON.parse(local) : [
    { label: "Amor infinito", emoji: "💖" },
    { label: "Paz e gratidão", emoji: "🕊️" },
    { label: "Muita emoção", emoji: "😭" },
    { label: "Encantada", emoji: "😍" },
    { label: "Abençoada", emoji: "🙏" },
  ];
  if (oldLabel) {
    list = list.map((item) => (item.label === oldLabel ? { label, emoji } : item));
  } else if (!list.some((item) => item.label === label)) {
    list.push({ label, emoji });
  }
  localStorage.setItem("custom_feelings", JSON.stringify(list));

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  try {
    if (oldLabel) {
      await supabase.from("feelings" as any).update({ label, emoji }).eq("user_id", userId).eq("label", oldLabel);
    } else {
      await supabase.from("feelings" as any).upsert({ user_id: userId, label, emoji }, { onConflict: "user_id,label" });
    }
  } catch (err) {
    console.error("Failed to save feeling to Supabase:", err);
  }
}

export async function deleteCustomFeeling(label: string) {
  const local = localStorage.getItem("custom_feelings");
  if (local) {
    let list: FeelingDef[] = JSON.parse(local);
    list = list.filter((item) => item.label !== label);
    localStorage.setItem("custom_feelings", JSON.stringify(list));
  }
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;
  try {
    await supabase.from("feelings" as any).delete().eq("user_id", userId).eq("label", label);
  } catch (err) {
    console.error("Failed to delete feeling from Supabase:", err);
  }
}
export async function fetchCoverSettings(childId: string): Promise<{ font: string; background_color: string; background_image_path: string | null } | null> {
  const { data, error } = await supabase
    .from('cover_settings')
    .select('font, background_color, background_image_path')
    .eq('child_id', childId)
    .maybeSingle();
  if (error) {
    console.warn('Failed to fetch cover settings:', error);
    return null;
  }
  return data as any;
}

export async function upsertCoverSettings(childId: string, values: { font?: string; background_color?: string; background_image_path?: string | null }): Promise<void> {
  const { error } = await supabase
    .from('cover_settings')
    .upsert({ child_id: childId, ...values }, { onConflict: 'child_id' });
  if (error) {
    console.error('Failed to upsert cover settings:', error);
    throw error;
  }
}
