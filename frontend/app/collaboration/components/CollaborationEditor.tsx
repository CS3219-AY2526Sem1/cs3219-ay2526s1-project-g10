import { useEffect, useRef } from "react"
import MonacoEditor from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import * as Y from "yjs"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from "y-websocket"

function CollaborationEditor({ roomId }: { roomId: string | null }) {
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

    // Listen for awareness changes
    providerRef.current!.awareness.on("change", () => {
      const states = Array.from(providerRef.current!.awareness.getStates().entries())
      const decorations: monaco.editor.IModelDeltaDecoration[] = []

      states.forEach(([clientId, state]) => {
        if (clientId === providerRef.current!.awareness.clientID) return // skip local user
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
    <div className="w-1/2 h-full">
      <MonacoEditor
        height="100%"
        width="100%"
        language="javascript"
        theme="vs-dark"
        defaultValue="// Write your code here"
        onMount={handleEditorDidMount}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
        }}
      />
      <style>{`
        .remote-cursor {
          border-left: 2px solid #ff0000;
        }
      `}</style>
    </div>
  )
}

export default CollaborationEditor