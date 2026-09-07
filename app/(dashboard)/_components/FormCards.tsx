import { GetForm } from '@/app/actions/form';
import React from 'react';
import FormCard from './FormCard';

export default async function FormCards() {
  try {
    const formsList = await GetForm();

    if (!formsList || formsList.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 my-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <span className="text-xl">📋</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold">No forms created yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first form to start collecting responses and data.
          </p>
        </div>
      );
    }

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
