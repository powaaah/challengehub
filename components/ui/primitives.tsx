import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode
} from "react";
import {
  getStatusPanelSemantics,
  type StatusTone
} from "./status-panel-semantics";
import styles from "./primitives.module.css";

type Variant = "primary" | "secondary" | "quiet";

export function ActionLink({
  variant = "primary",
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return <Link className={classNames(styles.action, styles[variant], className)} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={classNames(styles.action, styles[variant], className)}
      type={type}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(styles.card, className)} {...props} />;
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "error" | "success";
}) {
  return <span className={classNames(styles.badge, styles[`badge_${tone}`], className)} {...props} />;
}

export function StatusPanel({
  tone,
  title,
  children,
  actions,
  label,
  titleAs: Title = "h1",
  className
}: {
  tone: StatusTone;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  label?: string;
  titleAs?: "h1" | "h2";
  className?: string;
}) {
  const semantics = getStatusPanelSemantics(tone);

  return (
    <Card
      className={classNames(styles.statusPanel, styles[`status_${tone}`], className)}
      role={semantics.role}
      aria-live={semantics.ariaLive}
      aria-busy={tone === "loading" ? true : undefined}
    >
      {tone === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <Badge tone={tone === "error" || tone === "success" ? tone : "brand"}>
        {label ?? semantics.label}
      </Badge>
      <Title>{title}</Title>
      <div className={styles.statusCopy}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Card>
  );
}

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}
