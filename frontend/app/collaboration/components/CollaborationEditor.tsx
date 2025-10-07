"use client"

import * as monaco from "monaco-editor"
import { useEffect, useRef, useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import * as Y from "yjs"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from "y-websocket"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

import { ChevronDownIcon } from "lucide-react"


const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
]

export default function CollaborationEditor({ roomId }: { roomId: string | null }) {
  const [language, setLanguage] = useState("python")
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
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[95%] h-[90%]">
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