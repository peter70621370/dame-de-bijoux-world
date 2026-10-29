import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace admin", template: "%s · Espace admin Dame de Bijoux" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
