'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import {
  Landmark,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplBankIfscField';

const extraAttributes = {
  label: 'Bank IFSC Code',
  helperText: '',
  required: false,
  placeholder: 'SBIN0000001',
  autoFetch: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(80),
  helperText: z.string().optional(),
  required: z.boolean().default(false),
  placeholder: z.string().max(30),
  autoFetch: z.boolean().default(true),
});

// Standard IFSC format: 4 letters, 0, 6 alphanumeric
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export type BankIfscData = {
  ifsc: string;
  bank: string;
  branch: string;
  city?: string;
  district?: string;
  state?: string;
  address?: string;
  micr?: string;
  upi?: boolean;
  neft?: boolean;
  rtgs?: boolean;
  imps?: boolean;
  formatted: string;
};

export const TsplBankIfscFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    label: 'Bank IFSC',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const val = (currentValue || '').trim();

    if (!val) {
      return !element.extraAttributes.required;
    }

    try {
      const parsed = JSON.parse(val);
      const code = (parsed.ifsc || '').trim().toUpperCase();
      if (element.extraAttributes.required) {
        return Boolean(code && ifscRegex.test(code));
      }
      return !code || ifscRegex.test(code);
    } catch {
      const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (element.extraAttributes.required) {
        return ifscRegex.test(clean);
      }
      return !clean || ifscRegex.test(clean);
    }
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      autoFetch: element.extraAttributes.autoFetch ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      autoFetch: element.extraAttributes.autoFetch ?? true,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        placeholder: data.placeholder,
        required: data.required,
        autoFetch: data.autoFetch,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placeholder</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Required</FormLabel>
                <FormDescription className="text-xs">
                  Respondents must provide and verify a valid Bank IFSC code.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(val) => {
                    field.onChange(val);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoFetch"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Auto-fetch on 11 Characters</FormLabel>
                <FormDescription className="text-xs">
                  Automatically queries Razorpay IFSC API when 11 characters are entered.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(val) => {
                    field.onChange(val);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, placeholder = 'SBIN0000001' } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Landmark className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-wider">
            Razorpay IFSC API
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              disabled
              placeholder={placeholder}
              value="SBIN0000001"
              className="h-9 text-xs pl-8 font-mono tracking-wider uppercase bg-background/50"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          </div>
          <Button disabled size="sm" variant="secondary" className="h-9 text-xs px-3 gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Verified
          </Button>
        </div>

        {/* Live Detected Bank Card Preview */}
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>State Bank of India</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              KOLKATA MAIN
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground">
            <Badge variant="secondary" className="text-[9px] bg-background/80 border py-0 px-1.5">
              City: Kolkata
            </Badge>
            <Badge variant="secondary" className="text-[9px] bg-background/80 border py-0 px-1.5">
              State: West Bengal
            </Badge>
            <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30 py-0 px-1.5">
              UPI • NEFT • RTGS • IMPS
            </Badge>
          </div>
        </div>
      </div>

      </div>
  );
}

