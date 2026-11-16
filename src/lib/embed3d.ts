export function extract3dEmbedUrl(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  let candidate = trimmed;

  if (/<iframe\b/i.test(trimmed)) {
    const srcMatch = trimmed.match(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    if (!srcMatch) return null;
    candidate = (srcMatch[1] || srcMatch[2] || srcMatch[3] || '').trim();
  }

  candidate = candidate.replace(/&amp;/gi, '&');

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}
