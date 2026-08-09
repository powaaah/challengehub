"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUser } from "@/lib/auth";
import { LoginModal } from "./login-modal";
import styles from "./site-shell.module.css";

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginNext, setLoginNext] = useState("/");

  function openLogin() {
    setLoginNext(`${window.location.pathname}${window.location.search}`);
    setMenuOpen(false);
    setIsLoginOpen(true);
  }

  return (
    <>
      <a className={styles.skipLink} href="#main-content">Zum Hauptinhalt springen</a>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Navigation schließen" : "Navigation öffnen"}
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="main-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Hauptnavigation">
          <Link href="/challenges" aria-current={pathname.startsWith("/challenges") ? "page" : undefined}>Challenges</Link>
          <Link href="/#so-funktionierts">So funktioniert’s</Link>
          <Link href="/wissen" aria-current={pathname.startsWith("/wissen") ? "page" : undefined}>Wissen</Link>
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <button className={styles.primaryButton} type="button" onClick={openLogin}>
              Login
            </button>
          )}
        </nav>
      </header>
      {isLoginOpen && <LoginModal next={loginNext} onClose={() => setIsLoginOpen(false)} />}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Link href="/" aria-label="ChallengeHub Startseite">
            <Image src="/logo.png" width={214} height={70} alt="" />
          </Link>
          <p>Gemeinsam Challenges starten, einchecken und wirklich dranbleiben.</p>
        </div>
        <FooterNavigation label="Produkt" links={[
          { href: "/challenges", label: "Challenges" },
          { href: "/meine-challenges", label: "Meine Challenges" },
          { href: "/challenge-mate", label: "Challenge Mate" }
        ]} />
        <FooterNavigation label="Unternehmen" links={[
          { href: "/wissen", label: "Wissen" },
          { href: "/karriere", label: "Karriere" }
        ]}>
          <a href="https://www.amazon.de/s?rh=n%3A77028031%2Cp_4%3ACHub+by+ChallengeHub&ref=bl_sl_s_ap_web_77028031">
            Merch
          </a>
        </FooterNavigation>
        <FooterNavigation label="Rechtliches" links={[
          { href: "/sicherheit", label: "Sicherheit" },
          { href: "/datenschutz", label: "Datenschutz" },
          { href: "/impressum", label: "Impressum" }
        ]} />
      </div>
    </footer>
  );
}

type FooterLink = { href: string; label: string };

function FooterNavigation({
  label,
  links,
  children
}: {
  label: string;
  links: FooterLink[];
  children?: React.ReactNode;
}) {
  return (
    <nav className={styles.footerNavigation} aria-label={label}>
      <h2>{label}</h2>
      {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      {children}
    </nav>
  );
}

function ProfileMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initials = getUserInitials(user.name || user.email);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={styles.profileMenu}>
      <button
        ref={triggerRef}
        className={styles.profileButton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{initials}</span>
        <span className={styles.visuallyHidden}>Profilmenü öffnen</span>
      </button>
      {open && (
        <div className={styles.profileDropdown} role="menu">
          <div className={styles.profileSummary}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link href="/profil" role="menuitem">
            Profil bearbeiten
          </Link>
          <Link href="/meine-challenges" role="menuitem">
            Meine Challenges
          </Link>
          <Link href="/challenge-mate" role="menuitem">
            Challenge Mate finden
          </Link>
          <form action={logoutAction}>
            <button type="submit" role="menuitem">
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function getUserInitials(value: string) {
  const parts = value
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
