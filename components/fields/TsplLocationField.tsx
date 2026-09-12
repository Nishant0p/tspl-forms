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
  MapPin,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Compass,
  RotateCcw,
  Sparkles,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplLocationField';

const extraAttributes = {
  label: 'Location / Address',
  helperText: 'Enter 6-digit Indian PIN code to automatically fetch area, district, and state.',
  required: false,
  placeholder: 'Enter 6-digit PIN code (e.g. 110001)',
  includeStreetAddress: true,
  autoFetchOn6Digits: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(60),
  includeStreetAddress: z.boolean().default(true),
  autoFetchOn6Digits: z.boolean().default(true),
});

export type PostOfficeItem = {
  Name: string;
  Description?: string | null;
  BranchType?: string;
  DeliveryStatus?: string;
  Circle?: string;
  District: string;
  Division?: string;
  Region?: string;
  Block?: string;
  State: string;
  Country: string;
  Pincode: string;
};

export type LocationPayload = {
  pincode: string;
  locality?: string;
  district?: string;
  state?: string;
  country?: string;
  street?: string;
  formatted: string;
};

export const TsplLocationFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    label: 'Location',
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
      if (element.extraAttributes.required) {
        return Boolean(parsed.pincode && parsed.pincode.length === 6 && (parsed.district || parsed.formatted));
      }
      return true;
    } catch {
      // Plain text fallback
      if (element.extraAttributes.required) {
        return val.length >= 6;
      }
      return true;
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
      required: element.extraAttributes.required,
      placeholder: element.extraAttributes.placeholder || 'Enter 6-digit PIN code (e.g. 110001)',
      includeStreetAddress: element.extraAttributes.includeStreetAddress ?? true,
      autoFetchOn6Digits: element.extraAttributes.autoFetchOn6Digits ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      placeholder: element.extraAttributes.placeholder || 'Enter 6-digit PIN code (e.g. 110001)',
      includeStreetAddress: element.extraAttributes.includeStreetAddress ?? true,
      autoFetchOn6Digits: element.extraAttributes.autoFetchOn6Digits ?? true,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        required: data.required,
        placeholder: data.placeholder,
        includeStreetAddress: data.includeStreetAddress,
        autoFetchOn6Digits: data.autoFetchOn6Digits,
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
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>The title displayed for this question.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIN Code Placeholder</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>Placeholder text for the 6-digit PIN input.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper Text</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>Instructions shown below the input.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="includeStreetAddress"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Street / Building Input</FormLabel>
                <FormDescription className="text-xs">
                  Allows respondent to provide flat/house/street address along with PIN.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoFetchOn6Digits"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Auto-Fetch on 6 Digits</FormLabel>
                <FormDescription className="text-xs">
                  Automatically triggers postal API lookup once 6 digits are typed.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
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
                  Require valid PIN code and location before submission.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
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
  const {
    label,
    helperText,
    required,
    placeholder = 'Enter 6-digit PIN code (e.g. 110001)',
    includeStreetAddress = true,
  } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-wider">
            TSPL Location
          </Badge>
          <span className="text-[10px] font-semibold text-muted-foreground">
            API Verified
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              disabled
              placeholder={placeholder}
              value="110001"
              className="h-9 text-xs pl-8 font-mono bg-background/50"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          </div>
          <Button disabled size="sm" variant="secondary" className="h-9 text-xs px-3 gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Detected
          </Button>
        </div>

        {/* Auto-detected preview card */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>Auto-detected Location:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Badge variant="secondary" className="text-[10px] bg-background/80 border">
              Area: Connaught Place
            </Badge>
            <Badge variant="secondary" className="text-[10px] bg-background/80 border">
              District: Central Delhi
            </Badge>
            <Badge variant="secondary" className="text-[10px] bg-background/80 border">
              State: Delhi
            </Badge>
          </div>
        </div>

        {includeStreetAddress && (
          <Input
            disabled
            placeholder="House / Flat No., Building, Street Address (optional)"
            className="h-8 text-xs bg-background/50"
          />
        )}
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
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
    placeholder = 'Enter 6-digit PIN code (e.g. 110001)',
    includeStreetAddress = true,
    autoFetchOn6Digits = true,
  } = element.extraAttributes;

  // Parse initial state
  const parseInitial = (): {
    pincode: string;
    locality: string;
    district: string;
    state: string;
    country: string;
    street: string;
    postOffices: PostOfficeItem[];
  } => {
    if (!defaultValues) {
      return {
        pincode: '',
        locality: '',
        district: '',
        state: '',
        country: 'India',
        street: '',
        postOffices: [],
      };
    }

    try {
      const parsed = JSON.parse(defaultValues);
      return {
        pincode: parsed.pincode || '',
        locality: parsed.locality || '',
        district: parsed.district || '',
        state: parsed.state || '',
        country: parsed.country || 'India',
        street: parsed.street || '',
        postOffices: parsed.locality ? [{ Name: parsed.locality, District: parsed.district || '', State: parsed.state || '', Country: parsed.country || 'India', Pincode: parsed.pincode || '' }] : [],
      };
    } catch {
      // String format e.g. "110001" or address
      const pinMatch = defaultValues.match(/\b\d{6}\b/);
      return {
        pincode: pinMatch ? pinMatch[0] : '',
        locality: '',
        district: '',
        state: '',
        country: 'India',
        street: defaultValues,
        postOffices: [],
      };
    }
  };

  const initial = parseInitial();
  const [pincode, setPincode] = useState<string>(initial.pincode);
  const [locality, setLocality] = useState<string>(initial.locality);
  const [district, setDistrict] = useState<string>(initial.district);
  const [state, setState] = useState<string>(initial.state);
  const [country, setCountry] = useState<string>(initial.country);
  const [street, setStreet] = useState<string>(initial.street);
  const [postOffices, setPostOffices] = useState<PostOfficeItem[]>(initial.postOffices);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const dispatchUpdate = (
    newPincode: string,
    newLocality: string,
    newDistrict: string,
    newState: string,
    newCountry: string,
    newStreet: string
  ) => {
    if (!submitFunction) return;

    if (!newPincode && !newStreet) {
      setError(required);
      submitFunction(element.id, '');
      return;
    }

    const formattedParts = [
      newStreet.trim(),
      newLocality.trim(),
      newDistrict.trim(),
      newState.trim(),
      newPincode ? `PIN: ${newPincode}` : '',
    ].filter(Boolean);

    const payload: LocationPayload = {
      pincode: newPincode,
      locality: newLocality,
      district: newDistrict,
      state: newState,
      country: newCountry || 'India',
      street: newStreet,
      formatted: formattedParts.join(', '),
    };

    const jsonString = JSON.stringify(payload);
    const valid = TsplLocationFieldFormElement.validate(element, jsonString);
    setError(!valid);
    submitFunction(element.id, jsonString);
  };

  const fetchLocationData = async (pinToFetch: string) => {
    const cleanPin = pinToFetch.trim();
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setApiError('Please enter a valid 6-digit numeric PIN code.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Postal API returned status ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const offices: PostOfficeItem[] = data[0].PostOffice;
        const firstOffice = offices[0];
        const newDistrict = firstOffice.District || '';
        const newState = firstOffice.State || '';
        const newCountry = firstOffice.Country || 'India';
        const newLocality = firstOffice.Name || '';

        setPostOffices(offices);
        setDistrict(newDistrict);
        setState(newState);
        setCountry(newCountry);
        setLocality(newLocality);
        setApiError(null);

        dispatchUpdate(cleanPin, newLocality, newDistrict, newState, newCountry, street);
      } else {
        const msg = data[0]?.Message || 'No location records found for this PIN code.';
        setPostOffices([]);
        setDistrict('');
        setState('');
        setLocality('');
        setApiError(msg);
        dispatchUpdate(cleanPin, '', '', '', 'India', street);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setApiError('Could not connect to postal verification service. Please verify PIN code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(numericOnly);

    if (numericOnly.length === 6 && autoFetchOn6Digits) {
      fetchLocationData(numericOnly);
    } else if (numericOnly.length < 6) {
      setPostOffices([]);
      setDistrict('');
      setState('');
      setLocality('');
      setApiError(null);
      dispatchUpdate(numericOnly, '', '', '', country, street);
    }
  };

  const handleLocalityChange = (newLocality: string) => {
    setLocality(newLocality);
    dispatchUpdate(pincode, newLocality, district, state, country, street);
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreet(newStreet);
    dispatchUpdate(pincode, locality, district, state, country, newStreet);
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-foreground text-sm flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <MapPin className={cn('h-4 w-4 text-primary', error && 'text-red-500')} />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          India Postal API
        </span>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-3">
        {/* PIN Code Input + Fetch Button */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" />
            <span>PIN Code (6 digits)</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pincode}
                placeholder={placeholder}
                onChange={handlePincodeChange}
                className={cn(
                  'h-9 text-xs font-mono pl-8 tracking-wider bg-background',
                  error && !pincode && 'border-red-500',
                  apiError && 'border-amber-500'
                )}
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            </div>

            <Button
              type="button"
              size="sm"
              variant={district ? 'secondary' : 'default'}
              disabled={loading || pincode.length !== 6}
              onClick={() => fetchLocationData(pincode)}
              className="h-9 text-xs px-3 gap-1.5 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Fetching...</span>
                </>
              ) : district ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Fetch Location</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Successfully Auto-Fetched Location Badges */}
        {district && state && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Detected Location Details</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background/80 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                PIN {pincode}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border/60 bg-background/80 p-2 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-muted-foreground block">District</span>
                  <span className="font-semibold text-foreground">{district}</span>
                </div>
              </div>
              <div className="rounded-md border border-border/60 bg-background/80 p-2 flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-muted-foreground block">State</span>
                  <span className="font-semibold text-foreground">{state}</span>
                </div>
              </div>
            </div>

            {/* Post Office / Area Selector if multiple */}
            {postOffices.length > 1 && (
              <div className="space-y-1 pt-1">
                <Label className="text-[11px] font-medium text-muted-foreground">
                  Select Specific Locality / Post Office:
                </Label>
                <Select value={locality} onValueChange={handleLocalityChange}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Select Locality / Post Office" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {postOffices.map((po, idx) => (
                      <SelectItem key={`${po.Name}-${idx}`} value={po.Name} className="text-xs">
                        {po.Name} {po.Block ? `(${po.Block})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Optional Street / House address line */}
        {includeStreetAddress && (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Building, House / Flat No., Street (Optional)
            </Label>
            <Input
              value={street}
              onChange={handleStreetChange}
              placeholder="e.g. Flat 302, Green Valley Apartments, MG Road"
              className="h-8 text-xs bg-background"
            />
          </div>
        )}
      </div>

      {helperText && (
        <p className={cn('text-xs text-muted-foreground', error && 'text-red-500')}>
          {helperText}
        </p>
      )}
    </div>
  );
}
