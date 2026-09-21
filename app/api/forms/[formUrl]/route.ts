import { NextRequest, NextResponse } from 'next/server';
import { GetFormContentByUrl, SubmitForm } from '@/app/actions/form';
import { FormAccessBlockedError } from '@/lib/form-access';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { formUrl: string } | Promise<{ formUrl: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const formUrl = resolvedParams?.formUrl;

    if (!formUrl) {
      return NextResponse.json(
        { success: false, error: 'Form identifier is required.' },
        { status: 400 }
      );
    }

    const form = await GetFormContentByUrl(formUrl);
    return NextResponse.json({
      success: true,
      form,
    });
  } catch (error: any) {
    if (error?.message === 'Form not found') {
      return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });
    }

    if (error instanceof FormAccessBlockedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch form.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { formUrl: string } | Promise<{ formUrl: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const formUrl = resolvedParams?.formUrl;

    if (!formUrl) {
      return NextResponse.json(
        { success: false, error: 'Form identifier is required.' },
        { status: 400 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request format.' },
        { status: 400 }
      );
    }

    const rawContent = body?.content !== undefined ? body.content : body;
    const contentString = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

    const result = await SubmitForm(formUrl, contentString);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to submit form.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error during form submission.' },
      { status: 500 }
    );
  }
}
