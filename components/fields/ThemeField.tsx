'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from '@/app/(dashboard)/_components/FormElements';
import { Palette } from 'lucide-react';

const type: ElementsType = 'ThemeField';

const extraAttributes = {
  themeId: 'orange-waves',
  primaryColor: '#ea580c',
  textureStyle: 'orange-waves',
  customHex: '',
};

export const ThemeFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Palette className="h-8 w-8 text-orange-500" />,
    label: 'Form Theme',
  },
  designerComponent: () => null,
  formComponent: () => null,
  propertiesComponent: () => null,
  validate: () => true,
};
