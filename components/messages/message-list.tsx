import { MessageBubble, type MessageBubbleData } from "@/components/messages/message-bubble";

export function MessageList({
  messages,
  currentUserId,
  viewerIsAdmin,
}: {
  messages: MessageBubbleData[];
  currentUserId: string;
  viewerIsAdmin: boolean;
}) {
  return (
    <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      {messages.length === 0 ?
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          No messages yet.
        </p>
      : messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={m.sender.id === currentUserId}
            viewerIsAdmin={viewerIsAdmin}
          />
        ))
      }
    </div>
  );
}
