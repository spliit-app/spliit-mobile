import { cn } from '@/utils/cn'
import { PropsWithChildren } from 'react'
import {
  Text,
  TextInput as BaseTextInput,
  TextInputProps,
  View,
} from 'react-native'

export function FormSection({ children }: PropsWithChildren) {
  return (
    <View className="p-4 bg-slate-100 rounded-md mb-2 mx-4 flex-row justify-between flex-col gap-4">
      {children}
    </View>
  )
}

export function FormSectionTitle({ children }: PropsWithChildren) {
  return <Text className="text-lg font-bold px-4 mb-2 mt-4">{children}</Text>
}

export function FormGroup({ children }: PropsWithChildren) {
  return <View className="flex-col gap-1">{children}</View>
}

export function Label({ children }: PropsWithChildren) {
  return <Text className="font-semibold">{children}</Text>
}

export function HelpText({ children }: PropsWithChildren) {
  return <Text className="text-gray-600 text-sm">{children}</Text>
}

export function ErrorMessage({ children }: PropsWithChildren) {
  return <Text className="text-red-600 text-sm">{children}</Text>
}

export function TextInput({
  hasError,
  ...props
}: TextInputProps & { hasError?: boolean }) {
  return (
    <BaseTextInput
      className={cn(
        'bg-white px-2 pt-1 pb-2 rounded-lg border border-gray-200 text-lg',
        hasError ? 'border-red-500' : ''
      )}
      {...props}
    />
  )
}
