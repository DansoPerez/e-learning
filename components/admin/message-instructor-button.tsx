import { startAdminInstructorChatAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function MessageInstructorButton({
  instructorId,
  label = "Message",
  variant = "outline",
}: {
  instructorId: string;
  label?: string;
  variant?: "outline" | "secondary" | "primary";
}) {
  return (
    <form action={startAdminInstructorChatAction.bind(null, instructorId)}>
      <Button
        type="submit"
        variant={variant}
        size="sm"
        className="min-h-[44px] w-full gap-1.5 sm:w-auto"
      >
        <MessageCircle className="h-4 w-4" />
        {label}
      </Button>
    </form>
  );
}
