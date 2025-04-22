import { cn } from '@/utils/cn'
import { BRAND_COLOR, bgBrand } from '@/utils/colors'
import { Category, GroupParticipant } from '@/utils/trpc'
import { errorMessages } from '@/utils/validation'
import { FontAwesome6 } from '@expo/vector-icons'
import { PropsWithChildren, useState } from 'react'
import {
  Text,
  TextInput as BaseTextInput,
  TextInputProps,
  View,
  Pressable,
  Modal,
  SectionList,
  FlatList,
  TextProps,
  ViewProps,
} from 'react-native'
import DateTimePicker from 'react-native-ui-datepicker'

export function FormSection({ children }: PropsWithChildren) {
  return (
    <View className="p-4 bg-background-card rounded-md mb-2 mx-4 justify-between flex-col gap-4">
      {children}
    </View>
  )
}

export function FormSectionTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        'text-lg font-bold px-4 mb-2 mt-4 text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function FormGroup({ className, ...props }: ViewProps) {
  return <View className={cn('flex-col gap-1', className)} {...props} />
}

export function Label({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
}

export function HelpText({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-sm text-foreground-secondary', className)}
      {...props}
    />
  )
}

export function ErrorMessage({ children }: PropsWithChildren) {
  return (
    <Text className="text-foreground-danger text-sm">
      {typeof children === 'string' && children in errorMessages
        ? errorMessages[children]
        : children}
    </Text>
  )
}

export function TextInput({
  hasError,
  className,
  ...props
}: TextInputProps & { hasError?: boolean }) {
  return (
    <BaseTextInput
      verticalAlign="middle"
      className={cn(
        'bg-background px-2 py-2 rounded-lg border border-border text-md text-foreground',
        hasError ? 'border-foreground-danger' : '',
        className,
      )}
      {...props}
    />
  )
}

export function AmountInput({
  value,
  onChangeValue,
  onChangeText,
  onBlur,
  onFocus,
  className,
  hasError,
  currency = '',
  precision = 2,
  ...props
}: {
  value?: number
  onChangeValue: (value: number) => void
  hasError?: boolean
  currency?: string
  precision?: number
} & Omit<TextInputProps, 'value'>) {
  const [textValue, setTextValue] = useState(
    formatLocaleNumber({
      number: value || 0,
      locale: 'en-US',
      currency,
      precision,
    }),
  )

  return (
    <TextInput
      value={textValue}
      hasError={hasError}
      inputMode="decimal"
      keyboardType="decimal-pad"
      onChangeText={(text) => {
        onChangeText?.(text)
        setTextValue(text)
        const valueAsNumber = parseLocaleNumber({
          numberString: text,
          locale: 'en-US',
          currency,
        })
        if (!Number.isNaN(valueAsNumber)) {
          onChangeValue?.(valueAsNumber * 100)
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        const valueAsNumber =
          parseLocaleNumber({
            numberString: textValue,
            locale: 'en-US',
            currency,
          }) || 0
        setTextValue(
          formatLocaleNumber({
            number: valueAsNumber,
            locale: 'en-US',
            currency,
            precision,
          }),
        )
      }}
      className={cn(className)}
      {...props}
    />
  )
}

function formatLocaleNumber({
  number,
  locale,
  currency,
  precision,
}: {
  number: number
  locale: string
  currency: string
  precision: number
}) {
  return formatCurrency({
    currency,
    amount: number,
    locale,
    fractions: true,
    precision,
  })
}

function formatCurrency({
  currency,
  amount,
  locale,
  fractions,
  precision,
}: {
  currency: string
  amount: number
  locale: string
  fractions?: boolean
  precision: number
}) {
  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    style: 'currency',
    // '€' will be placed in correct position
    currency: 'EUR',
  })
  const formattedAmount = format.format(fractions ? amount : amount / 100)
  return currency
    ? formattedAmount.replace('€', currency)
    : formattedAmount.replace(/\s*€\s*/, '')
}

