import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#how', label: 'كيف تعمل' },
  { href: '#why', label: 'لماذا Crido' },
  { href: '#plans', label: 'الخطط' },
  { href: '#merchants', label: 'للتجار' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-line bg-cream/90 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/crido-logo.png" alt="" className="h-9 w-9 rounded-xl" />
          <span
            className={`text-xl font-bold transition-colors ${
              scrolled ? 'text-teal' : 'text-white'
            }`}
          >
            Crido
          </span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-ink-soft hover:text-teal' : 'text-white/75 hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#download"
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            scrolled
              ? 'bg-teal text-white hover:bg-teal-deep'
              : 'bg-white text-teal hover:bg-cream'
          }`}
        >
          حمّل التطبيق
        </a>
      </nav>
    </header>
  )
}
