"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Vault, VaultNote } from "@/lib/types";

export async function getPublicVaults(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ vaults: Vault[]; count: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("vaults")
      .select("*, owner:profiles(id, display_name, avatar_url)", { count: "exact" })
      .eq("is_public", true);

    if (options?.search) {
      query = query.ilike("name", `%${options.search}%`);
    }

    const limit = options?.limit ?? 24;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await query
      .order("note_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return { vaults: [], count: 0 };
    return { vaults: (data as Vault[]) ?? [], count: count ?? 0 };
  } catch {
    return { vaults: [], count: 0 };
  }
}

export async function getFeaturedVaults(): Promise<Vault[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vaults")
      .select("*, owner:profiles(id, display_name, avatar_url)")
      .eq("is_public", true)
      .order("note_count", { ascending: false })
      .limit(6);

    return (data as Vault[]) ?? [];
  } catch {
    return [];
  }
}

export async function getVaultByUserAndSlug(
  username: string,
  vaultSlug: string
): Promise<Vault | null> {
  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("display_name", username)
      .single();

    if (!profile) return null;

    const { data } = await supabase
      .from("vaults")
      .select("*, owner:profiles(id, display_name, avatar_url)")
      .eq("user_id", profile.id)
      .eq("slug", vaultSlug)
      .single();

    return data as Vault | null;
  } catch {
    return null;
  }
}

export async function getVaultNotes(
  vaultId: string,
  folderPath?: string
): Promise<VaultNote[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("vault_notes")
      .select("id, title, slug, folder_path, tags, downloads, token_count, is_public, created_at, updated_at")
      .eq("vault_id", vaultId)
      .eq("is_public", true);

    if (folderPath) {
      query = query.eq("folder_path", folderPath);
    }

    const { data, error } = await query.order("folder_path").order("title");

    if (error) return [];
    return (data as VaultNote[]) ?? [];
  } catch {
    return [];
  }
}

export async function getVaultNote(
  vaultId: string,
  noteSlug: string
): Promise<VaultNote | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vault_notes")
      .select("*, vault:vaults(*, owner:profiles(id, display_name, avatar_url))")
      .eq("vault_id", vaultId)
      .eq("slug", noteSlug)
      .single();

    return data as VaultNote | null;
  } catch {
    return null;
  }
}

export async function getUserVaults(): Promise<Vault[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("vaults")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data as Vault[]) ?? [];
  } catch {
    return [];
  }
}

export async function getUserVaultBySlug(slug: string): Promise<Vault | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("vaults")
      .select("*")
      .eq("user_id", user.id)
      .eq("slug", slug)
      .single();

    return data as Vault | null;
  } catch {
    return null;
  }
}

export async function getUserVaultNotes(vaultId: string): Promise<VaultNote[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("vault_notes")
      .select("id, title, slug, folder_path, tags, token_count, is_public, downloads, created_at, updated_at")
      .eq("vault_id", vaultId)
      .eq("user_id", user.id)
      .order("folder_path")
      .order("title");

    if (error) return [];
    return (data as VaultNote[]) ?? [];
  } catch {
    return [];
  }
}

export async function createVault(formData: FormData): Promise<{ slug: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const isPublic = formData.get("is_public") !== "false";

  if (!name || name.length < 1 || name.length > 100) {
    return { error: "Name must be 1-100 characters" };
  }

  const slug = slugify(name);

  const { error } = await supabase.from("vaults").insert({
    user_id: user.id,
    name,
    slug,
    description: description || null,
    is_public: isPublic,
  });

  if (error) {
    if (error.code === "23505") return { error: "You already have a vault with this name" };
    return { error: error.message };
  }

  return { slug };
}

export async function deleteVault(vaultId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vaults")
    .delete()
    .eq("id", vaultId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function deleteNote(noteId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vault_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function getVaultFolders(vaultId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vault_notes")
      .select("folder_path")
      .eq("vault_id", vaultId);

    if (!data) return ["/"];

    const folders = new Set<string>(["/"]);
    for (const note of data) {
      folders.add(note.folder_path);
    }
    return Array.from(folders).sort();
  } catch {
    return ["/"];
  }
}
