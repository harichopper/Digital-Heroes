import Link from "next/link";

export function TopNav() {
  return (
    <nav className="fixed top-6 left-1/2 z-50 flex w-[90%] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full bg-white/70 px-6 py-3 shadow-[0_20px_40px_rgba(45,51,55,0.06)] glass-nav">
      <div className="font-headline text-2xl font-bold tracking-tighter text-slate-900">
        Northstar Studio
      </div>

      <div className="hidden items-center gap-8 md:flex">
        <Link
          className="font-headline text-sm font-bold tracking-tight text-orange-600 transition-colors duration-300 hover:text-orange-500"
          href="/#portfolio"
        >
          Work
        </Link>
        <Link
          className="font-headline text-sm font-bold tracking-tight text-slate-600 transition-colors duration-300 hover:text-orange-500"
          href="/#services"
        >
          Services
        </Link>
        <Link
          className="font-headline text-sm font-bold tracking-tight text-slate-600 transition-colors duration-300 hover:text-orange-500"
          href="/#about"
        >
          About
        </Link>
        <Link
          className="font-headline text-sm font-bold tracking-tight text-slate-600 transition-colors duration-300 hover:text-orange-500"
          href="/#contact"
        >
          Contact
        </Link>
      </div>

      <Link
        href="/start-project"
        className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-on-primary transition-transform duration-200 hover:scale-105"
      >
        Start a Project
      </Link>
    </nav>
  );
}
