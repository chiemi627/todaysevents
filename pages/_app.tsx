import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import "../styles/globals.css"  // もしTailwindを使用している場合

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}