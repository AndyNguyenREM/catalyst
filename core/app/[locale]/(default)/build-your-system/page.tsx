import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { BuildYourSystem } from './_components/build-your-system';
import { getBuilderData } from './page-data';

export const metadata: Metadata = {
  title: 'Build Your System',
  description: 'Assemble your custom Ultradyne shooting system and add it to your cart.',
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BuildYourSystemPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const steps = await getBuilderData();

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-bold uppercase text-foreground">
          Build Your System
        </h1>
      </div>

      <BuildYourSystem steps={steps} />
    </div>
  );
}