function parseLocaleNumber({
  numberString,
  locale,
  currency,
}: {
  numberString: string
  locale: string
  currency?: string
}) {
  const example = 12345.6
  const formattedExample = new Intl.NumberFormat(locale).format(example)

  const groupingSeparator = formattedExample.includes('12,345') ? ',' : '.'
  const decimalSeparator = formattedExample.includes('.6') ? '.' : ','

  // Remove grouping separators and replace decimal separator with a dot
  const normalizedNumberString = numberString
    .replace(new RegExp(`\\${groupingSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.')
    .replace(currency ?? '', '')

  return parseFloat(normalizedNumberString)
}

export function CategoryInput({
  value,
  categories,
  onChange,
  hasError = false,
}: {
  value: Category | null
  categories: Category[]
  onChange: (category: Category) => void
  hasError?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pressable
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-2 flex-row items-center active:opacity-60',
          hasError && 'border-red-500',
        )}
        onPress={() => {
          setOpen(true)
        }}
      >
        <FontAwesome6
          name="money-bill"
          color="gray"
          size={14}
          className="ml-1 mr-2.5"
        />
        <Text className="text-lg flex-1">
          {value?.name ?? 'Select a participant'}
        </Text>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <CategoryInputModalContent
          category={value}
          categories={categories}
          onSubmit={(date) => {
            onChange(date)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
export function ParticipantInput({
  value,
  participants,
  onChange,
  hasError = false,
}: {
  value: GroupParticipant | null
  participants: GroupParticipant[]
  onChange: (participant: GroupParticipant) => void
  hasError?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pressable
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-2 flex-row items-center active:opacity-60',
          hasError && 'border-red-500',
        )}
        onPress={() => {
          setOpen(true)
        }}
      >
        <FontAwesome6
          name="user-large"
          color="gray"
          size={14}
          className="ml-1 mr-2.5"
        />
        <Text className="text-lg flex-1">
          {value?.name ?? 'Select a participant'}
        </Text>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <ParticipantInputModalContent
          participant={value}
          participants={participants}
          onSubmit={(date) => {
            onChange(date)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}

export function DateInput({
  value,
  onChange,
  hasError = false,
}: {
  value: Date
  onChange: (...params: any[]) => void
  hasError?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pressable
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-2 flex-row items-center active:opacity-60',
          hasError && 'border-red-500',
        )}
        onPress={() => {
          setOpen(true)
        }}
      >
        <FontAwesome6
          name="calendar"
          color="gray"
          size={14}
          className="ml-1 mr-2.5"
        />
        <Text className="text-lg flex-1">
          {value.toLocaleString('en-US', { dateStyle: 'medium' })}
        </Text>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <DateInputModalContent
          date={value}
          onSubmit={(date) => {
            onChange(date)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}

function ParticipantInputModalContent({
  participant: initialParticipant,
  participants: participants,
  onCancel,
  onSubmit,
}: {
  participant: GroupParticipant | null
  participants: GroupParticipant[]
  onCancel: () => void
  onSubmit: (participant: GroupParticipant) => void
}) {
  const [participant, setParticipant] = useState(initialParticipant)

  return (
    <View className="h-full relative justify-center p-2">
      <Pressable
        onPress={() => onCancel()}
        className="absolute top-0 bottom-0 right-0 left-0 bg-gray-500 opacity-80"
      />
      <View className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <View className="h-[400px]">
          <FlatList
            data={participants}
            keyExtractor={({ id }) => String(id)}
            renderItem={({ item, index }) => (
              <Pressable
                className={cn(
                  'py-3 border-gray-200 ml-4 pr-4 flex-row active:opacity-60',
                  index > 0 && 'border-t',
                )}
                onPress={() => setParticipant(item)}
              >
                <Text
                  className={cn(
                    'flex-1 items-center text-lg',
                    participant?.id === item.id && 'font-semibold',
                  )}
                >
                  {item.name}
                </Text>
                {participant?.id === item.id && (
                  <FontAwesome6 name="check" size={16} className="mt-1" />
                )}
              </Pressable>
            )}
          />
        </View>
        <View className="flex-row gap-4 justify-end border-t border-gray-200 p-2">
          <Pressable
            className="px-4 py-2 rounded-lg active:opacity-60"
            onPress={() => onCancel()}
          >
            <Text className="text-lg font-semibold">Close</Text>
          </Pressable>
          <Pressable
            className={cn(bgBrand, 'px-4 py-2 rounded-lg active:opacity-60')}
            onPress={() => participant && onSubmit(participant)}
          >
            <Text className="text-white text-lg font-semibold">Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function CategoryInputModalContent({
  category: initialCategory,
  categories,
  onCancel,
  onSubmit,
}: {
  category: Category | null
  categories: Category[]
  onCancel: () => void
  onSubmit: (category: Category) => void
}) {
  const [category, setCategory] = useState(initialCategory)
  const sections = Object.entries(
    categories.reduce<Record<string, Category[]>>(
      (acc, category) => ({
        ...acc,
        [category.grouping]: [...(acc[category.grouping] ?? []), category],
      }),
      {},
    ),
  ).map(([group, categories]) => ({
    title: group,
    data: categories,
  }))

  return (
    <View className="h-full relative justify-center p-2">
      <Pressable
        onPress={() => onCancel()}
        className="absolute top-0 bottom-0 right-0 left-0 bg-gray-500 opacity-80"
      />
      <View className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <View className="h-[400px]">
          <SectionList
            sections={sections}
            keyExtractor={({ id }) => String(id)}
            renderItem={({ item, index }) => (
              <Pressable
                className={cn(
                  'py-3 border-gray-200 ml-4 pr-4 flex-row active:opacity-60',
                  index > 0 && 'border-t',
                )}
                onPress={() => setCategory(item)}
              >
                <Text
                  className={cn(
                    'flex-1 items-center text-lg',
                    category?.id === item.id && 'font-semibold',
                  )}
                >
                  {item.name}
                </Text>
                {category?.id === item.id && (
                  <FontAwesome6 name="check" size={16} className="mt-1" />
                )}
              </Pressable>
            )}
            renderSectionHeader={({ section }) => (
              <View className="bg-slate-100 py-1 px-2 border-y border-gray-200">
                <Text className="font-semibold">{section.title}</Text>
              </View>
            )}
          />
        </View>
        <View className="flex-row gap-4 justify-end border-t border-gray-200 p-2">
          <Pressable
            className="px-4 py-2 rounded-lg active:opacity-60"
            onPress={() => onCancel()}
          >
            <Text className="text-lg font-semibold">Close</Text>
          </Pressable>
          <Pressable
            className={cn(bgBrand, 'px-4 py-2 rounded-lg active:opacity-60')}
            onPress={() => category && onSubmit(category)}
          >
            <Text className="text-white text-lg font-semibold">Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function DateInputModalContent({
  date: initialDate,
  onCancel,
  onSubmit,
}: {
  date: Date
  onCancel: () => void
  onSubmit: (date: Date) => void
}) {
  const [date, setDate] = useState(initialDate)
  return (
    <View className="h-full relative justify-center px-2">
      <Pressable
        onPress={() => onCancel()}
        className="absolute top-0 bottom-0 right-0 left-0 bg-gray-500 opacity-80"
      />
      <View className="p-4 bg-white border border-gray-200 rounded-lg">
        <DateTimePicker
          mode="single"
          onChange={({ date }) => {
            if (date) setDate(new Date(date?.valueOf()))
          }}
          date={date}
          selectedItemColor={BRAND_COLOR}
        />
        <View className="flex-row gap-4 justify-end">
          <Pressable
            className="px-4 py-2 rounded-lg active:opacity-60"
            onPress={() => onCancel()}
          >
            <Text className="text-lg font-semibold">Close</Text>
          </Pressable>
          <Pressable
            className={cn(bgBrand, 'px-4 py-2 rounded-lg active:opacity-60')}
            onPress={() => onSubmit(date)}
          >
            <Text className="text-white text-lg font-semibold">Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
