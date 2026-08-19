import { GetForm } from '@/app/actions/form';
import React from 'react';
import FormCard from './FormCard';

export default async function FormCards() {
  try {
    const form = await GetForm();

    return (
      <>
        {form.map((form) => (
          <FormCard
            key={form.id}
            form={form}
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
