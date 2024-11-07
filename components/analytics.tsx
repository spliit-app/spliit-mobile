import { useEffect, useMemo } from 'react'
import Plausible from 'react-native-plausible-tracker'

type ScreenEvent =
  | { screenName: 'home'; eventProps?: undefined }
  | { screenName: 'create-group'; eventProps?: undefined }
  | { screenName: 'add-group-by-url'; eventProps?: undefined }
  | { screenName: 'about'; eventProps?: undefined }
  | { screenName: 'group-settings'; eventProps: { groupId: string } }
  | { screenName: 'group-expenses'; eventProps: { groupId: string } }
  | { screenName: 'group-balances'; eventProps: { groupId: string } }
  | { screenName: 'group-create-expense'; eventProps: { groupId: string } }
  | {
      screenName: 'group-edit-expense'
      eventProps: { groupId: string; expenseId: string }
    }

type Event =
  | { eventName: 'create-group'; eventProps?: undefined }
  | { eventName: 'create-expense'; eventProps: { groupId: string } }

export function useAnalytics() {
  return useMemo(() => {
    const plausible = Plausible({
      domain: 'spliit.app/mobile',
      // trackDuringDevelopment: true,
      // debug: true,
    })

    const decorateWithLogger =
      <T extends object>(fn: (event: T) => void) =>
      (event: T) => {
        console.info('Tracking event:', event)
        return fn(event)
      }

    return {
      trackScreen: decorateWithLogger((event: ScreenEvent) =>
        plausible.trackScreen(event.screenName, event.eventProps)
      ),
      trackEvent: decorateWithLogger((event: Event) =>
        plausible.trackEvent(event.eventName, event.eventProps)
      ),
    }
  }, [])
}

export function TrackScreen(screenEvent: ScreenEvent) {
  const analytics = useAnalytics()

  useEffect(() => {
    analytics.trackScreen(screenEvent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, JSON.stringify(screenEvent)])

  return null
}
