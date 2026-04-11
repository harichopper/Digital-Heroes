import {
  Code2,
  Gem,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const services = [
  {
    title: "UI/UX Design",
    description:
      "Intuitive interfaces built on deep psychological principles and user research.",
    icon: Sparkles,
  },
  {
    title: "Web Development",
    description:
      "Blazing fast, scalable applications using modern stacks and clean architecture.",
    icon: Code2,
  },
  {
    title: "Branding",
    description:
      "Visual identities that tell your story and build lasting emotional connections.",
    icon: Gem,
  },
  {
    title: "Digital Marketing",
    description:
      "Strategic growth campaigns backed by data analysis and creative storytelling.",
    icon: TrendingUp,
  },
] satisfies Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}>;

export function ServicesSection() {
  return (
    <section className="bg-surface-container-low py-24" id="services" aria-labelledby="services-title">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="mb-16 text-center">
          <span className="font-label text-xs font-bold uppercase tracking-[0.05em] text-primary">
            Capabilities
          </span>
          <h2 id="services-title" className="mt-4 font-headline text-3xl font-bold text-on-surface md:text-4xl">
            Precision-Crafted Services
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="northstar-glow group rounded-xl bg-surface-container-lowest p-8 transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon aria-hidden="true" size={22} strokeWidth={2} />
              </div>

              <h3 className="mb-3 font-headline text-xl font-bold text-on-surface">{title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
