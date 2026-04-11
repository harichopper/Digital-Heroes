export function AboutSection() {
  return (
    <section id="about" className="bg-surface py-14">
      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <span className="font-label text-xs font-bold uppercase tracking-[0.05em] text-primary">
          About
        </span>
        <h2 className="mt-4 font-headline text-3xl font-bold text-on-surface md:text-4xl">
          Design thinking meets engineering precision.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
          We partner with brands to transform ideas into elegant digital products that perform
          under real business pressure. Every screen, flow, and campaign is crafted to move
          users from interest to action.
        </p>
      </div>
    </section>
  );
}
