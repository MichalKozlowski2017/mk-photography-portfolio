import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [photos] = await Promise.all([
    prisma.photo.findMany({
      where: { published: true },
      select: { url: true, title: true },
    }),
    getT(),
  ]);

  const heroPhotos = [...photos].sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <>
      <HeroSlider photos={heroPhotos} />
    </>
  );
}
