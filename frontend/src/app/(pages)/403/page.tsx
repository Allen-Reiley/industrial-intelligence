import { Metadata } from 'next';
import ForbiddenClient from './forbidden-client';

export const metadata: Metadata = {
  title: 'Access Restricted',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Forbidden403() {
  return <ForbiddenClient />;
}
