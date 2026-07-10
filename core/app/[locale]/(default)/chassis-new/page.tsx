import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { type Product } from '@/vibes/soul/primitives/product-card';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import MakeswiftSubscribe from '~/lib/makeswift/components/constant-contact-subscribe/constant-contact-subscribe.makeswift';

import { getChassisAccessories, getChassisProducts } from './page-data';

export const metadata: Metadata = {
  title: 'Chassis',
  description: 'Ultradyne rifle chassis — precision, modularity, and build-your-own options.',
};

interface Props {
  params: Promise<{ locale: string }>;
}

function formatPrice(value: number | null, currency: string): string {
  if (value == null) return '';

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

// PLACEHOLDER copy — swap for real marketing text.
const WHY_POINTS = [
  {
    title: 'Precision Engineered',
    body: 'Machined to exacting tolerances for a rock-solid, repeatable platform shot after shot.',
  },
  {
    title: 'Fully Modular',
    body: 'Mix and match actions, buttstocks, grips, and accessories to build exactly what you need.',
  },
  {
    title: 'Built to Last',
    body: 'Aircraft-grade materials and hard-anodized finishes stand up to the field and the range.',
  },
];

// PLACEHOLDER video slots — swap in real chassis YouTube videos.
const VIDEO_PLACEHOLDERS = ['Chassis Overview', 'Install Walkthrough', 'At the Range'];

export default async function ChassisNewPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [products, accessories] = await Promise.all([
    getChassisProducts(),
    getChassisAccessories(),
  ]);

  const toListProduct = (product: {
    entityId: number;
    name: string;
    path: string;
    image: string | null;
    price: number | null;
    currency: string;
  }): Product => ({
    id: String(product.entityId),
    title: product.name,
    href: product.path,
    image: product.image ? { src: product.image, alt: product.name } : undefined,
    price: product.price != null ? formatPrice(product.price, product.currency) : undefined,
  });

  const listProducts: Product[] = products.map(toListProduct);
  const accessoryProducts: Product[] = accessories.map(toListProduct);

  return (
    <div className="bg-background">
      {/* ---------- 1. Hero (real banner + overlaid content, like the old page) ---------- */}
      <section className="relative w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Ultradyne Chassis"
          className="h-full min-h-[360px] w-full object-cover sm:min-h-[440px]"
          src="/pagemedia/chassis-hero.jpeg"
        />
        {/* Darken the left side so overlaid text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-screen-2xl px-4 @xl:px-6 @4xl:px-8">
            <div className="max-w-xl">
              {/* PLACEHOLDER headline/copy — swap for real marketing text */}
              <h1 className="font-heading text-4xl font-bold uppercase leading-none text-white sm:text-5xl lg:text-6xl">
                Built to Perform
              </h1>
              <p className="mt-4 text-base text-white/85 sm:text-lg">
                Precision-built, fully modular rifle chassis systems.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex rounded-full bg-primary px-8 py-3 font-semibold uppercase text-foreground transition-opacity hover:opacity-90"
                  href="/build-your-system"
                >
                  Build Your Own Chassis
                </a>
                <a
                  className="inline-flex rounded-full border border-white/70 px-8 py-3 font-semibold uppercase text-white transition-colors hover:bg-white/10"
                  href="#lineup"
                >
                  Shop Chassis
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 2. Why choose an Ultradyne chassis ---------- */}
      <SectionLayout>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-medium leading-none @xl:text-4xl">
            Why Choose an Ultradyne Chassis
          </h2>
          <p className="mt-3 text-contrast-500">
            Built by shooters, for shooters. Here&apos;s what sets an Ultradyne chassis apart.
          </p>
        </div>
        <div className="mt-10 grid gap-6 @sm:grid-cols-3">
          {WHY_POINTS.map((point) => (
            <div className="rounded-xl border border-contrast-100 p-6 text-center" key={point.title}>
              <h3 className="font-heading text-lg font-medium uppercase text-foreground">
                {point.title}
              </h3>
              <p className="mt-2 text-sm text-contrast-500">{point.body}</p>
            </div>
          ))}
        </div>
      </SectionLayout>

      {/* ---------- 3. Build your own chassis (image band — matches hero / why-section style) ---------- */}
      <section className="relative w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Build your own Ultradyne chassis"
          className="h-full min-h-[360px] w-full object-cover sm:min-h-[440px]"
          src="/pagemedia/chassis-hero.jpeg"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-screen-2xl px-4 text-center @xl:px-6 @4xl:px-8">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
              <h2 className="font-heading text-3xl font-medium uppercase leading-none text-white @xl:text-5xl">
                Build Your Own Chassis
              </h2>
              <p className="text-white/85">
                Configure your complete setup — chassis, buttstock, grip and more — and see it come
                together in 3D.
              </p>
              <a
                className="mt-2 inline-flex rounded-full bg-primary px-8 py-3 font-semibold uppercase text-foreground transition-opacity hover:opacity-90"
                href="/build-your-system"
              >
                Start Building
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 4. Shop chassis (real site product grid) ---------- */}
      <div id="lineup">
        <SectionLayout>
          <h2 className="mb-8 font-heading text-3xl font-medium leading-none @xl:text-4xl">
            Explore the Lineup
          </h2>
          <ProductList
            aspectRatio="4:3"
            products={Streamable.from(() => Promise.resolve(listProducts))}
            showCompare={false}
          />
        </SectionLayout>
      </div>

      {/* ---------- 4b. Chassis accessories ---------- */}
      {accessoryProducts.length > 0 ? (
        <SectionLayout>
          <h2 className="mb-8 font-heading text-3xl font-medium leading-none @xl:text-4xl">
            Chassis Accessories
          </h2>
          <ProductList
            aspectRatio="4:3"
            products={Streamable.from(() => Promise.resolve(accessoryProducts))}
            showCompare={false}
          />
        </SectionLayout>
      ) : null}

      {/* ---------- 5. Videos ---------- */}
      <section className="bg-contrast-100">
        <SectionLayout>
          <h2 className="mb-8 font-heading text-3xl font-medium leading-none @xl:text-4xl">
            Chassis System in Action
          </h2>
          <div className="grid gap-6 @sm:grid-cols-3">
            {VIDEO_PLACEHOLDERS.map((label) => (
              <div
                className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-contrast-300 bg-background text-sm text-contrast-400"
                key={label}
              >
                ▶ {label} (video placeholder)
              </div>
            ))}
          </div>
        </SectionLayout>
      </section>

      {/* ---------- 6. Newsletter (real Constant Contact subscribe, like the old page) ---------- */}
      <section className="relative w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Ultradyne newsletter"
          className="h-[260px] w-full object-cover sm:h-[320px]"
          src="/pagemedia/newsletter.jpg"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-screen-2xl px-4 text-center @xl:px-6 @4xl:px-8">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
              <h2 className="font-heading text-3xl font-medium uppercase leading-none text-white @xl:text-5xl">
                Stay Dialed In
              </h2>
              <p className="text-white/85">
                Subscribe for new products, drops, and range-ready tips.
              </p>
              <MakeswiftSubscribe
                buttonText="Subscribe to Newsletter"
                ctctM="f270aeecce6a8e6100a678ebfbe8b6e5"
                link={{ href: '/newsletter' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
