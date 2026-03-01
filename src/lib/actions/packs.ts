"use server";

import { createClient } from "@/lib/supabase/server";
import type { Pack, Domain, Subdomain } from "@/lib/types";

export async function getDomains(): Promise<Domain[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("name");

    if (error) return [];
    return data as Domain[];
  } catch {
    return [];
  }
}

export async function getDomainBySlug(slug: string): Promise<Domain | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("domains")
      .select("*")
      .eq("slug", slug)
      .single();

    return data as Domain | null;
  } catch {
    return null;
  }
}

export async function getSubdomains(domainId: string): Promise<Subdomain[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subdomains")
      .select("*")
      .eq("domain_id", domainId)
      .order("name");

    if (error) return [];
    return data as Subdomain[];
  } catch {
    return [];
  }
}

export async function getSubdomainBySlug(
  domainId: string,
  slug: string
): Promise<Subdomain | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subdomains")
      .select("*")
      .eq("domain_id", domainId)
      .eq("slug", slug)
      .single();

    return data as Subdomain | null;
  } catch {
    return null;
  }
}

export async function getPacks(options?: {
  domainId?: string;
  subdomainId?: string;
  difficulty?: string;
  isFree?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ packs: Pack[]; count: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("packs")
      .select("*, domain:domains(*), subdomain:subdomains(*)", { count: "exact" })
      .eq("status", "approved");

    if (options?.domainId) query = query.eq("domain_id", options.domainId);
    if (options?.subdomainId) query = query.eq("subdomain_id", options.subdomainId);
    if (options?.difficulty) query = query.eq("difficulty", options.difficulty);
    if (options?.isFree !== undefined) query = query.eq("is_free", options.isFree);
    if (options?.search) query = query.ilike("title", `%${options.search}%`);

    const limit = options?.limit ?? 24;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await query
      .order("downloads", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return { packs: [], count: 0 };
    return { packs: (data as Pack[]) ?? [], count: count ?? 0 };
  } catch {
    return { packs: [], count: 0 };
  }
}

export async function getPackBySlug(slug: string): Promise<Pack | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("packs")
      .select("*, domain:domains(*), subdomain:subdomains(*), author:profiles(*)")
      .eq("slug", slug)
      .single();

    return data as Pack | null;
  } catch {
    return null;
  }
}

export async function getFeaturedPacks(): Promise<Pack[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("packs")
      .select("*, domain:domains(*)")
      .eq("status", "approved")
      .eq("is_free", true)
      .order("downloads", { ascending: false })
      .limit(6);

    return (data as Pack[]) ?? [];
  } catch {
    return [];
  }
}
