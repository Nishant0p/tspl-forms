'use client';

import React, { useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from '@/components/ui/use-toast';
import { UpdateFormSettings, UpdateFormContent } from '@/app/actions/form';
import { useDesginerStore } from '@/store/store';
import { idGenerator, cn } from '@/lib/utils';
import {
  FORM_THEME_PRESETS,
  getThemeById,
  getFormBackgroundStyle,
  FormThemePreset,
} from '@/lib/form-themes';
import {
  FileSpreadsheet,
  Palette,
  Calendar,
  PartyPopper,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Loader2,
  Sparkles,
  Sliders,
  Check,
  Infinity as InfinityIcon,
  Clock,
  ExternalLink,
  Wand2,
  Sun,
  Moon,
  Eye,
} from 'lucide-react';

type AccessOption = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  form: any;
  departments: AccessOption[];
  branches: AccessOption[];
};

const COLOR_PRESETS = [
  { name: 'TSPL Orange', hex: '#ea580c', bg: '#fff7ed' },
  { name: 'TSPL Royal Blue', hex: '#2563eb', bg: '#eff6ff' },
  { name: 'Deep Indigo', hex: '#4f46e5', bg: '#eef2ff' },
  { name: 'Ocean Cyan', hex: '#0284c7', bg: '#f0f9ff' },
  { name: 'Teal Emerald', hex: '#0d9488', bg: '#f0fdfa' },
  { name: 'Warm Amber', hex: '#d97706', bg: '#fffbeb' },
  { name: 'Crimson Rose', hex: '#e11d48', bg: '#fff1f2' },
  { name: 'Charcoal Slate', hex: '#334155', bg: '#f8fafc' },
];

