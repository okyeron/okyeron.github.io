import { useMeta } from 'quasar'

export const usePageTitle = (deviceName: string) =>
  useMeta({
    title: `${deviceName} Configurator - denki oto`,
  })
