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
      <div className="w-1/2 bg-gray-50 p-8 border-r overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6">{description}</p>
        <h2 className="text-lg font-semibold mb-2">Examples</h2>
        <ul className="space-y-4">
          {examples.map((ex, idx) => (
            <li key={idx} className="bg-white p-4 rounded shadow">
              <div><strong>Input:</strong> {ex.input}</div>
              <div><strong>Output:</strong> {ex.output}</div>
              <div><strong>Explanation:</strong> {ex.explanation}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }