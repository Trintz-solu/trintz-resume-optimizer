import { Zap, Menu, X, LogOut, Crown, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Features", action: () => scrollTo("features") },
    { label: "How It Works", action: () => scrollTo("how-it-works") },
    { label: "Pricing", action: () => scrollTo("pricing") },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-xl border-border shadow-card"
          : "bg-transparent border-transparent backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <button
          onClick={() => { navigate("/"); setMobileOpen(false); }}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all group-hover:scale-110"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            AI Resume<span className="gradient-text"> Optimizer</span>
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="relative rounded-lg px-4 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:text-foreground group"
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all group-hover:w-4" />
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="theme-toggle"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun className="h-4 w-4 text-amber-400" />
              : <Moon className="h-4 w-4 text-muted-foreground" />
            }
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-accent hover:border-primary/30 hover:shadow-card"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                {user.plan === "pro" ? (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Crown className="h-2.5 w-2.5" /> PRO
                  </span>
                ) : (
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    FREE
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 card-glass rounded-xl overflow-hidden animate-fade-in-up shadow-elevated">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { navigate("/dashboard"); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                    </button>
                    <button
                      onClick={() => { navigate("/optimizer"); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <Zap className="h-4 w-4 text-muted-foreground" /> New Resume
                    </button>
                    {user.plan === "free" && (
                      <button
                        onClick={() => { navigate("/#pricing"); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold gradient-text transition-colors hover:bg-accent"
                      >
                        <Crown className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} /> Upgrade to Pro
                      </button>
                    )}
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/optimizer")}
                className="btn-gradient rounded-xl px-5 py-2 text-[13px] font-semibold text-white"
              >
                Get Started Free
              </button>
            </>
          )}
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggle} className="theme-toggle" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button
            className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card/95 backdrop-blur-xl px-6 py-4 md:hidden animate-fade-in-up">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <div className="my-2 border-t border-border" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.plan} plan</p>
                  </div>
                </div>
                <button
                  onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/8"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { navigate("/optimizer"); setMobileOpen(false); }}
                  className="btn-gradient mt-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
