"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string | null; role: string };
};

export function ChatThread({
  conversationId,
  messages,
  currentUserId,
}: {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [state, action, pending] = useActionState(
    sendMessageAction.bind(null, conversationId),
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
        {messages.length === 0 ?
          <p className="text-center text-sm text-[var(--foreground-muted)]">
            No messages yet. Say hello!
          </p>
        : messages.map((m) => {
            const isMine = m.sender.id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine ?
                      "bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] bg-white text-[var(--foreground-secondary)]"
                  }`}
                >
                  {!isMine ?
                    <p className="mb-1 text-xs font-semibold opacity-80">
                      {m.sender.name ?? "User"}
                      {m.sender.role === "ADMIN" ? " (Admin)" : ""}
                      {m.sender.role === "INSTRUCTOR" ? " (Instructor)" : ""}
                    </p>
                  : null}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${isMine ? "text-indigo-200" : "text-[var(--foreground-muted)]"}`}
                  >
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        }
      </div>

      <form action={action} className="space-y-2">
        {state.error ?
          <p className="text-sm text-red-600">{state.error}</p>
        : null}
        <Textarea
          name="body"
          required
          rows={3}
          placeholder="Type your message..."
          className="resize-none"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </div>
  );
}
