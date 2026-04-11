import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Velvet Fintech",
    category: "UI/UX Design",
    image: "/portfolio/aurora-commerce.svg",
    href: "https://dribbble.com/tags/fintech-app",
  },
  {
    title: "Lumina Smart Home",
    category: "Product Development",
    image: "/portfolio/pulse-finance.svg",
    href: "https://dribbble.com/tags/smart-home",
  },
  {
    title: "Nova Architecture",
    category: "Branding",
    image: "/portfolio/harbor-hospitality.svg",
    href: "https://dribbble.com/tags/brand-identity",
  },
  {
    title: "Apex Lifestyle",
    category: "Digital Marketing",
    image: "/portfolio/orbit-fitness.svg",
    href: "https://dribbble.com/tags/marketing-site",
  },
];

export function PortfolioSection() {
  return (
    <section className="overflow-hidden bg-surface py-24" id="portfolio" aria-labelledby="portfolio-title">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.05em] text-primary">
              Our Work
            </span>
            <h2 id="portfolio-title" className="mt-4 font-headline text-3xl font-bold text-on-surface md:text-4xl">
              Selected Masterpieces
            </h2>
          </div>

          <a
            className="flex items-center gap-2 font-bold text-primary hover:underline"
            href="https://dribbble.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            View full archive <ArrowRight aria-hidden="true" size={18} />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-2">
          {projects.map((project, index) => (
            <article key={project.title} className={`group ${index % 2 === 1 ? "md:mt-24" : ""}`}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mb-6 block aspect-[4/3] overflow-hidden rounded-2xl shadow-xl"
              >
                <Image
                  src={project.image}
                  alt={`${project.title} thumbnail`}
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>

              <div className="flex items-start justify-between">
                <div>
                  <span className="font-label text-xs font-bold uppercase text-primary">{project.category}</span>
                  <h4 className="mt-2 font-headline text-2xl font-bold text-on-surface">{project.title}</h4>
                </div>

                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all group-hover:bg-on-surface group-hover:text-white"
                  aria-label={`Open ${project.title} case study`}
                >
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
