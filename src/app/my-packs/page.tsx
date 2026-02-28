import { createClient } from "@/lib/supabase/server";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Submission } from "@/lib/types";

export const metadata = {
  title: "My Packs — CodexLib",
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  draft: { icon: FileText, color: "text-muted", label: "Draft" },
  pending: { icon: Clock, color: "text-yellow-400", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-green-400", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-400", label: "Rejected" },
};

export default async function MyPacksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, domain:domains(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (submissions ?? []) as (Submission & { domain?: { name: string } })[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">
        My <span className="text-gold">Packs</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No submissions yet.</p>
          <a href="/submit" className="text-gold hover:text-gold-light text-sm">
            Submit your first knowledge pack
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const cfg = statusConfig[item.status];
            const Icon = cfg.icon;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      {item.domain?.name} &middot; {item.difficulty}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-sm ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                    {cfg.label}
                  </span>
                </div>
                {item.token_count && (
                  <p className="text-xs text-muted mt-2">
                    {item.token_count} tokens compressed
                  </p>
                )}
                {item.status === "rejected" && item.flagged_reasons && (
                  <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {item.flagged_reasons.join(", ")}
                    </p>
                    {item.reviewer_notes && (
                      <p className="text-xs text-muted mt-1">
                        {item.reviewer_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
