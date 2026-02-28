"use server";

import { createClient } from "@/lib/supabase/server";
import type { Pack, Domain, Subdomain } from "@/lib/types";

export async function getDomains(): Promise<Domain[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data as Domain[];
}

export async function getDomainBySlug(slug: string): Promise<Domain | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("domains")
    .select("*")
    .eq("slug", slug)
    .single();

  return data as Domain | null;
}

export async function getSubdomains(domainId: string): Promise<Subdomain[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subdomains")
    .select("*")
    .eq("domain_id", domainId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as Subdomain[];
}

export async function getSubdomainBySlug(
  domainId: string,
  slug: string
): Promise<Subdomain | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subdomains")
    .select("*")
    .eq("domain_id", domainId)
    .eq("slug", slug)
    .single();

  return data as Subdomain | null;
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

  if (error) throw new Error(error.message);
  return { packs: (data as Pack[]) ?? [], count: count ?? 0 };
}

export async function getPackBySlug(slug: string): Promise<Pack | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packs")
    .select("*, domain:domains(*), subdomain:subdomains(*), author:profiles(*)")
    .eq("slug", slug)
    .single();

  return data as Pack | null;
}

export async function getFeaturedPacks(): Promise<Pack[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packs")
    .select("*, domain:domains(*)")
    .eq("status", "approved")
    .eq("is_free", true)
    .order("downloads", { ascending: false })
    .limit(6);

  return (data as Pack[]) ?? [];
}
