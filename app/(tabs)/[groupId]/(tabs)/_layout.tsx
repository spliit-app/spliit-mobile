import { BRAND_COLOR } from '@/utils/colors'
import { FontAwesome6 } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Expenses',
            headerShown: false,
            tabBarActiveTintColor: BRAND_COLOR,
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
            tabBarActiveTintColor: BRAND_COLOR,
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="money-bill-transfer"
                size={28}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
