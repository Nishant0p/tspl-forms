import { redirect } from 'next/navigation';

export default function FormResponsesRedirectPage({
  params,
}: {
  params: { formUrl: string };
}) {
  redirect(`/responses/${params.formUrl}`);
}
