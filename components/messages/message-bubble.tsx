import { formatDate } from "@/lib/utils";

export type MessageBubbleData = {
  id: string;
  body: string;
  createdAt: Date;
  deletedAt?: Date | null;
  sender: { id: string; name: string | null; role: string; userCode?: string | null };
};

export function MessageBubble({
  message,
  isMine,
  viewerIsAdmin,
  onDelete,
}: {
  message: MessageBubbleData;
  isMine: boolean;
  viewerIsAdmin: boolean;
  onDelete?: () => void;
}) {
  const deleted = Boolean(message.deletedAt);
  const adminDeletedView = viewerIsAdmin && deleted;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={
          adminDeletedView ?
            "max-w-[min(85%,100%)] break-words rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm shadow-sm ring-2 ring-red-200"
          : deleted && !viewerIsAdmin ?
            "max-w-[min(85%,100%)] break-words rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm italic text-zinc-500"
          : isMine ?
            "max-w-[min(85%,100%)] break-words rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-sm text-white shadow-md"
          : "max-w-[min(85%,100%)] break-words rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground-secondary)] shadow-sm"
        }
      >
        {!isMine ?
          <p
            className={`mb-1 text-xs font-semibold ${adminDeletedView ? "text-red-800" : "opacity-80"}`}
          >
            {message.sender.name ?? "User"}
            {message.sender.userCode ? ` · ${message.sender.userCode}` : ""}
          </p>
        : null}

        {adminDeletedView ?
          <p className="mb-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Deleted — admin view
          </p>
        : null}

        <p
          className={`break-words whitespace-pre-wrap ${
            adminDeletedView ? "text-red-900"
            : deleted ? "text-zinc-500"
            : ""
          }`}
        >
          {deleted && !viewerIsAdmin ? "[Message deleted]" : message.body}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p
            className={`text-[10px] ${
              adminDeletedView ? "text-red-700"
              : isMine && !deleted ? "text-indigo-200"
              : "text-[var(--foreground-muted)]"
            }`}
          >
            {formatDate(message.createdAt)}
          </p>
          {isMine && !deleted && onDelete ?
            <button
              type="button"
              className={`text-[10px] font-medium underline ${isMine ? "text-indigo-100" : ""}`}
              onClick={onDelete}
            >
              Delete
            </button>
          : null}
        </div>
      </div>
    </div>
  );
}
