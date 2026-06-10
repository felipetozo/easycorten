import type { Metadata } from 'next';
import ConteudoPage from './ConteudoPage';

export const metadata: Metadata = {
  title: 'Conteúdo | Easy Corten Admin',
};

export default function Page() {
  return <ConteudoPage />;
}
