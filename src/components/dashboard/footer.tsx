import Link from "next/link"
import { Icons } from "@/components/ui/icons"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
            <Icons.logo className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-widest leading-none">StudioBucket</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">© 2026 Core Engine</span>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          {["Terms", "Privacy", "Docs", "Status"].map((link) => (
            <Link key={link} href="#" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-[0.2em] transition-colors">
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Network Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
