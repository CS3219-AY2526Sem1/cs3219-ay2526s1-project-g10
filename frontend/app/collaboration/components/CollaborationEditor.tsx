"use client"

import * as monaco from "monaco-editor"
import { useEffect, useRef, useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import * as Y from "yjs"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from "y-websocket"
import axios from "axios"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { CODE_VERSIONS } from "../../../lib/constants"

import { ChevronDownIcon, Play } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { version } from "os"


const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
]

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
})


export default function CollaborationEditor({ roomId }: { roomId: string | null }) {
  const [language, setLanguage] = useState("python")
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const editorRef = useRef<any>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const bindingRef = useRef<MonacoBinding | null>(null)
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    if (!roomId) return
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc
    const provider = new WebsocketProvider("ws://localhost:1234", roomId, ydoc)
    providerRef.current = provider
    return () => {
      provider.disconnect()
      ydoc.destroy()
    }
  }, [roomId])

  function handleEditorDidMount(editor: any, monaco: any) {
    if (!ydocRef.current || !roomId) return
    const yText = ydocRef.current.getText("monaco")
    const binding = new MonacoBinding(yText, editor.getModel(), new Set([editor]), providerRef.current!.awareness)
    bindingRef.current = binding
    editorRef.current = editor
    providerRef.current!.awareness.on("change", () => {
      const states = Array.from(providerRef.current!.awareness.getStates().entries())
      const decorations: monaco.editor.IModelDeltaDecoration[] = []
      states.forEach(([clientId, state]) => {
        if (clientId === providerRef.current!.awareness.clientID) return
        if (state.selection) {
          const { start, end } = state.selection
          decorations.push({
            range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
            options: {
              className: "remote-cursor",
              isWholeLine: false,
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            }
          })
        }
      })
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations)
    })
  }

  const handleCodeRun = async () => {
    if (!editorRef.current) return
    const code = editorRef.current.getValue()
  
    try {
      console.log("Running code in language:", language)
      setCodeRunning(true);
      
      const response = await API.post("/execute", {
        language: language,
        version : CODE_VERSIONS[language],
        files: [
          {
            name: `Main.${language === "python" ? "py" : language === "java" ? "java" : "cpp"}`,
            content: code
          }
        ],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
      })
      
      const result = response.data.run.output
      setCodeRunning(false);
      setCodeOutput(result);
    } catch (error) {
      alert("Error running code")
      console.error("Error:", error)
    }
  }

  return (
    <div className="w-1/2 flex items-center justify-center bg-slate-800 h-full">
      <div className="bg-blue-200 rounded-lg shadow-lg p-6 w-[90%] h-[95%] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Live Collaboration Editor</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border border-slate-400 rounded px-2 py-1 text-slate-800 flex items-center gap-2 bg-white">
              {LANGUAGES.find(l => l.value === language)?.label}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {LANGUAGES.map(lang => (
              <DropdownMenuItem
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={language === lang.value ? "bg-blue-100" : ""}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-end bg-gray-900 px-4 py-2 rounded-t-xl">
            <Button
              onClick={() => handleCodeRun()}
              variant="ghost"
              size="sm"
              className="bg-gray-800 text-gray-100 hover:bg-gray-700"
            >
              Run
              <Play className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {/* Code editor fills the rest */}
          <div className="flex-1 w-full h-full">
            <MonacoEditor
              height="100%"
              width="100%"
              language={language}
              theme="vs-dark"
              defaultValue="// Write your code here"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                scrollbar: { vertical: "visible", horizontal: "visible" },
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}