import '@tomo-inc/tomo-evm-kit/styles.css';
import './global.scss';

import type { Session } from 'next-auth';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {
  type AvatarComponent,
  type DisclaimerComponent,
  type Locale,
  TomoEVMKitProvider,
  darkTheme,
  lightTheme,
  midnightTheme,
} from '@tomo-inc/tomo-evm-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useDisconnect } from 'wagmi';

import type { AppContextProps } from '../lib/AppContextProps';
import { config } from '../wagmi';

const RAINBOW_TERMS = 'https://rainbow.me/terms-of-use';

const demoAppInfo = {
  appName: 'Rainbowkit Demo',
};

const DisclaimerDemo: DisclaimerComponent = ({ Link, Text }) => {
  return (
    <Text>
      By connecting, you agree to this demo&apos;s{' '}
      <Link href={RAINBOW_TERMS}>Terms of Service</Link> and acknowledge you
      have read and understand our <Link href={RAINBOW_TERMS}>Disclaimer</Link>
    </Text>
  );
};

const CustomAvatar: AvatarComponent = ({ size }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: 'lightpink',
        color: 'black',
        display: 'flex',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      :^)
    </div>
  );
};

// const getSiweMessageOptions: GetSiweMessageOptions = () => ({
//   statement: 'Sign in to the RainbowKit Demo',
// });

const themes = [
  { name: 'light', theme: lightTheme },
  { name: 'dark', theme: darkTheme },
  { name: 'midnight', theme: midnightTheme },
] as const;
type ThemeName = (typeof themes)[number]['name'];

function RainbowKitApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  const router = useRouter();

  const [selectedInitialChainId] = useState<number>();
  const [selectedThemeName] = useState<ThemeName>('light');
  const [authEnabled] = useState(pageProps.session !== null);
  const [showDisclaimer] = useState(false);
  const [customAvatar] = useState(false);

  const routerLocale = router.locale as Locale;

  // Set `locale` as default from next.js and let dropdown set new `locale`
  const [locale, _setLocale] = useState<Locale>(routerLocale);

  const backgroundStyles = {
    dark: { background: '#090913', color: '#FFF' },
    light: null,
    midnight: { background: '#0B0E17', color: '#FFF' },
  };

  const selectedBackgroundStyles = backgroundStyles[selectedThemeName];

  const appContextProps: AppContextProps = { authEnabled };

  const [themeType, setThemeType] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (window as any).toggleTheme = () => {
      setThemeType((theme) => {
        if (theme === 'dark') return 'light';
        return 'dark';
      });
    };
  }, []);

  // const locales = router.locales as Locale[];

  // Note: Non-RainbowKit providers are wrapped around this component
  // at the bottom of the file. This is so that our example app
  // component can use their corresponding Hooks.
  return (
    <TomoEVMKitProvider
      appInfo={{
        ...demoAppInfo,
        ...(showDisclaimer && { disclaimer: DisclaimerDemo }),
      }}
      avatar={customAvatar ? CustomAvatar : undefined}
      locale={locale}
      initialChain={selectedInitialChainId}
      theme={themeType}
    >
      <div
        style={{
          ...selectedBackgroundStyles,
        }}
        className="demo-container"
      >
        <Component {...pageProps} {...appContextProps} />
      </div>
    </TomoEVMKitProvider>
  );
}

const queryClient = new QueryClient();

export default function App(
  appProps: AppProps<{
    session: Session;
  }>,
) {
  return (
    <>
      <Head>
        <title>Tomo Connect Example</title>
        <link href="/favicon.ico" rel="icon" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0,user-scalable=no"
        />
      </Head>

      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitApp {...appProps} />
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
