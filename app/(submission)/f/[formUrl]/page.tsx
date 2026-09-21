import { redirect } from 'next/navigation';

export default async function FSlugRedirectPage({
  params,
  searchParams,
}: {
  params: { formUrl: string } | Promise<{ formUrl: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearch = await Promise.resolve(searchParams);

  const query = new URLSearchParams();
  if (resolvedSearch) {
    Object.entries(resolvedSearch).forEach(([key, val]) => {
      if (typeof val === 'string') {
        query.set(key, val);
      } else if (Array.isArray(val)) {
        val.forEach((v) => query.append(key, v));
      }
    });
  }

  const queryString = query.toString();
  const target = `/form/${encodeURIComponent(resolvedParams.formUrl)}${queryString ? `?${queryString}` : ''}`;

  redirect(target);
}
