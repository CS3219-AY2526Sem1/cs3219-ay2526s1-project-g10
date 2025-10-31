import type { ReactNode } from "react"
import { AdminOnly } from "../../components/auth/Protected"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>
}
