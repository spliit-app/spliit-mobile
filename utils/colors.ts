import { useColorScheme } from 'nativewind'

export const BRAND_COLOR = '#059669'
export const textBrand = 'text-[#059669]'
export const bgBrand = 'bg-[#059669]'
export const SECONDARY_BRAND_COLOR = '#be185d'

export const useColor = (lightColor: string, darkColor: string) => {
  const { colorScheme } = useColorScheme()
  return colorScheme === 'light' ? lightColor : darkColor
}
