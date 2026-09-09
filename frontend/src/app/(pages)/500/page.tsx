import { Metadata } from 'next';
import ErrorClient from './error-client';

export const metadata: Metadata = {
  title: 'System Interruption',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobalError500() {
  return <ErrorClient />;
}
