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

import { ChevronDownIcon, Play, Loader2, MessageCircle, X, Send, LogOut, Sparkles } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {updateAttempt} from "../../../services/history/realHistory";
import { sendAIChat } from "../../../services/chatbot/aiService"

type Participant = {
  name: string
  isCurrentUser?: boolean
}

interface CollaborationEditorProps {
  roomId: string | null
  attemptId?: string
  participants: Participant[]
  onRequestLeave: () => void
  leaving: boolean
  onCodeChange?: (code: string) => void
  questionDescription?: string
}

type AIMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  ts: number
}

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
]

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
})

const DEFAULT_COLLAB_WS = "ws://localhost:3004/collab"


export default function CollaborationEditor({ roomId, participants, onRequestLeave, leaving, attemptId, onCodeChange, questionDescription }: CollaborationEditorProps) {
  const [language, setLanguage] = useState<string>("python")
  const [codeRunning, setCodeRunning] = useState<boolean>(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [sharedOutput, setSharedOutput] = useState<string>("")
  const editorRef = useRef<any>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const yOutputRef = useRef<Y.Text | null>(null)
  const yChatRef = useRef<Y.Array<any> | null>(null)

  const providerRef = useRef<WebsocketProvider | null>(null)
  const bindingRef = useRef<MonacoBinding | null>(null)
  const decorationsRef = useRef<string[]>([])
  const awarenessChangeHandlerRef = useRef<(() => void) | null>(null)

  const [chatOpen, setChatOpen] = useState<boolean>(false)
  const [chatInput, setChatInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<{ id: number; text: string; ts: number }[]>([])
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const aiChatEndRef = useRef<HTMLDivElement | null>(null)
  const [activeChatTab, setActiveChatTab] = useState<"room" | "assistant">("room")
  const [aiInput, setAIInput] = useState<string>("")
  const [aiMessages, setAIMessages] = useState<AIMessage[]>([])
  const [aiLoading, setAILoading] = useState<boolean>(false)
  const storedAttemptId = useRef<String | null>(null);

  useEffect(() => {
    if (!attemptId || storedAttemptId.current) return;
    storedAttemptId.current = attemptId; // Store the attemptId to avoid re-running
  }, [attemptId]);


  useEffect(() => {
    if (!roomId) return
  const ydoc = new Y.Doc()
    ydocRef.current = ydoc
  const wsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL ?? DEFAULT_COLLAB_WS
  const provider = new WebsocketProvider(wsUrl, roomId, ydoc)
    providerRef.current = provider
    return () => {
      if (awarenessChangeHandlerRef.current && provider.awareness) {
        provider.awareness.off("change", awarenessChangeHandlerRef.current)
        awarenessChangeHandlerRef.current = null
      }

      bindingRef.current?.destroy?.()
      bindingRef.current = null

      if (editorRef.current) {
        editorRef.current.deltaDecorations(decorationsRef.current, [])
        decorationsRef.current = []
        editorRef.current = null
      }

      provider.destroy()
      providerRef.current = null
      ydoc.destroy()
      ydocRef.current = null
    }
  }, [roomId])

  useEffect(() => {
    if (!ydocRef.current) return
    yOutputRef.current = ydocRef.current.getText("output")
    const updateOutput = async () => {
        const newOutput = yOutputRef.current!.toString()
        setSharedOutput(newOutput)

    // Update attempt whenever output changes
    try {
      if(storedAttemptId.current || attemptId) {
        const attemptToUpdateId = storedAttemptId.current ? storedAttemptId.current.toString() : attemptId!;
        await updateAttempt(attemptToUpdateId, {
          code: editorRef.current ? editorRef.current.getValue() : "",
          output: newOutput,
          status: "COMPLETED",
        })
      }
    } catch (historyError) {
      console.error("Failed to update attempt after code run", historyError)
    }
    }

    yOutputRef.current.observe(updateOutput)

    // Chat shared array
    const ychat = ydocRef.current.getArray<any>("chat")
    yChatRef.current = ychat
    const applyChat = () => {
      const items = ychat.toArray() as { id: number; text: string; ts: number }[]
      items.sort((a, b) => a.ts - b.ts)
      setChatMessages(items)
    }
    ychat.observe(applyChat)
    applyChat()

    updateOutput()
    return () => {
      yOutputRef.current?.unobserve(updateOutput)
      ychat.unobserve(applyChat)
    }
  }, [roomId])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  useEffect(() => {
    if (activeChatTab === "assistant" && aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [aiMessages, activeChatTab])

  function handleEditorDidMount(editor: any, monaco: any) {
    if (!ydocRef.current || !roomId) return
    const yText = ydocRef.current.getText("monaco")
    const provider = providerRef.current
    if (!provider) return

    const binding = new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness)
    bindingRef.current = binding
    editorRef.current = editor

    editor.onDidChangeModelContent(() => {
    const newCode = editor.getValue()
    onCodeChange?.(newCode)
    })

    const awareness = provider.awareness
    if (awarenessChangeHandlerRef.current) {
      awareness.off("change", awarenessChangeHandlerRef.current)
      awarenessChangeHandlerRef.current = null
    }
    const handleAwarenessChange = () => {
      const currentProvider = providerRef.current
      const currentAwareness = currentProvider?.awareness
      const editorInstance = editorRef.current

      if (!currentProvider || !currentAwareness || !editorInstance) {
        return
      }

      const states = Array.from(currentAwareness.getStates().entries())
      const decorations: monaco.editor.IModelDeltaDecoration[] = []
      states.forEach(([clientId, state]) => {
        if (clientId === currentAwareness.clientID) return
        if (state.selection) {
          const { start, end } = state.selection;
          if (start && end) {
            decorations.push({
              range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
              options: { /* ... */ }
            });
          }
        }
      })
      decorationsRef.current = editorInstance.deltaDecorations(decorationsRef.current, decorations)
    }

    awareness.on("change", handleAwarenessChange)
    awarenessChangeHandlerRef.current = handleAwarenessChange
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
      
      const run_result = response.data.run
      const run_output = run_result.stdout || ""
      const run_code = run_result.code || 0
      const run_stderr = run_result.stderr || ""
      setCodeRunning(false);
      console.log(run_output)
      console.log(run_result)
      if (run_code === 0) {
        // Success
        yOutputRef.current?.delete(0, yOutputRef.current.length)
        yOutputRef.current?.insert(0, run_output)
      } else {
        // Error
        yOutputRef.current?.delete(0, yOutputRef.current.length)
        yOutputRef.current?.insert(0, `Error (code ${run_code}):\n${run_stderr || run_output}`)
      }

    } catch (error) {
      alert("Error running code")
      console.error("Error:", error)
    }
  }

  const sendChatMessage = () => {
    if (!yChatRef.current) return
    const text = chatInput.trim()
    if (!text) return
    const id = providerRef.current ? providerRef.current.awareness.clientID : Math.floor(Math.random() * 1e9)
    const ts = Date.now()
    // Push a plain object – Yjs will encode it
    yChatRef.current.push([{ id, text, ts }])
    setChatInput("")
  }

  const sendAIMessage = async () => {
    const prompt = aiInput.trim()
    if (!prompt) return

    const ts = Date.now()
    const assistantId = `assistant-${ts}`

    setAIMessages((prev) => [
      ...prev,
      { id: `user-${ts}`, role: "user", text: prompt, ts },
      { id: assistantId, role: "assistant", text: "🧠 Gemini is thinking...", ts: ts + 1 },
    ])
    setAIInput("")
    setAILoading(true)

    try {
      const codeSnapshot = editorRef.current ? editorRef.current.getValue() : ""
      const response = await sendAIChat(questionDescription ?? "", codeSnapshot, prompt)
      const replyRaw = typeof response?.reply === "string" && response.reply.length > 0 ? response.reply : "Gemini sent an empty response."
  const replyText = replyRaw.length > 2000 ? `${replyRaw.slice(0, 2000)}...` : replyRaw

      setAIMessages((prev) =>
        prev.map((msg) => (msg.id === assistantId ? { ...msg, text: replyText } : msg))
      )
    } catch (error) {
      console.error("Gemini chat request failed", error)
      setAIMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, text: "⚠️ Gemini is unavailable right now." }
            : msg
        )
      )
    } finally {
      setAILoading(false)
    }
  }

  return (
    <div className="w-1/2 h-screen flex items-center justify-center bg-slate-800">
      <div className="bg-blue-200 rounded-lg shadow-lg p-6 w-[90%] h-[90vh] flex flex-col relative">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Live Collaboration Editor</h2>
              {roomId && (
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Room #{roomId}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRequestLeave}
                disabled={leaving}
              >
                {leaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    Leave session
                    <LogOut className="h-4 w-4" />
                  </>
                )}
              </Button>
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
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {participants.map((participant, idx) => {
                const label = participant.isCurrentUser ? `${participant.name} (You)` : participant.name
                return (
                  <span
                    key={`${participant.name}-${idx}`}
                    className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                      participant.isCurrentUser ? "bg-slate-900" : "bg-slate-700"
                    }`}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex items-center justify-end bg-gray-900 px-4 py-2 rounded-t-xl">
            <Button
              onClick={() => handleCodeRun()}
              variant="ghost"
              size="sm"
              className="bg-gray-800 text-gray-100 hover:bg-gray-700"
              disabled={codeRunning}
            >
              {codeRunning ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  Run
                  <Play className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div
            className="w-full"
            style={{ height: "80%", transition: "height 200ms ease" }}
          >
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
          <div className="flex-1 flex flex-col mt-3 w-full">
            <div className="text-lg font-bold bg-gray-900 text-white px-4 py-2 rounded-t">Output</div>
            <div className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-b border border-gray-700 overflow-auto">
              <pre className="whitespace-pre-wrap">{sharedOutput}</pre>
            </div>
          </div>
        </div>


        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          className="absolute bottom-5 right-5 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-xl hover:scale-[1.02] transition-transform focus:outline-none"
          aria-label={chatOpen ? "Close chat" : "Open chat"}
        >
          {chatOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </button>

        {/* Chat Panel */}
        {chatOpen && (
          <div className="absolute bottom-24 right-6 w-[380px] sm:w-[420px] max-w-[92vw] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-4 bg-slate-900 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Collaboration</p>
                  <p className="text-lg font-semibold mt-1">Chat Center</p>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="rounded-full border border-white/30 p-1 hover:bg-white/10"
                  aria-label="Close chat panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-slate-800 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveChatTab("room")}
                  className={`rounded-full px-3 py-1.5 transition ${activeChatTab === "room" ? "bg-white text-slate-900 shadow" : "text-slate-300"}`}
                >
                  Room Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChatTab("assistant")}
                  className={`rounded-full px-3 py-1.5 transition ${activeChatTab === "assistant" ? "bg-white text-slate-900 shadow" : "text-slate-300"}`}
                >
                  AI Assistant
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 px-4 py-4 overflow-y-auto space-y-3">
              {activeChatTab === "room" ? (
                <>
                  {chatMessages.length === 0 && (
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      No messages yet. Say hi! 👋
                    </div>
                  )}
                  {chatMessages.map((m, idx) => {
                    const mine = providerRef.current ? m.id === providerRef.current.awareness.clientID : false
                    return (
                      <div key={m.ts + ":" + idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${mine ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" : "bg-white text-slate-900"}`}>
                          <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{mine ? "You" : `User ${m.id}`}</div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <>
                  {aiMessages.length === 0 && (
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      Ask Gemini for hints or explanations tailored to this question.
                    </div>
                  )}
                  {aiMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                            : "bg-white border border-indigo-100 text-slate-900"
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">
                          {msg.role === "user" ? "You" : "Gemini"}
                        </div>
                        <FormattedMessage text={msg.text} />
                      </div>
                    </div>
                  ))}
                  <div ref={aiChatEndRef} />
                </>
              )}
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-3">
              {activeChatTab === "room" ? (
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        sendChatMessage()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={sendChatMessage}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={aiLoading ? "Waiting for Gemini..." : "Ask Gemini for help..."}
                    value={aiInput}
                    onChange={(e) => setAIInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        sendAIMessage()
                      }
                    }}
                    disabled={aiLoading}
                  />
                  <button
                    type="button"
                    onClick={sendAIMessage}
                    className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 text-sm font-semibold text-white hover:from-indigo-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label="Send AI request"
                    disabled={aiLoading}
                  >
                    <Sparkles className="h-4 w-4" />
                    Ask
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormattedMessage({ text }: { text: string }) {
  const cleaned = text ?? ""
  const blocks = cleaned.split(/\n\s*\n/).filter((block) => block.trim().length > 0)

  if (blocks.length === 0) {
    return <p className="leading-relaxed text-sm">{cleaned.trim().length ? cleaned : ""}</p>
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim()

        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
          const lines = trimmed.split("\n")
          const closingIndex = lines.lastIndexOf("```")
          const codeLines = closingIndex > 0 ? lines.slice(1, closingIndex) : lines.slice(1)
          const code = codeLines.join("\n")
          return (
            <pre
              key={`code-${blockIdx}`}
              className="whitespace-pre-wrap rounded-2xl bg-slate-900 px-3 py-3 text-xs text-slate-100 shadow-inner"
            >
              <code>{code}</code>
            </pre>
          )
        }

        const lines = trimmed.split("\n")
        const listItems = lines.filter((line) => /^[-*+]\s+/.test(line.trim()))

        if (listItems.length > 0 && listItems.length === lines.length) {
          return (
            <ul key={`list-${blockIdx}`} className="list-disc space-y-1 pl-5 text-sm marker:text-indigo-500">
              {listItems.map((item, idx) => (
                <li key={`item-${blockIdx}-${idx}`}>{item.replace(/^[-*+]\s+/, "")}</li>
              ))}
            </ul>
          )
        }

        if (lines.length > 1) {
          return (
            <div key={`paragraph-${blockIdx}`} className="space-y-1 text-sm">
              {lines.map((line, idx) => (
                <p key={`line-${blockIdx}-${idx}`} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )
        }

        return (
          <p key={`single-${blockIdx}`} className="leading-relaxed text-sm">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}