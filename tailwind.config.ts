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
			sans: ['Inter', 'ui-sans-serif', 'system-ui'],
			display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
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
					DEFAULT: 'hsl(220, 91%, 60%)', // #3478F6 - Job Blue
					foreground: 'hsl(0, 0%, 100%)'
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
				'heading-xl': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-lg': ['18px', { lineHeight: '1.3', fontWeight: '700' }],
				'heading-md': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
				'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
			},
			borderRadius: {
				DEFAULT: 'var(--radius)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				card: 'var(--shadow-card)',
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
