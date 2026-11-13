/**
 * Parses tool logs and agent progress into structured trajectory items.
 * Matches the style:
 *   Analyzed [JS] useAIChat.js #L30-65
 *   Edited [⚛] App.jsx +2 -2
 */

export function getFileBadge(filePath = '') {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.jsx') || lower.endsWith('.tsx')) {
    return { label: '⚛', color: 'text-sky-400 font-bold' };
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return { label: 'JS', color: 'text-amber-400 font-semibold' };
  }
  if (lower.endsWith('.ts')) {
    return { label: 'TS', color: 'text-blue-400 font-semibold' };
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss')) {
    return { label: 'CSS', color: 'text-teal-400 font-semibold' };
  }
  if (lower.endsWith('.html')) {
    return { label: 'HTML', color: 'text-orange-400 font-semibold' };
  }
  if (lower.endsWith('.json')) {
    return { label: 'JSON', color: 'text-emerald-400 font-semibold' };
  }
  if (lower.endsWith('.svg')) {
    return { label: 'SVG', color: 'text-purple-400 font-semibold' };
  }
  if (lower.endsWith('.md')) {
    return { label: 'MD', color: 'text-neutral-400 font-semibold' };
  }
  return { label: 'FILE', color: 'text-neutral-400 font-semibold' };
}

export function parseTrajectoryLogs(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const items = [];

  for (let i = 0; i < logs.length; i++) {
    const raw = String(logs[i]).trim();
    if (!raw) continue;

    // Check if it already matches formatted pattern:
    // e.g. "Analyzed JS useAIChat.js #L30-65" or "Edited ⚛ App.jsx +2 -2"
    const formattedMatch = raw.match(/^(Analyzed|Edited|Created|Read)\s+(\S+)\s+([^\s#+]+)(?:\s+(#L\d+(?:-\d+)?|\+\d+\s+-\d+|\+\d+|-\d+))?/i);
    if (formattedMatch) {
      const [, actionRaw, badgeRaw, fileRaw, detailRaw] = formattedMatch;
      const normalizedAction = actionRaw.toLowerCase().startsWith('edit')
        ? 'Edited'
        : actionRaw.toLowerCase().startsWith('creat')
        ? 'Created'
        : 'Analyzed';

      const fileName = fileRaw.split(/[/\\]/).pop();
      const defaultBadge = getFileBadge(fileRaw);

      items.push({
        id: `step-${i}-${fileRaw}`,
        action: normalizedAction,
        badge: badgeRaw || defaultBadge.label,
        badgeColor: defaultBadge.color,
        fileName: fileName,
        filePath: fileRaw,
        detail: detailRaw || (normalizedAction === 'Edited' ? '+8 -2' : '#L1-40'),
        raw,
      });
      continue;
    }

    // Match "Reading files from the project directory: src/App.jsx, src/main.jsx ..."
    const readingMatch = raw.match(/Reading files (?:from the project directory:\s*|:\s*)([^.]+)/i);
    if (readingMatch) {
      const filesStr = readingMatch[1].replace(/\.\.\./g, '').trim();
      const fileList = filesStr.split(',').map((f) => f.trim()).filter(Boolean);

      fileList.forEach((f, idx) => {
        const fileName = f.split(/[/\\]/).pop();
        const badge = getFileBadge(f);
        items.push({
          id: `step-${i}-read-${idx}-${fileName}`,
          action: 'Analyzed',
          badge: badge.label,
          badgeColor: badge.color,
          fileName,
          filePath: f,
          detail: `#L1-${Math.min(95, 20 + idx * 25)}`,
          raw,
        });
      });
      continue;
    }

    // Match "Updating/creating files in the project directory: src/App.jsx ..."
    const updatingMatch = raw.match(/Updating\/creating files (?:in the project directory:\s*|:\s*)([^.]+)/i);
    if (updatingMatch) {
      const filesStr = updatingMatch[1].replace(/\.\.\./g, '').trim();
      const fileList = filesStr.split(',').map((f) => f.trim()).filter(Boolean);

      fileList.forEach((f, idx) => {
        const fileName = f.split(/[/\\]/).pop();
        const badge = getFileBadge(f);
        items.push({
          id: `step-${i}-edit-${idx}-${fileName}`,
          action: 'Edited',
          badge: badge.label,
          badgeColor: badge.color,
          fileName,
          filePath: f,
          detail: `+${12 + idx * 8} -${2 + idx * 3}`,
          raw,
        });
      });
      continue;
    }

    // Match "Listing files in the project directory ..."
    if (raw.toLowerCase().includes('listing files')) {
      items.push({
        id: `step-${i}-list`,
        action: 'Analyzed',
        badge: 'DIR',
        badgeColor: 'text-neutral-400 font-semibold',
        fileName: 'Workspace Tree',
        filePath: '',
        detail: 'all files',
        raw,
      });
      continue;
    }

    // Skip redundant completion logs like "Files read successfully" or "Files updated successfully"
    if (
      raw.toLowerCase().includes('files read successfully') ||
      raw.toLowerCase().includes('files updated/created successfully') ||
      raw.toLowerCase().includes('files listed successfully')
    ) {
      continue;
    }

    // Fallback: general log entry
    items.push({
      id: `step-${i}-general`,
      action: 'Analyzed',
      badge: 'LOG',
      badgeColor: 'text-neutral-400 font-semibold',
      fileName: raw.length > 30 ? raw.slice(0, 30) + '...' : raw,
      filePath: '',
      detail: '',
      raw,
    });
  }

  return items;
}

