import { GetForm } from '@/app/actions/form';
import React from 'react';
import FormCard from './FormCard';

export default async function FormCards() {
  try {
    const formsList = await GetForm();

    return (
      <>
        {formsList.map((f: any) => (
          <FormCard
            key={f.id}
            form={f}
          />
        ))}
      </>
    );
  } catch (error) {
    console.error('Failed to load form cards', error);
    return (
      <div className="col-span-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Forms are temporarily unavailable. Please refresh the page.
      </div>
    );
  }
}
