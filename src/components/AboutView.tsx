import React from 'react';
import { resolveMediaUrl } from '../data/mediaAssets';
import type { AboutContent } from '../data/workshop';

interface AboutViewProps {
  aboutContent: AboutContent;
  onNavigateContact: () => void;
  onNavigateDirections: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  aboutContent,
  onNavigateContact,
  onNavigateDirections,
}) => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* Intro Split */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch border-b border-[#E6E2D8] pb-14">
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
            {aboutContent.kicker}
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-medium tracking-tight text-[#18181B] leading-[1.08]">
            {aboutContent.headline}
          </h1>
          <p className="mt-5 text-base text-[#57534E] leading-relaxed">
            {aboutContent.leadParagraph}
          </p>
          <p className="mt-4 text-sm text-[#57534E] leading-relaxed">
            {aboutContent.secondaryParagraph}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNavigateContact}
              className="bg-[#18181B] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#27272A] cursor-pointer whitespace-nowrap"
            >
              Kontakt z pracownią
            </button>
            <button
              type="button"
              onClick={onNavigateDirections}
              className="border border-[#D6D1C7] bg-white px-5 py-2.5 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] cursor-pointer whitespace-nowrap"
            >
              Sprawdź dojazd
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="aspect-[4/3] lg:h-full w-full overflow-hidden border border-[#E6E2D8] bg-[#F3F1EC]">
            <img
              src={resolveMediaUrl(aboutContent.image)}
              alt="Mistrz złotnik przy stole warsztatowym w pracowni Jubiler Wołoska"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* What We Do */}
      <section className="py-14 border-b border-[#E6E2D8]">
        <h2 className="text-3xl font-medium text-[#18181B]">Czym się zajmujemy</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {aboutContent.pillars.map((pillar, idx) => (
            <div key={`${pillar.title}-${idx}`} className="border border-[#E6E2D8] bg-white p-6">
              <h3 className="text-xl font-medium text-[#18181B]">{pillar.title}</h3>
              <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Techniques */}
      <section className="py-14 border-b border-[#E6E2D8]">
        <h2 className="text-3xl font-medium text-[#18181B]">Techniki pracy przy stole złotniczym</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {aboutContent.techniques.map((tech, idx) => (
            <div key={`${tech.index}-${idx}`} className="border-t border-[#E6E2D8] pt-6">
              <h3 className="text-xl font-medium text-[#18181B]">
                <span className="mr-2 font-sans text-xs font-medium text-[#735830] tabular-nums">
                  {tech.index}
                </span>
                {tech.title}
              </h3>
              <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Our History */}
      <section className="pt-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
              {aboutContent.historyKicker}
            </p>
            <h2 className="mt-2 text-3xl font-medium text-[#18181B]">
              {aboutContent.historyTitle}
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-4 text-sm md:text-base text-[#57534E] leading-relaxed">
            {aboutContent.historyParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
