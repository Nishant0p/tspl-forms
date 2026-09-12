'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const FormBuilder = dynamic(
  () => import('@/app/(dashboard)/_components/FormBuilder'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-60px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading Form Builder...</p>
        </div>
      </div>
    ),
  }
);

export default function FormBuilderClientWrapper(props: {
  form: any;
  departments: any[];
  branches: any[];
  employees: any[];
}) {
  return <FormBuilder {...props} />;
}
