// frontend/components/ProblemDescriptionPanel.tsx
type Example = {
    input: string
    output: string
    explanation: string
  }
  
  type Props = {
    title: string
    description: string
    examples: Example[]
  }
  
  export default function ProblemDescriptionPanel({ title, description, examples }: Props) {
    return (
      <div className="w-1/2 bg-slate-800 p-8 border-r overflow-auto text-white">
        <h1 className="text-3xl font-extrabold mb-4 drop-shadow">{title}</h1>
        <p className="mb-6 text-lg">{description}</p>
        <h2 className="text-xl font-semibold mb-2 text-blue-300">Examples</h2>
        <ul className="space-y-4">
          {examples.map((ex, idx) => (
            <li key={idx} className="bg-slate-700 p-4 rounded shadow text-white">
              <div><strong className="text-blue-200">Input:</strong> {ex.input}</div>
              <div><strong className="text-blue-200">Output:</strong> {ex.output}</div>
              <div><strong className="text-blue-200">Explanation:</strong> {ex.explanation}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }