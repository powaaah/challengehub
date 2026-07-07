"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUser } from "@/lib/auth";
import styles from "./site-shell.module.css";

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
        <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
      </Link>
      <button
        className={styles.menuButton}
        type="button"
        aria-label="Navigation oeffnen"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Hauptnavigation">
        <Link href="/challenges">Challenges</Link>
        <Link href="/challenges?sort=participants">Ranking</Link>
        {user ? <ProfileMenu user={user} /> : <Link className={styles.primaryButton} href="/auth">Login</Link>}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/meine-challenges">Meine Challenges</Link>
      <Link href="/wissen">Wissen</Link>
      <Link href="/sicherheit">Sicherheit</Link>
      <Link href="/datenschutz">Datenschutz</Link>
      <Link href="/impressum">Impressum</Link>
      <Link href="/karriere">Karriere</Link>
      <a href="https://www.amazon.de/s?rh=n%3A77028031%2Cp_4%3ACHub+by+ChallengeHub&ref=bl_sl_s_ap_web_77028031">
        Merch
      </a>
    </footer>
  );
}

function ProfileMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const initials = getUserInitials(user.name || user.email);

  return (
    <div className={styles.profileMenu}>
      <button
        className={styles.profileButton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{initials}</span>
        <span className={styles.visuallyHidden}>Profilmenue oeffnen</span>
      </button>
      {open && (
        <div className={styles.profileDropdown} role="menu">
          <div className={styles.profileSummary}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link href="/auth" role="menuitem">
            Konto
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
