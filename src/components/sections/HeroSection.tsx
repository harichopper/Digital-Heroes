export function HeroSection() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-20 pt-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full -translate-x-1/2">
        <div className="absolute left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-primary-container/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-tertiary-container/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-label text-[0.75rem] font-bold uppercase tracking-[0.05em] text-primary">
          Northstar Studio
        </span>

        <h1
          id="hero-title"
          className="font-headline text-5xl font-bold leading-[1.1] tracking-tight text-on-surface md:text-7xl lg:text-[3.5rem]"
        >
          Redefining <span className="text-primary">Digital Horizons</span>
        </h1>

        <p className="mx-auto mb-12 mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
          We bridge the gap between imagination and execution, crafting high-performance
          digital experiences that command attention and drive conversion.
        </p>

        <div className="mb-20 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/start-project"
            className="primary-gradient northstar-glow rounded-xl px-10 py-4 text-lg font-bold text-on-primary transition-transform duration-300 hover:scale-[1.02]"
          >
            Get Started
          </a>
          <a
            href="#portfolio"
            className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest/40 px-10 py-4 text-lg font-bold text-on-surface backdrop-blur-md transition-colors duration-300 hover:bg-surface-container-lowest/60"
          >
            View Work
          </a>
        </div>

        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <li className="northstar-glow rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-6">
            <span className="mb-1 block font-headline text-3xl font-extrabold text-primary">150+</span>
            <span className="text-sm font-medium text-on-surface-variant">Projects Shipped</span>
          </li>
          <li className="northstar-glow rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-6">
            <span className="mb-1 block font-headline text-3xl font-extrabold text-primary">99%</span>
            <span className="text-sm font-medium text-on-surface-variant">Client Satisfaction</span>
          </li>
          <li className="northstar-glow rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-6">
            <span className="mb-1 block font-headline text-3xl font-extrabold text-primary">48hr</span>
            <span className="text-sm font-medium text-on-surface-variant">Average Kickoff</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
