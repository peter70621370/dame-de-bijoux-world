import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s · Back-office Dame de Bijoux" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
