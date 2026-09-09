export interface FormThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'orange' | 'blue' | 'duo' | 'dark' | 'nature' | 'minimal';
  primaryColor: string;
  secondaryColor?: string;
  textureStyle: string;
  badge: string;
  gradientHeader: string;
  buttonClass: string;
  accentBorder: string;
  previewBg: string;
}

export interface FormThemeConfig {
  themeId: string;
  primaryColor: string;
  textureStyle?: string;
  textureBlur?: number;
  customHex?: string;
}

export const FORM_THEME_PRESETS: FormThemePreset[] = [
  {
    id: 'orange-waves',
    name: 'TSPL Orange Waves',
    description: 'Signature vibrant flowing orange curved lines with warm ambient glow',
    category: 'orange',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    textureStyle: 'orange-waves',
    badge: 'TSPL Signature',
    gradientHeader: 'from-orange-500 via-amber-500 to-orange-600',
    buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25',
    accentBorder: 'border-orange-500/40 hover:border-orange-500/70',
    previewBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-zinc-950 dark:via-orange-950/20 dark:to-zinc-900',
  },
  {
    id: 'blue-curves',
    name: 'Royal Blue Curves',
    description: 'Smooth elegant flowing sinuous blue ribbon curves & waves',
    category: 'blue',
    primaryColor: '#2563eb',
    secondaryColor: '#38bdf8',
    textureStyle: 'blue-curves',
    badge: 'Popular',
    gradientHeader: 'from-blue-600 via-indigo-500 to-sky-500',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    accentBorder: 'border-blue-500/40 hover:border-blue-500/70',
    previewBg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900',
  },
  {
    id: 'sunset-curves',
    name: 'TSPL Duo Curves (Orange & Blue)',
    description: 'Harmonious flowing waves combining TSPL corporate blue and vibrant orange',
    category: 'duo',
    primaryColor: '#ea580c',
    secondaryColor: '#2563eb',
    textureStyle: 'sunset-curves',
    badge: 'Brand Duo',
    gradientHeader: 'from-orange-500 via-rose-500 to-blue-600',
    buttonClass: 'bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 hover:opacity-90 text-white shadow-md',
    accentBorder: 'border-orange-500/30 hover:border-blue-500/60',
    previewBg: 'bg-gradient-to-br from-orange-50/70 via-white to-blue-50/70 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-900',
  },
  {
    id: 'dark-blue-grid',
    name: 'Midnight Blue Tech Grid',
    description: 'Deep navy background with high-tech diagonal blue lines and contours',
    category: 'dark',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    textureStyle: 'dark-blue-grid',
    badge: 'Modern Tech',
    gradientHeader: 'from-blue-500 via-indigo-500 to-cyan-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30',
    accentBorder: 'border-blue-500/40 hover:border-blue-400/80',
    previewBg: 'bg-slate-950 text-slate-100',
  },
  {
    id: 'aurora-waves',
    name: 'Ocean Cyan & Teal Waves',
    description: 'Refreshing liquid curve waves with emerald, cyan, and teal ripples',
    category: 'nature',
    primaryColor: '#0d9488',
    secondaryColor: '#06b6d4',
    textureStyle: 'aurora-waves',
    badge: 'Organic',
    gradientHeader: 'from-teal-500 via-cyan-500 to-blue-500',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25',
    accentBorder: 'border-teal-500/40 hover:border-teal-500/70',
    previewBg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-slate-950 dark:via-teal-950/20 dark:to-slate-900',
  },
  {
    id: 'amber-curves',
    name: 'Amber Topographic Waves',
    description: 'Warm contour curves with golden topographic waves',
    category: 'orange',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    textureStyle: 'amber-curves',
    badge: 'Warm',
    gradientHeader: 'from-amber-500 via-orange-400 to-yellow-500',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
    accentBorder: 'border-amber-500/40 hover:border-amber-500/70',
    previewBg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-900',
  },
  {
    id: 'minimal-clean',
    name: 'Clean Slate (Default)',
    description: 'Pure, distraction-free neutral backdrop with crisp borders',
    category: 'minimal',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    textureStyle: 'minimal-clean',
    badge: 'Minimal',
    gradientHeader: 'from-zinc-700 via-zinc-800 to-zinc-900 dark:from-zinc-400 dark:to-zinc-200',
    buttonClass: 'bg-foreground text-background hover:bg-foreground/90 shadow-sm',
    accentBorder: 'border-border hover:border-foreground/30',
    previewBg: 'bg-slate-100 dark:bg-slate-950',
  },
];

export const DEFAULT_FORM_THEME: FormThemeConfig = {
  themeId: 'orange-waves',
  primaryColor: '#ea580c',
  textureStyle: 'orange-waves',
  textureBlur: 0,
};

export function getThemeById(themeId?: string): FormThemePreset {
  if (!themeId) return FORM_THEME_PRESETS[0];
  const found = FORM_THEME_PRESETS.find((t) => t.id === themeId);
  return found || FORM_THEME_PRESETS[0];
}

/**
 * Returns background styles (images, overlays, SVG wave ribbons) for the form submission view
 */
