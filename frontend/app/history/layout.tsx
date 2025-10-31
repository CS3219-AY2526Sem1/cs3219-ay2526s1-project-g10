import type { ReactNode } from "react"
import { Protected } from "../../components/auth/Protected"

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return <Protected>{children}</Protected>
}
