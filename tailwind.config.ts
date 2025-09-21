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
			sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
			heading: ['Poppins', 'Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			display: ['Poppins', 'Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'monospace'],
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
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					lighter: 'hsl(var(--primary-lighter))',
					50: 'hsl(199 100% 95%)',
					100: 'hsl(198 100% 85%)',
					500: 'hsl(var(--primary))',
					600: 'hsl(196 100% 40%)',
					700: 'hsl(195 100% 35%)'
				},
				'brand-green': {
					DEFAULT: 'hsl(var(--brand-green))',
					foreground: 'hsl(var(--brand-green-foreground))',
					light: 'hsl(var(--brand-green-light))',
					lighter: 'hsl(var(--brand-green-lighter))'
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
				// Apple-inspired dark text colors
				text: {
					primary: 'hsl(0, 0%, 10%)', // #1a1a1a - Primary dark text
					secondary: 'hsl(0, 0%, 29%)', // #4a4a4a - Secondary dark text
					tertiary: 'hsl(0, 0%, 50%)', // #808080 - Tertiary dark text
				},
				// Glass effect backgrounds
				glass: {
					light: 'hsl(0, 0%, 100%, 0.8)', // White with 80% opacity
					dark: 'hsl(0, 0%, 0%, 0.05)', // Black with 5% opacity
				},
				// Highlight colors
				orange: {
					DEFAULT: 'hsl(35, 100%, 63%)', // #FFB84C
					50: 'hsl(35, 100%, 95%)',
					100: 'hsl(35, 100%, 90%)',
					500: 'hsl(35, 100%, 63%)',
					600: 'hsl(35, 100%, 55%)',
				},
				green: {
					DEFAULT: 'hsl(152, 60%, 57%)', // #57CC99
					50: 'hsl(152, 60%, 95%)',
					100: 'hsl(152, 60%, 90%)',
					500: 'hsl(152, 60%, 57%)',
					600: 'hsl(152, 60%, 50%)',
				},
				red: {
					DEFAULT: 'hsl(0, 79%, 70%)', // #FF6B6B
					50: 'hsl(0, 79%, 95%)',
					100: 'hsl(0, 79%, 90%)',
					500: 'hsl(0, 79%, 70%)',
					600: 'hsl(0, 79%, 60%)',
				}
			},
			fontSize: {
				// Display & Headlines
				'display': ['3rem', { lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.02em' }],      // 48px
				'headline': ['2.25rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.015em' }],   // 36px
				'title': ['1.875rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],    // 30px
				'subtitle': ['1.5rem', { lineHeight: '1.375', fontWeight: '600', letterSpacing: '0' }],       // 24px
				'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0' }],      // 20px
				
				// Body Text
				'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0' }],     // 18px
				'body': ['1rem', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],               // 16px
				'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],     // 14px
				'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.025em' }],   // 12px
				
				// Legacy support
				'heading-xl': ['1.5rem', { lineHeight: '1.375', fontWeight: '600' }],   // 24px
				'heading-lg': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],   // 18px
				'heading-md': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],       // 16px
			},
			letterSpacing: {
				'tighter': '-0.05em',
				'tight': '-0.025em',
				'normal': '0',
				'wide': '0.025em',
				'wider': '0.05em',
			},
			lineHeight: {
				'tight': '1.25',
				'snug': '1.375',
				'normal': '1.5',
				'relaxed': '1.625',
				'loose': '2',
			},
			fontWeight: {
				'light': '300',
				'normal': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
				'extrabold': '800',
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