function FormComponent({
  elementInstance,
  submitFunction,
  isInvalid,
  defaultValues,
}: {
  elementInstance: FormElementInstance;
  submitFunction?: SubmitFunction;
  isInvalid?: boolean;
  defaultValues?: string;
}) {
  const element = elementInstance as CustomInstance;
  const {
    label,
    helperText,
    required,
    placeholder = 'SBIN0000001',
    autoFetch = true,
  } = element.extraAttributes;

  const parseInitial = (): { ifsc: string; bankData: BankIfscData | null } => {
    if (!defaultValues) return { ifsc: '', bankData: null };
    try {
      const parsed = JSON.parse(defaultValues);
      if (parsed?.ifsc) {
        return {
          ifsc: parsed.ifsc,
          bankData: parsed,
        };
      }
      return { ifsc: defaultValues, bankData: null };
    } catch {
      return { ifsc: defaultValues, bankData: null };
    }
  };

  const initial = parseInitial();
  const [ifsc, setIfsc] = useState<string>(initial.ifsc.toUpperCase());
  const [bankData, setBankData] = useState<BankIfscData | null>(initial.bankData);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const dispatchUpdate = (cleanIfsc: string, data: BankIfscData | null) => {
    if (!submitFunction) return;

    if (!cleanIfsc) {
      setError(required);
      submitFunction(element.id, '');
      return;
    }

    if (data) {
      const jsonString = JSON.stringify(data);
      const valid = TsplBankIfscFieldFormElement.validate(element, jsonString);
      setError(!valid);
      submitFunction(element.id, jsonString);
    } else {
      const valid = TsplBankIfscFieldFormElement.validate(element, cleanIfsc);
      setError(!valid);
      submitFunction(element.id, cleanIfsc);
    }
  };

  const fetchBankDetails = async (codeToFetch: string) => {
    const cleanCode = codeToFetch.trim().toUpperCase();
    if (!ifscRegex.test(cleanCode)) {
      setApiError('IFSC must be 11 characters (e.g. SBIN0000001, 5th character is 0).');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`https://ifsc.razorpay.com/${cleanCode}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('IFSC code not found. Please verify the code.');
        }
        throw new Error(`Lookup failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data && data.BANK) {
        const payload: BankIfscData = {
          ifsc: cleanCode,
          bank: data.BANK || '',
          branch: data.BRANCH || '',
          city: data.CITY || '',
          district: data.DISTRICT || '',
          state: data.STATE || '',
          address: data.ADDRESS || '',
          micr: data.MICR || '',
          upi: Boolean(data.UPI),
          neft: Boolean(data.NEFT),
          rtgs: Boolean(data.RTGS),
          imps: Boolean(data.IMPS),
          formatted: `${cleanCode} — ${data.BANK}${data.BRANCH ? ` (${data.BRANCH})` : ''}`,
        };

        setBankData(payload);
        setApiError(null);
        dispatchUpdate(cleanCode, payload);
      } else {
        throw new Error('No bank records found for this IFSC code.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setBankData(null);
      setApiError(err?.message || 'Could not verify IFSC code.');
      dispatchUpdate(cleanCode, null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    setIfsc(sanitized);
    setApiError(null);
    if (!isTouched) setIsTouched(true);

    if (bankData && bankData.ifsc !== sanitized) {
      setBankData(null);
    }

    dispatchUpdate(sanitized, null);

    if (autoFetch && sanitized.length === 11 && ifscRegex.test(sanitized)) {
      fetchBankDetails(sanitized);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (ifsc.length === 11 && ifscRegex.test(ifsc) && (!bankData || bankData.ifsc !== ifsc)) {
      fetchBankDetails(ifsc);
    } else {
      dispatchUpdate(ifsc, bankData);
    }
  };

  const handleReset = () => {
    setIfsc('');
    setBankData(null);
    setApiError(null);
    setError(required);
    if (submitFunction) {
      submitFunction(element.id, '');
    }
  };

  const isValidCode = ifsc.length === 11 && ifscRegex.test(ifsc);

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            (error || apiError) && 'text-red-500'
          )}
        >
          <Landmark className="h-4 w-4 text-primary shrink-0" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>

        <div className="flex items-center gap-2">
          {ifsc.length > 0 && (
            <span
              className={cn(
                'text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md',
                isValidCode
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              {ifsc.length}/11 chars
            </span>
          )}
          {bankData && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Bank Verified
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={ifsc}
              type="text"
              maxLength={11}
              placeholder={placeholder || 'SBIN0000001'}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'h-10 font-mono tracking-wider uppercase text-sm pl-9 transition-colors',
                (error || apiError) && 'border-red-500 focus-visible:ring-red-500/20',
                bankData && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
              )}
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fetchBankDetails(ifsc)}
            disabled={loading || ifsc.length !== 11}
            className="h-10 px-3.5 gap-1.5 shrink-0 text-xs font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Verify</span>
              </>
            )}
          </Button>

          {(ifsc || bankData) && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleReset}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              title="Clear IFSC"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Live Detected Bank Card */}
        {bankData && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{bankData.bank}</span>
                </div>
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  <span>Branch:</span>
                  <span className="font-semibold text-primary">{bankData.branch}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-background/80 shrink-0">
                {bankData.ifsc}
              </Badge>
            </div>

            {(bankData.city || bankData.state || bankData.district) && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span className="truncate">
                  {[bankData.city, bankData.district, bankData.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {bankData.address && (
              <p className="text-[10px] text-muted-foreground/80 line-clamp-2 italic">
                {bankData.address}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1 pt-1">
              {bankData.upi && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-background/90 border font-medium text-emerald-600 dark:text-emerald-400">
                  UPI Enabled
                </Badge>
              )}
              {bankData.neft && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-background/90 border font-medium">
                  NEFT
                </Badge>
              )}
              {bankData.rtgs && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-background/90 border font-medium">
                  RTGS
                </Badge>
              )}
              {bankData.imps && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-background/90 border font-medium">
                  IMPS
                </Badge>
              )}
            </div>
          </div>
        )}

        {apiError && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 pt-0.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {apiError}
          </p>
        )}
      </div>

      </div>
  );
}
