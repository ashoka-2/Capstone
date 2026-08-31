import {
  FileCode2,
  FileJson,
  FileType,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileCog,
  FileBadge,
  FileCheck2,
  Folder,
  FolderOpen,
  Atom,
  Palette,
  Code2,
} from "lucide-react";

export function getFileIcon(filename, isFolder = false, isOpen = false) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400/90 shrink-0" />
    );
  }

  const lower = filename.toLowerCase();
  const ext = lower.split(".").pop();

  if (lower.endsWith(".jsx") || lower.endsWith(".tsx")) {
    return <Atom className="w-4 h-4 text-cyan-400 shrink-0" />;
  }

  if (lower.endsWith(".js") || lower.endsWith(".mjs")) {
    return <Code2 className="w-4 h-4 text-yellow-400 shrink-0" />;
  }

  if (lower.endsWith(".ts")) {
    return <Code2 className="w-4 h-4 text-blue-400 shrink-0" />;
  }

  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".sass")) {
    return <Palette className="w-4 h-4 text-pink-400 shrink-0" />;
  }

  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return <FileCode2 className="w-4 h-4 text-orange-400 shrink-0" />;
  }

  if (lower.endsWith(".json")) {
    return <FileJson className="w-4 h-4 text-amber-300 shrink-0" />;
  }

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".ico") ||
    lower.endsWith(".bmp") ||
    lower.endsWith(".avif") ||
    lower.endsWith(".tiff") ||
    lower.endsWith(".tif") ||
    lower.endsWith(".jfif")
  ) {
    return <FileImage className="w-4 h-4 text-purple-400 shrink-0" />;
  }

  if (lower.endsWith(".md") || lower.endsWith(".mdx") || lower.endsWith(".txt")) {
    return <FileText className="w-4 h-4 text-slate-300 shrink-0" />;
  }

  if (
    lower.startsWith(".env") ||
    lower.includes("config") ||
    lower.startsWith(".git") ||
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml") ||
    lower.endsWith("dockerfile")
  ) {
    return <FileCog className="w-4 h-4 text-neutral-400 shrink-0" />;
  }

  return <FileCode2 className="w-4 h-4 text-neutral-400 shrink-0" />;
}

export function isImageFile(filename) {
  if (!filename) return false;
  const clean = filename.split("?")[0].toLowerCase().trim();
  return (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".svg") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".ico") ||
    clean.endsWith(".bmp") ||
    clean.endsWith(".avif") ||
    clean.endsWith(".tiff") ||
    clean.endsWith(".tif") ||
    clean.endsWith(".jfif")
  );
}