export function getFormBackgroundStyle(
  themeId: string,
  customPrimary?: string,
  textureBlur: number = 0
): {
  containerStyle: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  overlayClass?: string;
  hasTextureImage?: boolean;
  textureImageUrl?: string;
  isDarkTheme?: boolean;
  blurPx: number;
} {
  const blurPx = Math.max(0, Math.min(24, textureBlur || 0));

  let res: {
    containerStyle: React.CSSProperties;
    overlayStyle?: React.CSSProperties;
    overlayClass?: string;
    hasTextureImage?: boolean;
    textureImageUrl?: string;
    isDarkTheme?: boolean;
  };

  switch (themeId) {
    case 'orange-waves':
      res = {
        containerStyle: {
          backgroundImage: "url('/orange-wavey-lines-abstract-background-vector.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        },
        overlayClass: 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-[1px]',
        hasTextureImage: true,
        textureImageUrl: '/orange-wavey-lines-abstract-background-vector.jpg',
      };
      break;

    case 'blue-curves':
      res = {
        containerStyle: {
          backgroundImage: "url('/pngtree-elegant-sinuous-blue-lines-flowing-on-a-black-background-with-a-picture-image_15293786.jpg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        },
        overlayClass: 'bg-sky-50/85 dark:bg-slate-950/88 backdrop-blur-[1px]',
        hasTextureImage: true,
        textureImageUrl: '/pngtree-elegant-sinuous-blue-lines-flowing-on-a-black-background-with-a-picture-image_15293786.jpg.png',
      };
      break;

    case 'sunset-curves':
      res = {
        containerStyle: {
          backgroundImage: `
            radial-gradient(ellipse at 15% 15%, rgba(234, 88, 12, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse at 85% 85%, rgba(37, 99, 235, 0.14) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='og' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ea580c' stop-opacity='0.16'/%3E%3Cstop offset='100%25' stop-color='%232563eb' stop-opacity='0.16'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0,180 C150,260 350,100 500,190 C650,280 750,150 800,210 L800,260 C750,200 650,330 500,240 C350,150 150,310 0,230 Z' fill='url(%23og)'/%3E%3Cpath d='M0,380 C200,470 300,310 500,400 C700,490 750,360 800,410 L800,440 C750,390 700,520 500,430 C300,340 200,500 0,410 Z' fill='url(%23og)'/%3E%3Cpath d='M0,80 C220,10 380,120 550,50 C720,-20 760,60 800,30 L800,55 C760,85 720,5 550,75 C380,145 220,35 0,105 Z' fill='url(%23og)'/%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover, cover, 800px 600px',
          backgroundAttachment: 'fixed',
          backgroundColor: '#f8fafc',
        },
        overlayClass: 'bg-transparent',
      };
      break;

    case 'dark-blue-grid':
      res = {
        containerStyle: {
          backgroundColor: '#090d16',
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 65%),
            repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.08) 0px, rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px, transparent 32px),
            repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0px, rgba(59, 130, 246, 0.05) 1.5px, transparent 1.5px, transparent 32px)
          `,
          backgroundAttachment: 'fixed',
          color: '#f8fafc',
        },
        overlayClass: 'bg-transparent',
        isDarkTheme: true,
      };
      break;

    case 'aurora-waves':
      res = {
        containerStyle: {
          backgroundImage: `
            radial-gradient(ellipse at 80% 10%, rgba(6, 182, 212, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 90%, rgba(13, 148, 136, 0.14) 0%, transparent 55%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='500' viewBox='0 0 700 500'%3E%3Cpath d='M0,120 C180,60 320,200 480,140 C640,80 660,180 700,160 L700,190 C660,210 640,110 480,170 C320,230 180,90 0,150 Z' fill='%230d9488' fill-opacity='0.12'/%3E%3Cpath d='M0,320 C160,240 340,390 500,310 C660,230 680,340 700,320 L700,350 C680,370 660,260 500,340 C340,420 160,270 0,350 Z' fill='%2306b6d4' fill-opacity='0.12'/%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover, cover, 700px 500px',
          backgroundAttachment: 'fixed',
          backgroundColor: '#f0fdfa',
        },
        overlayClass: 'bg-transparent',
      };
      break;

    case 'amber-curves':
      res = {
        containerStyle: {
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(217, 119, 6, 0.12) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Cpath d='M 0 100 Q 150 180 300 120 T 600 160' fill='none' stroke='%23d97706' stroke-width='1.5' stroke-opacity='0.18'/%3E%3Cpath d='M 0 200 Q 200 280 350 210 T 600 250' fill='none' stroke='%23d97706' stroke-width='1.5' stroke-opacity='0.18'/%3E%3Cpath d='M 0 300 Q 150 380 300 320 T 600 360' fill='none' stroke='%23d97706' stroke-width='1.5' stroke-opacity='0.18'/%3E%3Cpath d='M 0 400 Q 220 490 380 410 T 600 460' fill='none' stroke='%23d97706' stroke-width='1.5' stroke-opacity='0.18'/%3E%3Cpath d='M 0 500 Q 180 580 340 520 T 600 550' fill='none' stroke='%23d97706' stroke-width='1.5' stroke-opacity='0.18'/%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover, cover, 600px 600px',
          backgroundAttachment: 'fixed',
          backgroundColor: '#fffbeb',
        },
        overlayClass: 'bg-transparent',
      };
      break;

    case 'minimal-clean':
    default:
      res = {
        containerStyle: {},
        overlayClass: '',
      };
      break;
  }

  return {
    ...res,
    blurPx,
  };
}
