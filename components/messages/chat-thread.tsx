"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { sendMessageAction, deleteMessageAction } from "@/app/actions/messages";
import { MessageBubble, type MessageBubbleData } from "@/components/messages/message-bubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_POLL_MS } from "@/lib/presence-utils";
import { useVisibleInterval } from "@/lib/use-visible-interval";

export function ChatThread({
  conversationId,
  messages: initialMessages,
  currentUserId,
  viewerIsAdmin = false,
}: {
  conversationId: string;
  messages: MessageBubbleData[];
  currentUserId: string;
  /** When true, deleted messages show original text in red (admin moderation view) */
  viewerIsAdmin?: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [state, action, pending] = useActionState(
    sendMessageAction.bind(null, conversationId),
    {},
  );

  const refreshMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(
        data.messages.map(
          (m: MessageBubbleData & { displayBody: string; isDeleted: boolean; body: string }) => ({
            id: m.id,
            body: viewerIsAdmin && m.isDeleted ? m.body : (m.displayBody ?? m.body),
            createdAt: new Date(m.createdAt),
            deletedAt: m.deletedAt ? new Date(m.deletedAt) : null,
            sender: m.sender,
          }),
        ),
      );
    } catch {
      /* ignore */
    }
  }, [conversationId, viewerIsAdmin]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useVisibleInterval(refreshMessages, MESSAGE_POLL_MS);

  useEffect(() => {
    if (!pending && !state.error) {
      refreshMessages();
    }
  }, [pending, state.error, refreshMessages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
        {messages.length === 0 ?
          <p className="text-center text-sm text-[var(--foreground-muted)]">
            No messages yet. Say hello!
          </p>
        : messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMine={m.sender.id === currentUserId}
              viewerIsAdmin={viewerIsAdmin}
              onDelete={
                m.sender.id === currentUserId && !m.deletedAt ?
                  async () => {
                    await deleteMessageAction(m.id);
                    await refreshMessages();
                  }
                : undefined
              }
            />
          ))
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
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </div>
  );
}
