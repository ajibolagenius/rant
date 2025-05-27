import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                // Core Color Tokens - Primary Palette
                primary: {
                    DEFAULT: '#6C63FF', // Deep Purple
                    foreground: '#FFFFFF', // On Primary (Text)
                    light: '#f0f4f8', // Light theme primary color
                    'dark': '#1e293b', // Dark theme primary color
                },
                background: {
                    dark: '#121225', // Night Shade
                    light: '#F5F5F7', // Light Gray
                    DEFAULT: 'hsl(var(--background))',
                    foreground: 'hsl(var(--foreground))'
                },
                text: {
                    light: '#1e293b', // Light theme text color
                    dark: '#f8fafc', // Dark theme text color
                },

                // Accent Palette
                accent: {
                    teal: '#2DD4BF', // Calm
                    amber: '#F59E0B', // Warm
                    rose: '#FB7185', // Emotion
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },

                // UI Colors
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                foreground: 'hsl(var(--foreground))',
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
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

                // Utility Colors
                utility: {
                    'border-subtle': '#2DD4BF22',
                    'border-strong': '#6C63FF88',
                    'text-muted': '#A0AEC0',
                    'text-strong': '#FFFFFF',
                    'error': '#E11D48',
                    'success': '#34D399',
                    'info': '#60A5FA',
                },

                // Mood-Based Colors
                mood: {
                    sad: '#8B93A7',
                    crying: '#6A89CC',
                    angry: '#E74C3C',
                    happy: '#FBBF24',
                    eyeRoll: '#9B59B6',
                    heartbroken: '#E83E8C',
                    mindBlown: '#8E44AD',
                    speechless: '#5D6D7E',
                    confused: '#F39C12',
                    tired: '#7F8C8D',
                    nervous: '#D35400',
                    smiling: '#F1C40F',
                    laughing: '#F7DC6F',
                    celebratory: '#2ECC71',
                    confident: '#3498DB',
                    loved: '#FF66B2',
                    neutral: '#9CA3AF',
                }
            },
            fontFamily: {
                // Typography System
                heading: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                ui: ['Urbanist', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                urbanist: ['Urbanist', 'sans-serif']
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                // Shadow & Elevation System
                'low': '0 1px 2px rgba(0,0,0,0.05)',
                'medium': '0 4px 12px rgba(0,0,0,0.1)',
                'high': '0 12px 24px rgba(0,0,0,0.2)',
                'glow-accent': '0 0 15px var(--color-accent-glow)',
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
                },
                'fade-in': {
                    from: {
                        opacity: '0'
                    },
                    to: {
                        opacity: '1'
                    }
                },
                'slide-up': {
                    from: {
                        transform: 'translateY(10px)'
                    },
                    to: {
                        transform: 'translateY(0)'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-up': 'slide-up 0.3s ease-out'
            }
        }
    },
    plugins: [
        tailwindcssAnimate,
        // Add plugin for gradient text
        function ({ addUtilities }) {
            const newUtilities = {
                '.text-gradient-primary': {
                    background: 'linear-gradient(to right, #6C63FF, #2DD4BF)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                },
                '.text-gradient-warm': {
                    background: 'linear-gradient(to right, #F59E0B, #FB7185)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                },
            }
            addUtilities(newUtilities)
        }
    ],
} satisfies Config;
