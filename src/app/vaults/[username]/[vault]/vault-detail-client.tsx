"use client";

import { useState, useMemo } from "react";
import { FolderTree } from "@/components/folder-tree";
import { NoteCard } from "@/components/note-card";
import type { VaultNote } from "@/lib/types";

export function VaultDetailClient({
  notes,
  folders,
  basePath,
}: {
  notes: VaultNote[];
  folders: string[];
  basePath: string;
}) {
  const [activePath, setActivePath] = useState("/");

  const filteredNotes = useMemo(() => {
    if (activePath === "/") return notes;
    return notes.filter((n) => n.folder_path === activePath);
  }, [notes, activePath]);

  return (
    <div className="flex gap-8">
      {/* Folder sidebar */}
      {folders.length > 1 && (
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border bg-surface p-3">
            <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-2">
              Folders
            </h3>
            <FolderTree
              folders={folders}
              activePath={activePath}
              onSelect={setActivePath}
            />
          </div>
        </aside>
      )}

      {/* Notes grid */}
      <div className="flex-1 min-w-0">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} basePath={basePath} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted">
            <p>No notes in this folder.</p>
          </div>
        )}
      </div>
    </div>
  );
}
