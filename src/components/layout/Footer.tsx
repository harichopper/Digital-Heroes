export function Footer() {
  return (
    <footer className="mt-20 w-full rounded-t-[2.5rem] bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-16 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="font-headline text-lg font-bold text-slate-900">Northstar Studio</div>
          <p className="max-w-xs text-center text-sm leading-relaxed text-slate-500 md:text-left">
            © 2026 Northstar Studio. Crafting digital excellence.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <a
            className="text-sm leading-relaxed text-slate-500 opacity-80 transition-colors hover:text-slate-900 hover:opacity-100"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-sm leading-relaxed text-slate-500 opacity-80 transition-colors hover:text-slate-900 hover:opacity-100"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-sm leading-relaxed text-slate-500 opacity-80 transition-colors hover:text-slate-900 hover:opacity-100"
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="text-sm leading-relaxed text-slate-500 opacity-80 transition-colors hover:text-slate-900 hover:opacity-100"
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
