"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, CreditCard, LayoutDashboard, Zap, Globe, Code, 
  Check, Star, ArrowRight, Clock, TrendingUp, Users, Zap as ZapIcon,
  Github, Twitter, Linkedin, Mail
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitted(true);
    setTimeout(() => setEmailSubmitted(false), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* ===== SECTION 1: HERO - Get Email or Get Scroll ===== */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold truncate">SaaS Template</h2>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5">
                🚀 Production-Ready Template
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-center mb-6">
              Ship Your SaaS in{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Days, Not Months
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-muted-foreground text-center mb-8 max-w-3xl mx-auto leading-relaxed">
              Production-ready SaaS boilerplate with authentication, payments, and analytics. 
              <span className="text-primary font-semibold"> Save 3+ months</span> of development time.
            </p>

            {/* Email Capture + CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 max-w-2xl mx-auto px-4">
              <form onSubmit={handleEmailSubmit} className="flex-1 flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="min-h-[48px] px-6 whitespace-nowrap"
                >
                  {emailSubmitted ? "✓ Sent!" : "Get Started"}
                </Button>
              </form>
              <Link href="/auth/signin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="min-h-[48px] w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-background"
                    />
                  ))}
                </div>
                <span>500+ developers building</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: SUCCESS - Kill Buyer's Remorse ===== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join Developers Who've Already Shipped
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See real results from developers using this template
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Alex Chen",
                role: "Indie Hacker",
                quote: "Launched my SaaS in 2 weeks instead of 3 months. This template is a game-changer.",
                avatar: "AC",
                metric: "2 weeks to launch"
              },
              {
                name: "Sarah Johnson",
                role: "Startup Founder",
                quote: "The built-in auth and payments saved us thousands in development costs.",
                avatar: "SJ",
                metric: "$50k saved"
              },
              {
                name: "Mike Rodriguez",
                role: "Full Stack Dev",
                quote: "Best TypeScript boilerplate I've used. Production-ready out of the box.",
                avatar: "MR",
                metric: "100% test coverage"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{testimonial.role}</div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.metric}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PROBLEM-AGITATE - Make Status Quo Painful ===== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              The Problem With Building SaaS From Scratch
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  problem: "3+ Months Development",
                  pain: "Your competitors launch while you're still building auth",
                  icon: Clock
                },
                {
                  problem: "Security Vulnerabilities",
                  pain: "One mistake costs you customer trust and compliance fines",
                  icon: Shield
                },
                {
                  problem: "$50k+ in Dev Costs",
                  pain: "Hiring developers to build what's already solved",
                  icon: TrendingUp
                },
                {
                  problem: "Maintenance Nightmare",
                  pain: "Constant bug fixes and security patches drain your team",
                  icon: Zap
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.problem}</h3>
                        <p className="text-muted-foreground">{item.pain}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: VALUE STACK - Make Saying No Feel Stupid ===== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Production-ready features that would take months to build
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Authentication", items: ["Google OAuth", "Email/Password", "Session Management", "Role-Based Access"] },
                { title: "Payments", items: ["Stripe Integration", "Subscription Management", "Invoice Generation", "Webhook Handling"] },
                { title: "Database", items: ["PostgreSQL Setup", "Kysely Query Builder", "Migrations", "Connection Pooling"] },
                { title: "Developer Experience", items: ["100% TypeScript", "Comprehensive Tests", "CI/CD Ready", "Full Documentation"] },
                { title: "Security", items: ["CSRF Protection", "Input Validation", "Secure Headers", "Best Practices"] },
                { title: "Performance", items: ["Sub-2s Load Times", "Lighthouse 95+", "Optimized Images", "Caching Strategy"] }
              ].map((stack, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{stack.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {stack.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Value Calculation */}
            <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">3+</div>
                  <div className="text-sm text-muted-foreground">Months Saved</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">$50k</div>
                  <div className="text-sm text-muted-foreground">Dev Costs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">50k+</div>
                  <div className="text-sm text-muted-foreground">Lines of Code</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Test Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: SOCIAL PROOF - Let Others Convince Them ===== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Developers Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              Join a growing community of builders
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {[
              { label: "GitHub Stars", value: "5.2k", icon: Github },
              { label: "Active Projects", value: "500+", icon: Code },
              { label: "Developers", value: "10k+", icon: Users },
              { label: "Uptime", value: "99.9%", icon: ZapIcon }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Featured In */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Featured in</p>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              {["Product Hunt", "Hacker News", "GitHub Trending", "Dev.to"].map((source, i) => (
                <Badge key={i} variant="outline">{source}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: TRANSFORMATION - Make Outcome Tangible ===== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              From Idea to Launch in Days
            </h2>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Clone & Setup",
                  description: "Run one command and get a fully configured SaaS template",
                  time: "5 minutes"
                },
                {
                  step: "2",
                  title: "Customize",
                  description: "Update branding, features, and business logic for your product",
                  time: "1-2 days"
                },
                {
                  step: "3",
                  title: "Deploy",
                  description: "Push to production with built-in CI/CD and monitoring",
                  time: "30 minutes"
                },
                {
                  step: "4",
                  title: "Launch",
                  description: "Start acquiring customers and iterating based on feedback",
                  time: "Day 1"
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground mb-2">{item.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {item.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="mt-12 p-8 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
              <h3 className="text-2xl font-bold mb-2">Your SaaS is Live</h3>
              <p className="text-muted-foreground mb-4">
                With paying customers, recurring revenue, and a scalable foundation
              </p>
              <div className="text-3xl font-bold text-green-600">
                While competitors are still in development
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: SECONDARY CTA - Catch the Scrollers ===== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Ship Your SaaS?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of developers who've already launched successful products
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="min-h-[56px] px-8 text-lg font-semibold w-full sm:w-auto">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/subscription">
                <Button size="lg" variant="outline" className="min-h-[56px] px-8 text-lg w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Risk Reversal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>30-day money back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: FOOTER - Professional Legitimacy ===== */}
      <footer className="border-t bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">SaaS Template</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Production-ready SaaS boilerplate for developers
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">GitHub</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Careers</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Security</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Status</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SaaS Template. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
