export function normalizeBaseUrl(value?: string | null) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('localhost')) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

export function getAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  const host = process.env.VERCEL_URL || process.env.HOSTNAME || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  return `${protocol}://${host}`.replace(/\/+$/, '');
}

export function generateCustomSlug(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  let namePart = '';
  if (clean.length >= 6) {
    const first3 = clean.slice(0, 3);
    const last3 = clean.slice(-3);
    namePart = `${first3}${last3}`;
  } else if (clean.length > 0) {
    namePart = clean;
  } else {
    namePart = 'form';
  }

  const randomHash = Math.random().toString(36).substring(2, 8);
  return `${namePart}-${randomHash}`;
}

export function buildFormSubmitUrl(formUrl: string, source?: 'qr' | 'link' | string) {
  const cleanFormUrl = formUrl.replace(/^\/+/, '');
  const url = new URL(`/form/${cleanFormUrl}`, getAppBaseUrl());

  if (source) {
    url.searchParams.set('source', source);
  }

  return url.toString();
}
