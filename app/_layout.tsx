import Screen from '@/components/screen'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'

export default function RootLayoutNav() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Screen>
      <Slot 
      screenOptions={{
        headerShown: false
      }}
      />
      </Screen>
    </ClerkProvider>
  )
}