import { vars } from 'nativewind'
import colors from 'tailwindcss/colors'

export const themes = {
  light: vars({
    '--color-background': colors.white,
    '--color-foreground': colors.black,
    '--color-foreground-accent': 'hsl(163 94% 24%)',
    '--color-foreground-danger': colors.red['600'],
    '--color-foreground-secondary': colors.slate['500'],
    '--color-foreground-on-accent': colors.white,
    '--color-background-card': colors.slate['100'],
    '--color-background-accent': 'hsl(163 94% 24%)',
    '--color-border': colors.slate['200'],
    '--color-background-positive': colors.green['300'],
    '--color-border-positive': colors.green['400'],
    '--color-background-negative': colors.red['300'],
    '--color-border-negative': colors.red['400'],
  }),
  dark: vars({
    '--color-background': colors.black,
    '--color-foreground': colors.white,
    '--color-foreground-accent': 'hsl(161 90% 45%)',
    '--color-foreground-danger': colors.red['600'],
    '--color-foreground-secondary': colors.slate['400'],
    '--color-foreground-on-accent': colors.black,
    '--color-background-card': colors.slate['900'],
    '--color-background-accent': 'hsl(161 90% 45%)',
    '--color-border': colors.slate['800'],
    '--color-background-positive': colors.green['900'],
    '--color-border-positive': colors.green['800'],
    '--color-background-negative': colors.red['900'],
    '--color-border-negative': colors.red['800'],
  }),
}
