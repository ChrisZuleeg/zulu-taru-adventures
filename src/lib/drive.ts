export function driveFileId(url: string): string | null {
  // Supports common Google Drive URL formats:
  // - /file/d/<id>/view
  // - /d/<id>/...
  // - ?id=<id>
  try {
    const parsed = new URL(url);
    const queryId = parsed.searchParams.get("id");
    if (queryId) return queryId;

    const pathMatch = parsed.pathname.match(/\/d\/([^/]+)/);
    if (pathMatch) return pathMatch[1];
  } catch {
    // Ignore invalid URLs and fall through to null.
  }

  const fallbackPathMatch = url.match(/\/d\/([^/]+)/);
  return fallbackPathMatch ? fallbackPathMatch[1] : null;
}

export function driveEmbedUrl(url: string): string {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

export function driveThumbnailUrl(url: string): string {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w600` : url;
}

export function driveDirectImageUrl(url: string): string {
  const id = driveFileId(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w1200` : url;
}

export function imageProxyJpegUrl(url: string): string {
  if (!url) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=85`;
}
