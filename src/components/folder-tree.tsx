"use client";

import { Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

function buildTree(paths: string[]): FolderNode[] {
  const root: FolderNode[] = [];

  for (const path of paths) {
    if (path === "/") continue;
    const parts = path.replace(/^\//, "").split("/");
    let current = root;

    let builtPath = "";
    for (const part of parts) {
      builtPath += `/${part}`;
      let node = current.find((n) => n.name === part);
      if (!node) {
        node = { name: part, path: builtPath, children: [] };
        current.push(node);
      }
      current = node.children;
    }
  }

  return root;
}

function FolderItem({
  node,
  activePath,
  onSelect,
  depth,
}: {
  node: FolderNode;
  activePath: string;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const isActive = activePath === node.path;
  const Icon = isActive ? FolderOpen : Folder;

  return (
    <div>
      <button
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover",
          isActive && "bg-surface-hover text-gold"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map((child) => (
        <FolderItem
          key={child.path}
          node={child}
          activePath={activePath}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function FolderTree({
  folders,
  activePath,
  onSelect,
}: {
  folders: string[];
  activePath: string;
  onSelect: (path: string) => void;
}) {
  const tree = buildTree(folders);

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => onSelect("/")}
        className={cn(
          "flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover",
          activePath === "/" && "bg-surface-hover text-gold"
        )}
      >
        <FolderOpen className="h-4 w-4 shrink-0" />
        <span>All Notes</span>
      </button>
      {tree.map((node) => (
        <FolderItem
          key={node.path}
          node={node}
          activePath={activePath}
          onSelect={onSelect}
          depth={1}
        />
      ))}
    </div>
  );
}
