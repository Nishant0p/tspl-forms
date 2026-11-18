import { NextRequest, NextResponse } from 'next/server';
import { migrateAllUploadsToCDN } from '@/lib/migrate-uploads';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  try {
    const result = await migrateAllUploadsToCDN();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Migrate Uploads Route Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Migration failed.' },
      { status: 500 }
    );
  }
}

export async function GET(_req: NextRequest) {
  try {
    const result = await migrateAllUploadsToCDN();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Migrate Uploads Route Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Migration failed.' },
      { status: 500 }
    );
  }
}
