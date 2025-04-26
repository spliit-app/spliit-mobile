import { useColorScheme } from 'nativewind'

export const useColor = (lightColor: string, darkColor: string) => {
  const { colorScheme } = useColorScheme()
  return colorScheme === 'light' ? lightColor : darkColor
}
