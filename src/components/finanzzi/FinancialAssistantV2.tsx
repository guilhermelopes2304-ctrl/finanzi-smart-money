// biome-ignore-all lint/correctness/useExhaustiveDependencies: the assistant listener intentionally binds once to the browser event bus.
/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { useAccounts, useBills, useCategories, useCreditCards, useGoals, useInvalidateFinance, useProfile, useSaveRow, useTransactions } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL, formatDateBR, monthRange, todayISO } from "@/lib/format";
import { askFinAI } from "@/lib/fin-ai";
import { interpretFinanceMessage } from "@/lib/channel-engine";
import { trackProductEvent } from "@/lib/product-analytics";
import { cn } from "@/lib/utils";

// BODY PRESERVED
