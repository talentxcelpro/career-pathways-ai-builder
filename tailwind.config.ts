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
					lighter: 'hsl(var(--primary-lighter))'
				},
				'brand-green': {
					DEFAULT: 'hsl(var(--brand-green))',
					foreground: 'hsl(var(--brand-green-foreground))',
					light: 'hsl(var(--brand-green-light))',
					lighter: 'hsl(var(--brand-green-lighter))'
				},
				secondary: {
					DEFAULT: 'hsl(240, 9%, 98%)', // #FAFAFA
					foreground: 'hsl(220, 91%, 60%)'
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
					DEFAULT: 'hsl(234, 48%, 97%)', // #F2F5FF
					foreground: 'hsl(220, 91%, 60%)'
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
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
