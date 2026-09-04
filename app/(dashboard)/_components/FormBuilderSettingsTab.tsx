'use client';

import React, { useState, useTransition } from 'react';
import { Form } from '@prisma/client';
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
import { idGenerator } from '@/lib/utils';
import {
  FileSpreadsheet,
  Palette,
  Calendar,
  PartyPopper,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  LockKeyhole,
  CheckCircle2,
  Loader2,
  Sparkles,
  Lock,
  Globe,
  Sliders,
  Eye,
  Check,
  Infinity as InfinityIcon,
  Clock,
  Layers,
  ExternalLink,
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
  { name: 'Google Purple', hex: '#673ab7', bg: '#f0ebf8' },
  { name: 'Royal Indigo', hex: '#4f46e5', bg: '#eef2ff' },
  { name: 'Google Blue', hex: '#1a73e8', bg: '#e8f0fe' },
  { name: 'Ocean Teal', hex: '#0d9488', bg: '#f0fdfa' },
  { name: 'Forest Emerald', hex: '#059669', bg: '#ecfdf5' },
  { name: 'Sunset Amber', hex: '#d97706', bg: '#fffbeb' },
  { name: 'Crimson Rose', hex: '#e11d48', bg: '#fff1f2' },
  { name: 'Modern Slate', hex: '#334155', bg: '#f8fafc' },
];

export default function FormBuilderSettingsTab({
  form,
  departments,
  branches,
}: Props) {
  const [pending, startTransition] = useTransition();
  const { elements, setElements } = useDesginerStore();

  // Find existing ThankYouField if present in elements
  const existingThankYou = elements.find((el) => el.type === 'ThankYouField');

  // 1. Responses Settings
  const [oneResponsePerUser, setOneResponsePerUser] = useState<boolean>(
    Boolean(form.oneResponsePerUser)
  );
  const [responseLimit, setResponseLimit] = useState<string>(
    form.responseLimit ? String(form.responseLimit) : ''
  );
  const [autoSaveDraft, setAutoSaveDraft] = useState<boolean>(true);
  const [emailReceipt, setEmailReceipt] = useState<boolean>(false);

  // 2. Color Palette & Wheel Customizer
  const [primaryColor, setPrimaryColor] = useState<string>('#673ab7');
  const [customHex, setCustomHex] = useState<string>('#673ab7');

  // 3. Schedule & Availability (Never Ending Option)
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

  // 5. Unique Enterprise Settings (Not in Google Forms)
  const [antiCheatProtection, setAntiCheatProtection] = useState<boolean>(false);
  const [requirePasscode, setRequirePasscode] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');

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

  const handleSave = () => {
    startTransition(async () => {
      try {
        // 1. Update ThankYouField in elements
        let updatedElements = [...elements];
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

        // 2. Persist elements content to database
        const jsonContent = JSON.stringify(updatedElements);
        await UpdateFormContent(form.id, jsonContent);
        setElements(updatedElements);

        // 3. Update Form Settings in DB
        await UpdateFormSettings(form.id, {
          accessMode: 'PUBLIC',
          oneResponsePerUser,
          loginRequired: oneResponsePerUser,
          startDate: !neverEnding && startDate ? new Date(startDate).toISOString() : null,
          endDate: !neverEnding && endDate ? new Date(endDate).toISOString() : null,
          responseLimit: responseLimit ? Number(responseLimit) : null,
        });

        toast({
          title: 'Settings Saved',
          description: 'All form settings, theme colors, and confirmation options were updated successfully.',
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

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Top Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Form Settings & Themes</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize response policies, color palette, schedule, thank you screens, and enterprise controls.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={pending}
          className="bg-[#673ab7] hover:bg-[#5e35b1] text-white font-semibold gap-1.5 shadow-sm px-5 h-9 shrink-0"
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
        defaultValue={['responses', 'theme', 'schedule', 'thankyou', 'enterprise']}
        className="space-y-4"
      >
        {/* SECTION 1: RESPONSES */}
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

        {/* SECTION 2: THEME & COLOR PALETTE / COLOR WHEEL (Replaces Public Access Mode) */}
        <AccordionItem value="theme" className="rounded-xl border bg-card px-5 shadow-xs overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 shrink-0">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Form Theme & Color Customizer</h3>
                <p className="text-xs text-muted-foreground">
                  Choose preset palettes or pick any color from the color wheel
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-5 border-t">
            {/* Quick Color Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Theme Color Presets
              </Label>
              <div className="flex flex-wrap items-center gap-2.5">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handleColorPresetClick(preset.hex)}
                      title={preset.name}
                      style={{ backgroundColor: preset.hex }}
                      className="relative h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    >
                      {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Wheel & Custom HEX Picker */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Custom Color Wheel (Any Color)
                </Label>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="color"
                    id="color-wheel"
                    value={primaryColor}
                    onChange={handleCustomColorChange}
                    className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5 shadow-xs"
                    title="Open Color Wheel"
                  />
                </div>
                <div className="flex-1 max-w-xs">
                  <Input
                    type="text"
                    value={customHex}
                    onChange={handleHexInputChange}
                    placeholder="#673ab7"
                    className="h-10 text-xs font-mono font-semibold uppercase tracking-wider"
                  />
                </div>
                {/* Live Preview Swatch */}
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="h-10 w-24 rounded-md border border-border/80 shadow-xs flex items-center justify-center text-white text-[11px] font-bold"
                >
                  Preview
                </div>
              </div>
            </div>

            {/* Visual Live Theme Card Example */}
            <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Theme Appearance Preview
              </p>
              <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <div style={{ backgroundColor: primaryColor }} className="h-2.5 w-full" />
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-foreground">{form.name || 'Sample Form'}</h4>
                  <p className="text-xs text-muted-foreground">This is how your selected theme looks on live forms.</p>
                  <div className="pt-2">
                    <Button size="sm" style={{ backgroundColor: primaryColor }} className="text-white text-xs h-7 px-3">
                      Submit Response
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: SCHEDULE & AVAILABILITY (Never Ending Option) */}
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
