import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Loader2, BookOpen, Database } from "lucide-react";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { macondoLore } from "../data/macondoLore";

interface Message {
  role: "user" | "model";
  content: string;
  ragContext?: string[];
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function MelquiadesChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "我是梅尔基亚德斯。时间在马孔多只是一个圆圈。你有什么想问的？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  
  // RAG State
  const [loreEmbeddings, setLoreEmbeddings] = useState<number[][] | null>(null);
  const [isInitializingRAG, setIsInitializingRAG] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize RAG embeddings when chat opens
  useEffect(() => {
    if (isOpen && !loreEmbeddings && !isInitializingRAG) {
      initRAG();
    }
  }, [isOpen, loreEmbeddings, isInitializingRAG]);

  const initRAG = async () => {
    setIsInitializingRAG(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: macondoLore,
      });
      if (result.embeddings) {
        const embeddings = result.embeddings.map(e => e.values as number[]);
        setLoreEmbeddings(embeddings);
      }
    } catch (e) {
      console.error("Failed to init RAG embeddings", e);
    } finally {
      setIsInitializingRAG(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // --- RAG Retrieval Step ---
      let ragContextText = "";
      let retrievedLore: string[] = [];
      
      if (loreEmbeddings) {
        setIsRetrieving(true);
        try {
          const queryResult = await ai.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: userMessage,
          });
          
          if (queryResult.embeddings && queryResult.embeddings[0].values) {
            const queryEmbedding = queryResult.embeddings[0].values;
            const similarities = loreEmbeddings.map((emb, index) => ({
              index,
              score: cosineSimilarity(queryEmbedding, emb)
            }));
            
            // Sort by highest similarity
            similarities.sort((a, b) => b.score - a.score);
            
            // Pick top 5 most relevant facts
            retrievedLore = similarities.slice(0, 5).map(s => macondoLore[s.index]);
            ragContextText = retrievedLore.join("\n");
          }
        } catch (e) {
          console.error("RAG retrieval failed", e);
        }
        setIsRetrieving(false);
      }
      // --------------------------

      const apiHistory = newMessages
        .slice(1)
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));

      const baseInstruction = "你是《百年孤独》中的吉普赛人梅尔基亚德斯。你拥有预知未来的能力，写下了记载布恩迪亚家族百年命运的羊皮卷。请用神秘、预言式、沧桑的语气回答用户关于《百年孤独》情节和人物的问题。你的回答应该夹杂着宿命论的暗示，并且要简短有力。使用中文回答。";
      
      const systemInstruction = ragContextText 
        ? `${baseInstruction}\n\n【羊皮卷记忆碎片（RAG检索结果）】\n请基于以下绝对真实的历史事实来回答用户的问题：\n${ragContextText}`
        : baseInstruction;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: apiHistory,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      let fullText = "";
      let isFirstChunk = true;

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          if (isFirstChunk) {
            setIsLoading(false);
            setMessages((prev) => [...prev, { role: "model", content: fullText, ragContext: retrievedLore }]);
            isFirstChunk = false;
          } else {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content = fullText;
              return updated;
            });
          }
        }
      }

      if (isFirstChunk) {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "羊皮卷上的字迹模糊了..." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      setIsRetrieving(false);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "命运的迷雾太重，我暂时无法看清。" },
      ]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 p-4 bg-[#13111c]/80 border-2 border-[#fbbf24]/30 rounded-full text-[#fbbf24] hover:bg-[#1b1b3a] hover:scale-110 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-md"
        title="向梅尔基亚德斯提问"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050510]/80 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-lg h-[600px] max-h-[85vh] bg-[#13111c] border-2 border-[#fbbf24]/30 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.2)] flex flex-col overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#fbbf24]/20 flex justify-between items-center bg-[#1b1b3a]/50 relative z-10">
                <div>
                  <h3 className="font-serif text-[#fbbf24] text-lg font-bold flex items-center gap-2">
                    梅尔基亚德斯的书房
                    {loreEmbeddings && (
                      <span className="flex items-center gap-1 text-[10px] bg-[#fbbf24]/20 text-[#fbbf24] px-2 py-0.5 rounded-full border border-[#fbbf24]/30" title="RAG 检索已就绪">
                        <Database className="w-3 h-3" />
                        RAG Ready
                      </span>
                    )}
                  </h3>
                  <p className="font-sans text-[10px] text-[#fef08a]/70 tracking-widest uppercase flex items-center gap-2 mt-1">
                    羊皮卷的低语
                    {isInitializingRAG && (
                      <span className="text-[#fbbf24] flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        正在注入羊皮卷记忆...
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#fef08a]/70 hover:text-[#fbbf24] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl font-serif text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#fbbf24]/20 text-[#fef08a] rounded-tr-none border border-[#fbbf24]/30"
                          : "bg-[#1b1b3a] text-[#fbbf24] rounded-tl-none border border-[#fbbf24]/20"
                      }`}
                    >
                      {msg.content}
                    </div>
                    
                    {/* RAG Context Debug/UI Indicator */}
                    {msg.role === "model" && msg.ragContext && msg.ragContext.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#fef08a]/40" title={msg.ragContext.join('\n\n')}>
                        <BookOpen className="w-3 h-3" />
                        已参考 {msg.ragContext.length} 条羊皮卷记忆
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-xl bg-[#1b1b3a] text-[#fbbf24] rounded-tl-none border border-[#fbbf24]/20 flex items-center gap-2 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-serif text-sm">
                        {isRetrieving ? "正在检索羊皮卷记忆..." : "解读命运的轨迹..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#fbbf24]/20 bg-[#13111c]/80 backdrop-blur-sm relative z-10">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="询问马孔多的命运..."
                    className="w-full bg-[#1b1b3a]/50 border border-[#fbbf24]/30 rounded-full py-2 pl-4 pr-10 text-[#fef08a] font-serif text-sm focus:outline-none focus:border-[#fbbf24] placeholder:text-[#fef08a]/40 shadow-inner"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#fbbf24] hover:bg-[#fbbf24]/20 rounded-full transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
