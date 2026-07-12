"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_COLOR, ROLE_LABEL, type UserRole } from "@/lib/types";
import { Send, Loader2, Trash2, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    role: UserRole;
  } | null;
}

export default function ChatPage() {
  const supabase = createClient();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("id, user_id, message, created_at, profiles(username, role)")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as unknown as ChatMessage[]);
        setLoading(false);
      });
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("public-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          const { data } = await supabase
            .from("profiles")
            .select("username, role")
            .eq("id", payload.new.user_id)
            .single();
          setMessages((prev) => [
            ...prev,
            {
              id: payload.new.id,
              user_id: payload.new.user_id,
              message: payload.new.message,
              created_at: payload.new.created_at,
              profiles: data as { username: string; role: UserRole } | null,
            },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setSending(true);
    await supabase.from("chat_messages").insert({ user_id: user.id, message: input.trim() });
    setInput("");
    setSending(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("chat_messages").delete().eq("id", id);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-ember" size={22} />
        <h1 className="font-display text-2xl">CHAT PUBLIC</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-panel border border-line rounded-xl p-4 mb-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-ember" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-mute font-mono text-sm text-center py-10">
            Belum ada pesan. Jadi yang pertama!
          </p>
        ) : (
          messages.map((m) => {
            const role = m.profiles?.role ?? "rakyat_konoha";
            const isOwn = m.user_id === user?.id;
            const canDelete = isOwn || profile?.role === "admin";
            return (
              <div key={m.id} className="group flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold">{m.profiles?.username ?? "?"}</span>
                    <span className={`text-[10px] font-mono border rounded-full px-1.5 py-0.5 ${ROLE_COLOR[role]}`}>
                      {ROLE_LABEL[role]}
                    </span>
                    <span className="text-mute text-[10px] font-mono">
                      {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm break-words mt-0.5">{m.message}</p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 text-mute hover:text-red-400 transition-opacity shrink-0"
                    aria-label="Hapus pesan"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {user ? (
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            maxLength={500}
            className="flex-1 bg-panel border border-line rounded-full px-4 py-3 outline-none focus:border-ember transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-ember text-ink p-3 rounded-full hover:bg-ember2 transition-colors disabled:opacity-50 shrink-0"
            aria-label="Kirim"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      ) : (
        <div className="text-center bg-panel border border-line rounded-xl p-4">
          <p className="font-mono text-sm text-mute mb-2">Login dulu buat ikut chat.</p>
          <Link href="/login" className="text-ember font-mono text-sm hover:underline">
            Login →
          </Link>
        </div>
      )}
    </div>
  );
}
