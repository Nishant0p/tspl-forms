'use client';

import React from 'react';
import FormCollaboratorsModal from '@/components/FormCollaboratorsModal';

type FormViewerManagerProps = {
  formId: number;
  formName: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
};

export default function FormViewerManager({ formId, formName, trigger, iconOnly }: FormViewerManagerProps) {
  return (
    <FormCollaboratorsModal
      formId={formId}
      formName={formName}
      trigger={trigger}
      iconOnly={iconOnly}
    />
  );
}

