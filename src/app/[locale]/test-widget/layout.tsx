import { Providers } from "@/components/providers"

export default function TestWidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
