import { CheckBoxFieldFormElement } from '@/components/fields/CheckboxField';
import { DateFieldFormElement } from '@/components/fields/DateField';
import { EmailFieldFormElement } from '@/components/fields/EmailField';
import { FileUploadFieldFormElement } from '@/components/fields/FileUploadField';
import { ImageFieldFormElement } from '@/components/fields/ImageField';
import { LinearScaleFieldFormElement } from '@/components/fields/LinearScaleField';
import { PhoneFieldFormElement } from '@/components/fields/PhoneField';
import { NumberFieldFormElement } from '@/components/fields/NumberField';
import { ParagraphFieldFormElement } from '@/components/fields/ParagraphField';
import { RadioFieldFormElement } from '@/components/fields/RadioField';
import { RatingFieldFormElement } from '@/components/fields/RatingField';
import { SelectFieldFormElement } from '@/components/fields/SelectField';
import { SeparatorFieldFormElement } from '@/components/fields/SeperatorField';
import { SectionHeaderFieldFormElement } from '@/components/fields/SectionHeaderField';
import { SpacerFieldFormElement } from '@/components/fields/SpacerField';
import { SubTitleFieldFormElement } from '@/components/fields/SubTitleField';
import { SignatureFieldFormElement } from '@/components/fields/SignatureField';
import { TextFieldFormElement } from '@/components/fields/TextField';
import { TextAreaFieldFormElement } from '@/components/fields/TextareaField';
import { TitleFieldFormElement } from '@/components/fields/TitleField';
import { TimeFieldFormElement } from '@/components/fields/TimeField';
import { VideoFieldFormElement } from '@/components/fields/VideoField';
import { BannerFieldFormElement } from '@/components/fields/BannerField';
import { ThankYouFieldFormElement } from '@/components/fields/ThankYouField';

export type ElementsType =
  'TextField'
  | 'TitleField'
  | 'SubTitleField'
  | 'ParagraphField'
  | 'SeperatorField'
  | 'SpacerField'
  | 'NumberField'
  | 'TextAreaField'
  | 'DateField'
  | 'TimeField'
  | 'EmailField'
  | 'PhoneField'
  | 'SelectField'
  | 'RadioField'
  | 'CheckboxField'
  | 'RatingField'
  | 'LinearScaleField'
  | 'FileUploadField'
  | 'SignatureField'
  | 'ImageField'
  | 'VideoField'
  | 'SectionHeaderField'
  | 'BannerField'
  | 'ThankYouField';

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
  type: ElementsType;

  construct: (id: string) => FormElementInstance;

  designerBtnElement: {
    icon: React.ReactNode;
    label: string;
  };

  designerComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;
  formComponent: React.FC<{
    elementInstance: FormElementInstance;
    submitFunction?: SubmitFunction;
    isInvalid?: boolean;
    defaultValues?: string;
  }>;
  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

export type FormElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};

type FormElementsType = {
  [key in ElementsType]: FormElement;
};

export const FormElements: FormElementsType = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  ParagraphField: ParagraphFieldFormElement,
  SeperatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFieldFormElement,
  DateField: DateFieldFormElement,
  TimeField: TimeFieldFormElement,
  EmailField: EmailFieldFormElement,
  PhoneField: PhoneFieldFormElement,
  SelectField: SelectFieldFormElement,
  RadioField: RadioFieldFormElement,
  CheckboxField: CheckBoxFieldFormElement,
  RatingField: RatingFieldFormElement,
  LinearScaleField: LinearScaleFieldFormElement,
  FileUploadField: FileUploadFieldFormElement,
  SignatureField: SignatureFieldFormElement,
  ImageField: ImageFieldFormElement,
  VideoField: VideoFieldFormElement,
  SectionHeaderField: SectionHeaderFieldFormElement,
  BannerField: BannerFieldFormElement,
  ThankYouField: ThankYouFieldFormElement,
};