export default function FormBuilderSettingsTab({
  form,
  departments,
  branches,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [applyingTheme, startApplyTransition] = useTransition();
  const { elements, setElements } = useDesginerStore();

  // Find existing ThankYouField and ThemeField
  const existingThankYou = elements.find((el) => el.type === 'ThankYouField');
  const existingTheme = elements.find((el) => el.type === 'ThemeField');

  // 1. Responses Settings
  const [oneResponsePerUser, setOneResponsePerUser] = useState<boolean>(
    Boolean(form.oneResponsePerUser)
  );
  const [responseLimit, setResponseLimit] = useState<string>(
    form.responseLimit ? String(form.responseLimit) : ''
  );
  const [autoSaveDraft, setAutoSaveDraft] = useState<boolean>(true);
  const [emailReceipt, setEmailReceipt] = useState<boolean>(false);

  // 2. Theme & Texture Customizer
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    existingTheme?.extraAttributes?.themeId || 'orange-waves'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    existingTheme?.extraAttributes?.primaryColor || '#ea580c'
  );
  const [customHex, setCustomHex] = useState<string>(
    existingTheme?.extraAttributes?.customHex ||
      existingTheme?.extraAttributes?.primaryColor ||
      '#ea580c'
  );
  const [previewDark, setPreviewDark] = useState<boolean>(false);

  // 3. Schedule & Availability
  const [neverEnding, setNeverEnding] = useState<boolean>(
    !form.startDate && !form.endDate
  );
  const [startDate, setStartDate] = useState(
    form.startDate ? new Date(form.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    form.endDate ? new Date(form.endDate).toISOString().slice(0, 16) : ''
  );
  const [closedMessage, setClosedMessage] = useState<string>(
    'This form is no longer accepting responses.'
  );

  // 4. Thank You & Confirmation Page Editor
  const [thankYouTitle, setThankYouTitle] = useState<string>(
    existingThankYou?.extraAttributes?.title || 'Thank You!'
  );
  const [thankYouMessage, setThankYouMessage] = useState<string>(
    existingThankYou?.extraAttributes?.message ||
      'Your response has been recorded successfully.'
  );
  const [showRedirectBtn, setShowRedirectBtn] = useState<boolean>(
    existingThankYou?.extraAttributes?.showRedirectButton ?? true
  );
  const [btnText, setBtnText] = useState<string>(
    existingThankYou?.extraAttributes?.buttonText || 'Submit another response'
  );
  const [redirectUrl, setRedirectUrl] = useState<string>(
    existingThankYou?.extraAttributes?.buttonUrl || ''
  );

  // 5. Enterprise Settings
  const [antiCheatProtection, setAntiCheatProtection] = useState<boolean>(false);
  const [requirePasscode, setRequirePasscode] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');

  const handleSelectTheme = (theme: FormThemePreset) => {
    setSelectedThemeId(theme.id);
    setPrimaryColor(theme.primaryColor);
    setCustomHex(theme.primaryColor);
  };

  const handleColorPresetClick = (hex: string) => {
    setPrimaryColor(hex);
    setCustomHex(hex);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPrimaryColor(val);
    setCustomHex(val);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setPrimaryColor(val);
    }
  };

  // Dedicated Apply Theme button handler
  const handleApplyTheme = () => {
    startApplyTransition(async () => {
      try {
        let updatedElements = [...elements];
        const themeIndex = updatedElements.findIndex((el) => el.type === 'ThemeField');
        const themeData = {
          themeId: selectedThemeId,
          primaryColor,
          textureStyle: selectedThemeId,
          customHex,
        };

        if (themeIndex >= 0) {
          updatedElements[themeIndex] = {
            ...updatedElements[themeIndex],
            extraAttributes: {
              ...updatedElements[themeIndex].extraAttributes,
              ...themeData,
            },
          };
        } else {
          updatedElements.push({
            id: idGenerator(),
            type: 'ThemeField',
            extraAttributes: themeData,
          });
        }

        const jsonContent = JSON.stringify(updatedElements);
        await UpdateFormContent(form.id, jsonContent);
        setElements(updatedElements);

        const currentPreset = getThemeById(selectedThemeId);
        toast({
          title: 'Theme & Texture Applied!',
          description: `"${currentPreset.name}" texture is now active on your form for all respondents.`,
        });
      } catch (err: any) {
        toast({
          title: 'Failed to Apply Theme',
          description: err?.message || 'Could not apply theme settings.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        let updatedElements = [...elements];

        // 1. Update ThankYouField in elements
        const thankYouIndex = updatedElements.findIndex(
          (el) => el.type === 'ThankYouField'
        );
        const thankYouData = {
          title: thankYouTitle,
          message: thankYouMessage,
          buttonText: btnText,
          buttonUrl: redirectUrl,
          showRedirectButton: showRedirectBtn,
          imageUrl: existingThankYou?.extraAttributes?.imageUrl || '',
        };

        if (thankYouIndex >= 0) {
          updatedElements[thankYouIndex] = {
            ...updatedElements[thankYouIndex],
            extraAttributes: {
              ...updatedElements[thankYouIndex].extraAttributes,
              ...thankYouData,
            },
          };
        } else {
          updatedElements.push({
            id: idGenerator(),
            type: 'ThankYouField',
            extraAttributes: thankYouData,
          });
        }

        // 2. Update ThemeField in elements
        const themeIndex = updatedElements.findIndex(
          (el) => el.type === 'ThemeField'
        );
        const themeData = {
          themeId: selectedThemeId,
          primaryColor,
          textureStyle: selectedThemeId,
          customHex,
        };

        if (themeIndex >= 0) {
          updatedElements[themeIndex] = {
            ...updatedElements[themeIndex],
            extraAttributes: {
              ...updatedElements[themeIndex].extraAttributes,
              ...themeData,
            },
          };
        } else {
          updatedElements.push({
            id: idGenerator(),
            type: 'ThemeField',
            extraAttributes: themeData,
          });
        }

        // 3. Persist elements content to database
        const jsonContent = JSON.stringify(updatedElements);
        await UpdateFormContent(form.id, jsonContent);
        setElements(updatedElements);

        // 4. Update Form Settings in DB
        await UpdateFormSettings(form.id, {
          accessMode: 'PUBLIC',
          oneResponsePerUser,
          loginRequired: oneResponsePerUser,
          startDate: !neverEnding && startDate ? new Date(startDate).toISOString() : null,
          endDate: !neverEnding && endDate ? new Date(endDate).toISOString() : null,
          responseLimit: responseLimit ? Number(responseLimit) : null,
        });

        toast({
          title: 'All Settings Saved',
          description: 'Theme textures, response controls, and schedules were successfully saved.',
        });
      } catch (err: any) {
        toast({
          title: 'Save Failed',
          description: err?.message || 'Could not save settings.',
          variant: 'destructive',
        });
      }
    });
  };

  const currentThemePreset = getThemeById(selectedThemeId);
  const previewBgStyles = getFormBackgroundStyle(selectedThemeId, primaryColor);

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Top Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-500" />
            <span>Form Settings & Themes</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure textures, themes, response limits, schedule, and confirmation screens.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={pending || applyingTheme}
          className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold gap-1.5 shadow-sm px-5 h-9 shrink-0 transition-all"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>Save All Settings</span>
        </Button>
      </div>

      {/* Accordion Settings Sections */}
      <Accordion
        type="multiple"
        defaultValue={['theme', 'responses', 'schedule', 'thankyou', 'enterprise']}
        className="space-y-4"
      >
        {/* SECTION 1: FORM THEME & TEXTURES (Orange & Blue Patterns, Curve Lines) */}
        <AccordionItem value="theme" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Form Theme & Background Textures</h3>
                  <span className="rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 border border-orange-500/20">
                    Curved Patterns
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose curved line patterns, orange & blue wave textures, or custom color accents
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-6 border-t">
            {/* Theme / Texture Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Select Texture / Theme Preset</span>
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Active: <strong className="text-foreground">{currentThemePreset.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FORM_THEME_PRESETS.map((preset) => {
                  const isSelected = selectedThemeId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectTheme(preset)}
                      className={cn(
                        'relative rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-between gap-2 overflow-hidden text-left',
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/[0.04] shadow-sm'
                          : 'border-border/80 hover:border-border hover:shadow-xs bg-card'
                      )}
                    >
                      {/* Visual Header Strip with Texture or Curve Pattern */}
                      <div
                        className={cn(
                          'relative h-14 w-full rounded-lg overflow-hidden border border-border/50 flex items-center justify-center p-2',
                          preset.previewBg
                        )}
                        style={
                          preset.id === 'orange-waves'
                            ? {
                                backgroundImage: "url('/orange-wavey-lines-abstract-background-vector.jpg')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : preset.id === 'blue-curves'
                            ? {
                                backgroundImage: "url('/pngtree-elegant-sinuous-blue-lines-flowing-on-a-black-background-with-a-picture-image_15293786.jpg.png')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : {}
                        }
                      >
                        {/* Overlay Accent */}
                        <div
                          className={cn(
                            'absolute inset-0',
                            preset.id === 'orange-waves' && 'bg-white/40 dark:bg-zinc-950/40',
                            preset.id === 'blue-curves' && 'bg-black/30'
                          )}
                        />

                        {/* Top Gradient accent line */}
                        <div
                          className={cn(
                            'absolute top-0 inset-x-0 h-1 bg-gradient-to-r',
                            preset.gradientHeader
                          )}
                        />

                        {/* Mini Form Card Mockup */}
                        <div className="relative z-10 w-4/5 h-8 rounded bg-background/90 backdrop-blur-xs border border-border/70 shadow-xs flex items-center px-2 justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              style={{ backgroundColor: preset.primaryColor }}
                              className="h-2 w-2 rounded-full"
                            />
                            <div className="h-1.5 w-12 bg-muted-foreground/30 rounded" />
                          </div>
                          <div
                            style={{ backgroundColor: preset.primaryColor }}
                            className="h-3 w-8 rounded text-[7px] text-white font-bold flex items-center justify-center"
                          >
                            Send
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 z-20 h-5 w-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {preset.name}
                          </h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60 shrink-0">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Color Swatches & Custom Picker */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold text-foreground">
                  Primary Accent Color (Buttons & Highlights)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-mono uppercase">
                    {primaryColor}
                  </span>
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="h-4 w-4 rounded-full border border-border/80 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handleColorPresetClick(preset.hex)}
                      title={preset.name}
                      style={{ backgroundColor: preset.hex }}
                      className="relative h-7 w-7 rounded-full border-2 border-white dark:border-gray-800 shadow-xs transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white drop-shadow-md stroke-[3]" />}
                    </button>
                  );
                })}

                <div className="flex items-center gap-2 ml-auto">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      id="color-wheel"
                      value={primaryColor}
                      onChange={handleCustomColorChange}
                      className="h-8 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5 shadow-2xs"
                      title="Open Color Wheel"
                    />
                  </div>
                  <Input
                    type="text"
                    value={customHex}
                    onChange={handleHexInputChange}
                    placeholder="#ea580c"
                    className="h-8 w-24 text-xs font-mono font-semibold uppercase tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* REALISTIC LIVE PREVIEW IN SETTING TAB */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <p className="text-xs font-bold text-foreground">
                    Live Form User Preview
                  </p>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border">
                    {currentThemePreset.name}
                  </span>
                </div>

                {/* Light / Dark Mode Mockup Preview Toggle */}
                <div className="flex items-center gap-1 bg-card rounded-lg p-0.5 border border-border/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDark(false)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all',
                      !previewDark
                        ? 'bg-orange-500 text-white shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDark(true)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all',
                      previewDark
                        ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Realistic Form Preview Mockup Container */}
              <div
                className={cn(
                  'rounded-xl border overflow-hidden p-4 sm:p-6 transition-all relative min-h-[300px] flex items-center justify-center',
                  previewDark ? 'dark' : ''
                )}
                style={previewBgStyles.containerStyle}
              >
                {/* Texture Tint Overlay if applicable */}
                <div className={cn('absolute inset-0 pointer-events-none', previewBgStyles.overlayClass)} />

                {/* Form Card in Preview */}
                <div className="relative z-10 w-full max-w-md bg-card text-card-foreground rounded-xl border border-border shadow-lg overflow-hidden space-y-3">
                  {/* Top Color Accent Strip */}
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className={cn('h-2 w-full bg-gradient-to-r', currentThemePreset.gradientHeader)}
                  />

                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-border/60 shadow-2xs shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/image.png"
                          alt="TSPL Logo"
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {form.name || 'Sample Form Title'}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {form.description || 'Fill out this form with your information.'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-2.5 space-y-2.5">
                      {/* Sample Field 1 */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                          <span>Full Name</span>
                          <span className="text-[10px] text-red-500">* Required</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          placeholder="e.g. John Doe"
                          className="w-full h-8 rounded-md border border-border/80 bg-background/90 px-2.5 text-xs text-muted-foreground focus:outline-none"
                        />
                      </div>

                      {/* Sample Field 2 (Multiple Choice) */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          Select Department
                        </label>
                        <div className="flex items-center gap-3 pt-0.5">
                          <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                            <div
                              style={{ borderColor: primaryColor }}
                              className="h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center"
                            >
                              <div
                                style={{ backgroundColor: primaryColor }}
                                className="h-1.5 w-1.5 rounded-full"
                              />
                            </div>
                            <span className="text-[11px]">Engineering</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <div className="h-3.5 w-3.5 rounded-full border border-border" />
                            <span className="text-[11px]">Operations</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        style={{ backgroundColor: primaryColor }}
                        className={cn(
                          'h-8 px-5 rounded-lg text-white text-xs font-bold shadow-sm transition-all',
                          currentThemePreset.buttonClass
                        )}
                      >
                        Submit Response
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        TSPL Secure Form
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Apply Theme to Form Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-muted-foreground">
                  Click <strong>Apply Theme to Form</strong> to immediately activate this texture for all respondents.
                </p>
                <Button
                  type="button"
                  onClick={handleApplyTheme}
                  disabled={applyingTheme || pending}
                  className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-xs font-bold gap-1.5 h-9 px-4 shadow-sm transition-all shrink-0"
                >
                  {applyingTheme ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span>Apply Theme to Form</span>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: RESPONSES */}
        <AccordionItem value="responses" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Responses</h3>
                <p className="text-xs text-muted-foreground">
                  Manage how responses are collected and protected
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 border-t">
            {/* Limit to 1 response */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="one-response" className="text-xs font-semibold text-foreground cursor-pointer">
                  Limit to 1 response
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Requires employees to sign in and limits them to submitting the form only once.
                </p>
              </div>
              <Switch
                id="one-response"
                checked={oneResponsePerUser}
                onCheckedChange={setOneResponsePerUser}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Response Limit (Cap) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="resp-limit" className="text-xs font-semibold text-foreground">
                  Response Limit (Cap)
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically close the form after reaching this number of submissions.
                </p>
              </div>
              <Input
                id="resp-limit"
                type="number"
                placeholder="e.g. 100 (Unlimited)"
                value={responseLimit}
                onChange={(e) => setResponseLimit(e.target.value)}
                className="w-full sm:w-36 h-9 text-xs text-left sm:text-right"
              />
            </div>

            {/* Auto-Save In-Progress Draft */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="auto-save" className="text-xs font-semibold text-foreground cursor-pointer">
                    Auto-Save Respondent Progress (Draft Recovery)
                  </Label>
                  <span className="rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.2">
                    Exclusive
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Saves respondent draft answers in real-time so they never lose progress on accidental reload.
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSaveDraft}
                onCheckedChange={setAutoSaveDraft}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* Email Confirmation Receipt */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="email-receipt" className="text-xs font-semibold text-foreground cursor-pointer">
                    Email Confirmation Receipt to Submitter
                  </Label>
                  <span className="rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold px-1.5 py-0.2">
                    Exclusive
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Send a copy of submitted answers directly to the respondent&apos;s email address upon completion.
                </p>
              </div>
              <Switch
                id="email-receipt"
                checked={emailReceipt}
                onCheckedChange={setEmailReceipt}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: SCHEDULE & AVAILABILITY */}
        <AccordionItem value="schedule" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Schedule & Availability</h3>
                <p className="text-xs text-muted-foreground">
                  Configure active timeline, start/end dates, or never-ending availability
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 border-t">
            {/* Never Ending Form Toggle */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 border">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <InfinityIcon className="h-4 w-4 text-emerald-600" />
                  <Label htmlFor="never-ending" className="text-xs font-bold text-foreground cursor-pointer">
                    Never Ending Form (Continuous Availability)
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Keep this form open indefinitely with no automatic closing date or expiration time.
                </p>
              </div>
              <Switch
                id="never-ending"
                checked={neverEnding}
                onCheckedChange={setNeverEnding}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* Opening & Closing Dates (Visible when NOT Never Ending) */}
            {!neverEnding && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Opening Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Closing Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Custom Closed Form Message */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-semibold text-foreground">
                Message for Closed Forms
              </Label>
              <Input
                value={closedMessage}
                onChange={(e) => setClosedMessage(e.target.value)}
                placeholder="This form is no longer accepting responses."
                className="h-9 text-xs"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 4: THANK YOU & CONFIRMATION PAGE EDITOR */}
        <AccordionItem value="thankyou" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Confirmation & Thank You Page</h3>
                <p className="text-xs text-muted-foreground">
                  Customize the message, buttons, and redirect link respondents see after submitting
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 border-t">
            {/* Thank You Title */}
            <div className="space-y-1.5">
              <Label htmlFor="ty-title" className="text-xs font-semibold text-foreground">
                Confirmation Heading / Title
              </Label>
              <Input
                id="ty-title"
                value={thankYouTitle}
                onChange={(e) => setThankYouTitle(e.target.value)}
                placeholder="e.g. Thank You! Your response has been recorded."
                className="h-9 text-xs"
              />
            </div>

            {/* Thank You Message */}
            <div className="space-y-1.5">
              <Label htmlFor="ty-msg" className="text-xs font-semibold text-foreground">
                Custom Confirmation Message
              </Label>
              <Textarea
                id="ty-msg"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="Thank you for taking the time to complete this form. We appreciate your valuable feedback."
                rows={3}
                className="text-xs"
              />
            </div>

            {/* Action Buttons & Redirects */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="show-btn" className="text-xs font-semibold text-foreground cursor-pointer">
                    Show Action Button on Thank You Screen
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Display a button to submit another response or navigate to a custom URL.
                  </p>
                </div>
                <Switch
                  id="show-btn"
                  checked={showRedirectBtn}
                  onCheckedChange={setShowRedirectBtn}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              {showRedirectBtn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Button Label</Label>
                    <Input
                      value={btnText}
                      onChange={(e) => setBtnText(e.target.value)}
                      placeholder="e.g. Submit another response"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <span>Redirect URL (Optional)</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      placeholder="e.g. https://tsplgroup.in"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 5: TSPL EXCLUSIVE ENTERPRISE & SECURITY CONTROLS */}
        <AccordionItem value="enterprise" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">TSPL Enterprise & Security Controls</h3>
                  <span className="rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5">
                    Exclusive Features
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Advanced capabilities and security controls not available in standard Google Forms
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 border-t">
            {/* Anti-Copy & Anti-Cheat Protection */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="anti-cheat" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Anti-Copy & Cheat Protection Mode</span>
                </Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                  Disables right-click, text selection, copy/paste, and inspecting elements on the form (Ideal for secure tests, audits & surveys).
                </p>
              </div>
              <Switch
                id="anti-cheat"
                checked={antiCheatProtection}
                onCheckedChange={setAntiCheatProtection}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            {/* Secret Passcode Protection */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="require-pin" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Secret Access Passcode / PIN</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                    Require respondents to enter a secret password or access code before they can view or submit this form.
                  </p>
                </div>
                <Switch
                  id="require-pin"
                  checked={requirePasscode}
                  onCheckedChange={setRequirePasscode}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>

              {requirePasscode && (
                <div className="max-w-xs space-y-1 pl-6">
                  <Input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter secret PIN (e.g. 8492)"
                    className="h-9 text-xs"
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
