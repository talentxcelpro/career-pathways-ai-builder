import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		fontFamily: {
			// SF Pro system stack — renders SF Pro Display/Text on Apple devices,
			// with high-quality fallbacks (Segoe UI / Roboto / Inter) elsewhere.
			sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Inter', 'Arial', 'sans-serif'],
			text: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Inter', 'Arial', 'sans-serif'],
			heading: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Inter', 'sans-serif'],
			display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Inter', 'sans-serif'],
			mono: ['"SF Mono"', 'Monaco', 'Menlo', '"Roboto Mono"', '"Source Code Pro"', 'monospace'],
		},
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1280px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))', // Apple Blue
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					lighter: 'hsl(var(--primary-lighter))',
					50: 'hsl(212 100% 95%)',
					100: 'hsl(212 100% 85%)',
					500: 'hsl(var(--primary))',
					600: 'hsl(212 100% 40%)',
					700: 'hsl(212 100% 35%)'
				},
				// AI-inspired violet colors
				'ai-violet': {
					DEFAULT: 'hsl(var(--ai-violet))',
					medium: 'hsl(var(--ai-violet-medium))',
					dark: 'hsl(var(--ai-violet-dark))',
					foreground: 'hsl(var(--ai-violet-foreground))',
					50: 'hsl(251 91% 98%)',
					100: 'hsl(251 91% 95%)',
					300: 'hsl(251 91% 73%)',
					500: 'hsl(251 91% 50%)',
					600: 'hsl(251 91% 40%)',
					700: 'hsl(251 91% 30%)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Apple-inspired text colors
				text: {
					primary: 'hsl(210, 11%, 15%)', // Apple's neutral dark
					secondary: 'hsl(215, 20%, 65%)', // Apple's secondary text
					tertiary: 'hsl(215, 16%, 47%)', // Apple's tertiary text
				},
				// Apple glass effect backgrounds
				glass: {
					light: 'hsl(0, 0%, 100%, 0.8)', // Frosted glass light
					dark: 'hsl(0, 0%, 0%, 0.05)', // Subtle dark overlay
					violet: 'hsl(251, 91%, 95%, 0.8)', // AI violet glass
				},
				// Apple system colors
				orange: {
					DEFAULT: 'hsl(35, 91%, 62%)', // Apple Orange
					50: 'hsl(35, 91%, 95%)',
					100: 'hsl(35, 91%, 90%)',
					500: 'hsl(35, 91%, 62%)',
					600: 'hsl(35, 91%, 55%)',
				},
				green: {
					DEFAULT: 'hsl(120, 60%, 50%)', // Apple Green
					50: 'hsl(120, 60%, 95%)',
					100: 'hsl(120, 60%, 90%)',
					500: 'hsl(120, 60%, 50%)',
					600: 'hsl(120, 60%, 45%)',
				},
				red: {
					DEFAULT: 'hsl(0, 84%, 60%)', // Apple Red
					50: 'hsl(0, 84%, 95%)',
					100: 'hsl(0, 84%, 90%)',
					500: 'hsl(0, 84%, 60%)',
					600: 'hsl(0, 84%, 55%)',
				}
			},
			fontSize: {
				// Scaled platform typography — Regular text -10%, Headings -25%
				'eyebrow':    ['0.675rem', { lineHeight: '0.9rem',     fontWeight: '600', letterSpacing: '0.08em',  textTransform: 'uppercase' as any }],
				'caption':    ['0.675rem', { lineHeight: '0.9rem',     fontWeight: '500', letterSpacing: '0' }],
				'body-sm':    ['0.73rem',  { lineHeight: '1.125rem',  fontWeight: '400', letterSpacing: '-0.003em' }],
				'body':       ['0.84rem',  { lineHeight: '1.35rem',   fontWeight: '400', letterSpacing: '-0.006em' }],
				'body-lg':    ['0.95rem',  { lineHeight: '1.45rem',   fontWeight: '400', letterSpacing: '-0.011em' }],
				'title-3':    ['0.89rem',  { lineHeight: '1.15rem',   fontWeight: '600', letterSpacing: '-0.014em' }],
				'title-2':    ['1.03rem',  { lineHeight: '1.3rem',    fontWeight: '600', letterSpacing: '-0.018em' }],
				'title-1':    ['1.31rem',  { lineHeight: '1.6rem',    fontWeight: '600', letterSpacing: '-0.022em' }],
				'headline':   ['1.59rem',  { lineHeight: '1.875rem',  fontWeight: '600', letterSpacing: '-0.024em' }],
				'display-3':  ['1.875rem', { lineHeight: '2.15rem',   fontWeight: '600', letterSpacing: '-0.026em' }],
				'display-2':  ['2.4375rem',{ lineHeight: '2.625rem',  fontWeight: '600', letterSpacing: '-0.028em' }],
				'display-1':  ['3rem',     { lineHeight: '3.1875rem', fontWeight: '600', letterSpacing: '-0.032em' }],

				// Tailwind defaults — Scaled (Regular -10%, Headings lg+ -25%)
				'xs':   ['0.675rem',  { lineHeight: '0.9rem' }],
				'sm':   ['0.7875rem', { lineHeight: '1.125rem' }],
				'base': ['0.9rem',     { lineHeight: '1.35rem' }],
				'lg':   ['0.84rem',   { lineHeight: '1.2rem' }],
				'xl':   ['0.9375rem', { lineHeight: '1.3rem' }],
				'2xl':  ['1.125rem',  { lineHeight: '1.5rem' }],
				'3xl':  ['1.4rem',    { lineHeight: '1.7rem' }],
				'4xl':  ['1.6875rem', { lineHeight: '1.9rem' }],
				'5xl':  ['2.25rem',   { lineHeight: '1.1' }],
				'6xl':  ['2.8125rem', { lineHeight: '1.05' }],
				'7xl':  ['3.375rem',  { lineHeight: '1.05' }],
			},
			letterSpacing: {
				'tighter': '-0.04em', // Apple ultra-tight for displays
				'tight': '-0.02em',   // Apple tight for headings
				'normal': '0',        // Standard
				'wide': '0.01em',     // Slightly open for readability
				'wider': '0.025em',   // Open for small text
			},
			lineHeight: {
				'tight': '1.25',
				'snug': '1.375',
				'normal': '1.5',
				'relaxed': '1.625',
				'loose': '2',
			},
			fontWeight: {
				'ultralight': '100', // Apple ultralight
				'thin': '200',       // Apple thin
				'light': '300',      // Apple light
				'normal': '400',     // Apple regular
				'medium': '500',     // Apple medium
				'semibold': '600',   // Apple semibold
				'bold': '700',       // Apple bold
				'heavy': '800',      // Apple heavy
				'black': '900',      // Apple black
			},
			borderRadius: {
				DEFAULT: 'var(--radius)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				card: 'var(--shadow-card)',
				elegant: 'var(--shadow-elegant)',
				glow: 'var(--shadow-glow)',
				brand: 'var(--shadow-brand)',
				float: 'var(--shadow-float)',
				glass: 'var(--shadow-glass)',
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-brand': 'var(--gradient-brand)',
				'gradient-brand-soft': 'var(--gradient-brand-soft)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-overlay': 'var(--gradient-overlay)',
			},
			backdropBlur: {
				'apple': '20px',
			},
			spacing: {
				'18': '4.5rem',
				// Apple-inspired responsive icon sizes
				'icon-xs': 'clamp(0.75rem, 1vw, 1rem)',     // 12-16px
				'icon-sm': 'clamp(1rem, 1.25vw, 1.25rem)',  // 16-20px  
				'icon-md': 'clamp(1.25rem, 1.5vw, 1.5rem)', // 20-24px
				'icon-lg': 'clamp(1.5rem, 2vw, 2rem)',      // 24-32px
				'icon-xl': 'clamp(2rem, 2.5vw, 2.5rem)',    // 32-40px
				'icon-2xl': 'clamp(2.5rem, 3vw, 3rem)',     // 40-48px
			},
			keyframes: {
				// Accordion Animations
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				
				// Entry Animations
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-100px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(100px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'50%': { transform: 'scale(1.02)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				
				// Micro-interactions
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsla(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsla(var(--primary) / 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'rotate-scale': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(180deg) scale(1.1)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				
				// Page Transitions
				'page-enter': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'page-exit': {
					'0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
					'100%': { opacity: '0', transform: 'translateY(-20px) scale(0.98)' }
				},
				
				// Stagger Animation
				'stagger-fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				// Basic Animations
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				
				// Micro-interactions
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'rotate-scale': 'rotate-scale 2s ease-in-out infinite',
				
				// Page Transitions
				'page-enter': 'page-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'page-exit': 'page-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				
				// Stagger
				'stagger-fade-in': 'stagger-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				
				// Combined Animations
				'enter': 'fade-in 0.6s ease-out, scale-in 0.5s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
