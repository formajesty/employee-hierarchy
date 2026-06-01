'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { store } from "./store";
import { Provider } from 'react-redux';

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        {children}
      </MantineProvider>
    </Provider>
  );
}