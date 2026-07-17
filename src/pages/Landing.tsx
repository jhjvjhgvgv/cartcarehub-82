import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, QrCode, Wrench, Brain, ShoppingCart, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const waitlistSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  role: z.enum(["store", "provider", "investor", "other"]),
});
type WaitlistData = z.infer<typeof waitlistSchema>;

const investorSchema = z.object({
  name: z.string().trim().min(2, "Required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  firm: z.string().trim().max(160).optional(),
  message: z.string().trim().max(1000).optional(),
});
type InvestorData = z.infer<typeof investorSchema>;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Landing() {
  const [investorOpen, setInvestorOpen] = useState(false);

  const waitlistForm = useForm<WaitlistData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "", role: "store" },
  });

  const investorForm = useForm<InvestorData>({
    resolver: zodResolver(investorSchema),
    defaultValues: { name: "", email: "", firm: "", message: "" },
  });

  const submitWaitlist = async (data: WaitlistData) => {
    const { error } = await supabase.from("waitlist_signups").insert({
      email: data.email,
      role: data.role,
      source: "landing",
    });
    if (error) {
      toast.error("Something went wrong. Try again in a moment.");
      return;
    }
    toast.success("You're on the list. We'll be in touch.");
    waitlistForm.reset();
  };

  const submitInvestor = async (data: InvestorData) => {
    const { error } = await supabase.from("investor_leads").insert({
      name: data.name,
      email: data.email,
      firm: data.firm || null,
      message: data.message || null,
    });
    if (error) {
      toast.error("Something went wrong. Try again in a moment.");
      return;
    }
    toast.success("Request received. Deck incoming.");
    investorForm.reset();
    setInvestorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-neutral-100 font-body antialiased selection:bg-ember selection:text-black">
      <Helmet>
        <title>Cart Repair Pros — The OS for shopping cart fleets</title>
        <meta name="description" content="In development: the operating system for shopping cart fleets. QR inspections, work orders, and predictive maintenance for retail." />
        <link rel="canonical" href="https://cartrepairpros.com/" />
        <meta property="og:title" content="Cart Repair Pros — Coming 2026" />
        <meta property="og:description" content="The operating system for shopping cart fleets. Join the waitlist or request the investor deck." />
        <meta property="og:url" content="https://cartrepairpros.com/" />
      </Helmet>

      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#111111]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="inline-block h-2 w-2 rounded-full bg-ember" />
            CART REPAIR PROS
          </a>
          <nav className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#traction" className="transition hover:text-white">Traction</a>
            <a href="#investors" className="transition hover:text-white">Investors</a>
            <a href="#waitlist" className="transition hover:text-white">Waitlist</a>
          </nav>
          <Link
            to="/auth"
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-neutral-200 transition hover:border-ember hover:text-ember"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
          <motion.p
            {...fadeUp}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-ember/40 bg-ember/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-ember"
          >
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            In development · Shipping 2026
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-display text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-tight"
          >
            The operating system<br />
            for <span className="text-ember">shopping cart</span><br />
            fleets.
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-8 max-w-2xl text-lg text-neutral-400 md:text-xl"
          >
            Every retailer loses money to broken carts. We turn a$4B blind spot into
            a measured, mechanical process — QR inspections, auto-routed work orders,
            and predictive maintenance built for grocery, big box, and hardware fleets.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.25 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="#waitlist"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-ember px-6 py-4 font-medium text-black transition hover:bg-ember-bright"
            >
              Join the waitlist
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <Dialog open={investorOpen} onOpenChange={setInvestorOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-6 py-4 font-medium text-white transition hover:border-white hover:bg-white/5">
                  Request investor deck
                </button>
              </DialogTrigger>
              <InvestorDialog form={investorForm} onSubmit={submitInvestor} />
            </Dialog>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.35 }}
            className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 text-xs uppercase tracking-widest text-neutral-500"
          >
            <span>Pilot partners onboarding</span>
            <span className="hidden h-px w-8 bg-neutral-700 sm:block" />
            <span>Built on Supabase + AI</span>
            <span className="hidden h-px w-8 bg-neutral-700 sm:block" />
            <span>Backed by early angel checks</span>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative z-10 border-b border-white/5 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.h2 {...fadeUp} className="font-display text-sm uppercase tracking-[0.3em] text-neutral-500">
            The problem
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl"
          >
            Cart fleets are the most-touched, least-tracked asset in retail.
          </motion.p>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShoppingCart, stat: "20-30%", label: "of carts in the average fleet are broken, wobbly, or missing at any given time." },
              { icon: DollarSign, stat: "$4B+", label: "lost annually to cart replacement, theft, and abandoned carts in North America alone." },
              { icon: Clock, stat: "6 weeks", label: "average lag between an issue being noticed and a fix being logged. Most never are." },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 + i * 0.08 }}
                className="group rounded-lg border border-white/10 bg-[#1a1a1a] p-8 transition hover:border-ember/50"
              >
                <item.icon className="h-6 w-6 text-ember" strokeWidth={1.5} />
                <p className="mt-6 font-display text-5xl font-bold tracking-tight">{item.stat}</p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-400">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="product" className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.h2 {...fadeUp} className="font-display text-sm uppercase tracking-[0.3em] text-neutral-500">
            The system
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl"
          >
            One loop. Scan → report → repair → resolved.
          </motion.p>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "QR inspections",
                body: "Every cart carries a physical QR tag. Any staffer — no login gymnastics — scans, runs a 30-second checklist, flags issues. Data captured in the field, not on a clipboard that disappears.",
              },
              {
                icon: Wrench,
                title: "Auto-routed work orders",
                body: "High-severity issues spawn a work order the moment they're logged, auto-assigned to the store's connected maintenance provider. Providers see a queue. Store admins see status. Nobody chases email.",
              },
              {
                icon: Brain,
                title: "Predictive maintenance",
                body: "Gemini-powered scoring flags carts trending toward failure before they break. Route optimization for provider visits. Cost-per-cart analytics per store, per region, per SKU.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 + i * 0.08 }}
                className="bg-[#111111] p-8 transition hover:bg-[#1a1a1a]"
              >
                <item.icon className="h-7 w-7 text-ember" strokeWidth={1.5} />
                <h3 className="mt-6 font-display text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACTION / WHY NOW */}
      <section id="traction" className="relative z-10 border-b border-white/5 bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2">
          <div>
            <motion.h2 {...fadeUp} className="font-display text-sm uppercase tracking-[0.3em] text-neutral-500">
              Why now
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl"
            >
              Retail ops is finally getting the software treatment.
            </motion.p>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-6 text-neutral-400"
            >
              Labor cost is up 22% since 2020. Third-party maintenance networks are
              fragmented. Every major grocer is auditing their physical asset
              footprint. We're the first system that connects the store manager, the
              contracted repair tech, and corporate analytics on a single record for
              every cart in the fleet.
            </motion.p>
          </div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="space-y-4">
            {[
              { k: "$4.2B", v: "North American cart & fleet maintenance TAM" },
              { k: "300K+", v: "Retail locations in target ICP (US + Canada)" },
              { k: "SaaS + take-rate", v: "Two revenue lines: per-store subscription and provider marketplace fee" },
              { k: "Live product", v: "Multi-tenant app in beta with pilot partners" },
            ].map((row, i) => (
              <div key={i} className="flex items-baseline gap-6 border-b border-white/10 pb-4">
                <TrendingUp className="h-4 w-4 shrink-0 text-ember" />
                <div className="font-display text-2xl font-bold text-white">{row.k}</div>
                <div className="text-sm text-neutral-400">{row.v}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* INVESTOR CTA */}
      <section id="investors" className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-ember/30 bg-gradient-to-br from-ember/10 via-transparent to-transparent p-10 md:p-16">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-ember">For investors</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
              Category-defining verticals<br />start with the unglamorous ones.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-neutral-400">
              We're raising a seed round to expand pilots, harden the platform, and
              build the provider marketplace. If you back vertical B2B and physical
              ops, we'd love to send the deck.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Dialog open={investorOpen} onOpenChange={setInvestorOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-md bg-ember px-6 py-4 font-medium text-black transition hover:bg-ember-bright">
                    Request the deck
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <InvestorDialog form={investorForm} onSubmit={submitInvestor} />
              </Dialog>
              <a
                href="mailto:invest@cartrepairpros.com"
                className="inline-flex items-center rounded-md border border-white/20 px-6 py-4 font-medium text-white transition hover:border-white hover:bg-white/5"
              >
                invest@cartrepairpros.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="relative z-10 border-b border-white/5 bg-[#0d0d0d]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-neutral-500">Waitlist</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
            Be first in line when we open access.
          </h2>
          <p className="mt-6 text-neutral-400">
            Priority onboarding for stores and providers in early access markets.
          </p>

          <form
            onSubmit={waitlistForm.handleSubmit(submitWaitlist)}
            className="mt-10 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
          >
            <Input
              type="email"
              placeholder="you@company.com"
              {...waitlistForm.register("email")}
              className="h-14 border-white/15 bg-[#1a1a1a] text-white placeholder:text-neutral-500 focus-visible:ring-ember"
            />
            <Select
              defaultValue="store"
              onValueChange={(v) => waitlistForm.setValue("role", v as WaitlistData["role"])}
            >
              <SelectTrigger className="h-14 border-white/15 bg-[#1a1a1a] text-white focus:ring-ember">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store">I run stores</SelectItem>
                <SelectItem value="provider">I fix carts</SelectItem>
                <SelectItem value="investor">I'm an investor</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={waitlistForm.formState.isSubmitting}
              className="h-14 bg-ember px-8 font-medium text-black hover:bg-ember-bright"
            >
              Join
            </Button>
            {waitlistForm.formState.errors.email && (
              <p className="text-left text-sm text-red-400 sm:col-span-3">
                {waitlistForm.formState.errors.email.message}
              </p>
            )}
          </form>
          <p className="mt-4 text-xs text-neutral-500">No spam. One update when we're ready for you.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
              <span className="inline-block h-2 w-2 rounded-full bg-ember" />
              CART REPAIR PROS
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              © {new Date().getFullYear()} Cart Repair Pros. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
            <a href="mailto:hello@cartrepairpros.com" className="hover:text-white">hello@cartrepairpros.com</a>
            <a href="mailto:invest@cartrepairpros.com" className="hover:text-white">Investors</a>
            <Link to="/auth" className="hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InvestorDialog({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<InvestorData>>;
  onSubmit: (data: InvestorData) => Promise<void>;
}) {
  return (
    <DialogContent className="border-white/10 bg-[#161616] text-neutral-100 sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Request the investor deck</DialogTitle>
        <DialogDescription className="text-neutral-400">
          Tell us who you are. We'll send the deck within 24 hours.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="i-name">Name</Label>
          <Input id="i-name" {...form.register("name")} className="mt-1 border-white/15 bg-[#1a1a1a]" />
          {form.formState.errors.name && <p className="mt-1 text-xs text-red-400">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="i-email">Email</Label>
          <Input id="i-email" type="email" {...form.register("email")} className="mt-1 border-white/15 bg-[#1a1a1a]" />
          {form.formState.errors.email && <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="i-firm">Firm (optional)</Label>
          <Input id="i-firm" {...form.register("firm")} className="mt-1 border-white/15 bg-[#1a1a1a]" />
        </div>
        <div>
          <Label htmlFor="i-message">Anything we should know?</Label>
          <Textarea id="i-message" rows={3} {...form.register("message")} className="mt-1 border-white/15 bg-[#1a1a1a]" />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-ember font-medium text-black hover:bg-ember-bright">
          Send request
        </Button>
      </form>
    </DialogContent>
  );
}
