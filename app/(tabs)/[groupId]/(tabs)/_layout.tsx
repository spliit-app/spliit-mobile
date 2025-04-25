import { useColor } from '@/utils/colors'
import { FontAwesome6 } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useColorScheme } from 'nativewind'
import colors from 'tailwindcss/colors'

export default function TabLayout() {
  const { colorScheme } = useColorScheme()

  const activeTintColor = useColor('hsl(163 94% 24%)', 'hsl(161 90% 45%)')
  const inactiveTintColor = useColor(colors.slate['500'], colors.slate['400'])
  const borderColor = useColor(colors.slate['500'], colors.slate['400'])

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTintColor,
          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
            borderColor,
          },
          sceneStyle: {backgroundColor: colorScheme === 'light' ? colors.white : colors.black}
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Expenses',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="list" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="balances"
          options={{
            title: 'Balances',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="money-bill-transfer"
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
