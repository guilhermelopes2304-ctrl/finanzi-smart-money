import type { ReactNode } from "react";
import { Check, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinMascot } from "@/components/finanzzi/FinMascot";

/* ------------------------------------------------------------------ */
/* Chat message model                                                 */
/* ------------------------------------------------------------------ */

export type ChatMessage = {
  from: "user" | "fin";
  /** Main text of the bubble. */
  text?: string;
  /** Large emphasised line (e.g. a big number). */
  emphasis?: string;
  /** Secondary muted line below the main text. */
  meta?: string;
  /** Shows a small confirmation chip like "Registrado". */
  confirm?: string;
  /** A tiny reaction shown floating next to a fin bubble. */
  reaction?: string;
};

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.from === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[18px] rounded-br-md bg-[#5B5CE2] px-3.5 py-2.5 text-[15px] font-medium leading-snug text-white shadow-[0_6px_16px_rgba(91,92,226,0.28)]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#EEF0FF]">
        <FinMascot expression="normal" className="h-6 w-6" alt="" />
      </span>
      <div className="relative max-w-[80%]">
        <div className="rounded-[18px] rounded-bl-md border border-[#E9EBF3] bg-white px-3.5 py-2.5 shadow-[0_6px_16px_rgba(21,24,39,0.06)]">
          {message.confirm && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[11px] font-bold text-[#4546C8]">
              <Check className="size-3" strokeWidth={3} /> {message.confirm}
            </span>
          )}
          {message.text && (
            <p className="text-[15px] font-medium leading-snug text-[#151827]">{message.text}</p>
          )}
          {message.emphasis && (
            <p className="mt-0.5 font-display text-[26px] font-bold leading-none tracking-[-0.03em] text-[#151827]">
              {message.emphasis}
            </p>
          )}
          {message.meta && <p className="mt-1 text-[13px] leading-snug text-[#667085]">{message.meta}</p>}
        </div>
        {message.reaction && (
          <span className="absolute -right-3 -top-3 grid size-8 place-items-center rounded-full bg-white text-lg shadow-[0_4px_12px_rgba(21,24,39,0.12)]">
            {message.reaction}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone frame                                                        */
/* ------------------------------------------------------------------ */

export function PhoneFrame({
  children,
  className,
  headerTitle = "FINANZZI",
  headerSubtitle = "online",
  showInput = true,
  inputPlaceholder = "Mensagem",
}: {
  children: ReactNode;
  className?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  showInput?: boolean;
  inputPlaceholder?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[300px] rounded-[2.75rem] border-[6px] border-[#151827] bg-[#151827] shadow-[0_40px_90px_-30px_rgba(21,24,39,0.55)]",
        className,
      )}
    >
      {/* notch */}
      <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#151827]" />
      <div className="overflow-hidden rounded-[2.3rem] bg-[#F4F5F8]">
        {/* chat header */}
        <div className="flex items-center gap-2.5 bg-[#5B5CE2] px-4 pb-3 pt-7 text-white">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/15">
            <FinMascot expression="feliz" className="h-8 w-8" alt="" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{headerTitle}</p>
            <p className="flex items-center gap-1 text-[11px] leading-tight text-white/75">
              <span className="inline-block size-1.5 rounded-full bg-[#8FE3A9]" />
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* chat body */}
        <div className="flex flex-col gap-2.5 px-3.5 py-4">{children}</div>

        {/* input bar */}
        {showInput && (
          <div className="flex items-center gap-2 border-t border-[#E9EBF3] bg-white px-3 py-2.5">
            <div className="flex h-9 flex-1 items-center rounded-full bg-[#F4F5F8] px-3.5 text-[13px] text-[#667085]">
              {inputPlaceholder}
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#5B5CE2] text-white">
              <Mic className="size-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Convenience: full chat thread inside a phone                       */
/* ------------------------------------------------------------------ */

export function PhoneChat({
  messages,
  className,
  ...frameProps
}: {
  messages: ChatMessage[];
  className?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  showInput?: boolean;
  inputPlaceholder?: string;
}) {
  return (
    <PhoneFrame className={className} {...frameProps}>
      {messages.map((message, index) => (
        <Bubble key={index} message={message} />
      ))}
    </PhoneFrame>
  );
}

export { Bubble as ChatBubble };
