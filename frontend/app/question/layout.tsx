import type { ReactNode } from "react"
import { Protected } from "../../components/auth/Protected"

export default function QuestionLayout({ children }: { children: ReactNode }) {
  return <Protected>{children}</Protected>
}
