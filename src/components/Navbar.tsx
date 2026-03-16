import { Zap, Menu, X, LogOut, User, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const goToOptimizer = () => { navigate("/optimizer"); setMobileOpen(false); };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
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
    { label: "Home", action: () => { navigate("/"); setMobileOpen(false); } },
    { label: "Features", action: () => scrollTo("features") },
    { label: "How It Works", action: () => scrollTo("how-it-works") },
    { label: "Pricing", action: () => scrollTo("pricing") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-foreground">AI Resume Optimizer</span>
        </button>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button key={link.label} onClick={link.action}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side — logged in or CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-card transition-all hover:bg-accent hover:border-primary/30"
              >
                {/* Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                {/* Plan badge */}
                {user.plan === "pro" ? (
                  <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "var(--gradient-primary)" }}>
                    <Crown className="h-2.5 w-2.5" /> PRO
                  </span>
                ) : (
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    FREE
                  </span>
                )}
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card shadow-elevated overflow-hidden animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => { navigate("/optimizer"); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" /> My Optimizer
                    </button>
                    {user.plan === "free" && (
                      <button onClick={() => { navigate("/signup"); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        style={{ color: "hsl(221 83% 53%)" }}>
                        <Crown className="h-4 w-4" /> Upgrade to Pro
                      </button>
                    )}
                    <div className="my-1 border-t border-border" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                Sign In
              </button>
              <button onClick={goToOptimizer}
                className="btn-gradient rounded-lg px-5 py-2 text-[13px] font-semibold text-primary-foreground">
                Upload Resume
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-6 py-4 md:hidden animate-fade-in-up">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button key={link.label} onClick={link.action}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <div className="my-1 border-t border-border" />
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.plan} plan</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/8">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                  Sign In
                </button>
                <button onClick={goToOptimizer}
                  className="btn-gradient mt-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  Upload Resume
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
