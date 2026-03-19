"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bug, Lightbulb, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type FeedbackType = "bug" | "feature" | "general";

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const t = useTranslations("dashboard.feedback");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { user } = useUser();
  const submitFeedback = useMutation(api.feedback.submitFeedback);

  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const MAX_CHARS = 1000;
  const MIN_CHARS = 20;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setType("general");
      setMessage("");
      setError(null);
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (message.length < MIN_CHARS) {
      setError(t("validationMin"));
      return;
    }

    setIsLoading(true);

    try {
      const submitterName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Anonymous";
      const submitterEmail = user?.primaryEmailAddress?.emailAddress;
      
      await submitFeedback({
        type,
        message,
        submitterName,
        submitterEmail,
      });

      setIsSuccess(true);
      
      // Auto-close after 2s on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent dir={dir} className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 backdrop-blur-sm dark:bg-slate-950/95 overflow-hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">{t("title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-semibold">Multiple thanks!</h3>
              <p className="text-muted-foreground">{t("successMessage")}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("whatsOnYourMind")}</Label>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(val) => val && setType(val as FeedbackType)}
                className="justify-start gap-2"
              >
                <ToggleGroupItem
                  value="bug"
                  aria-label="Bug"
                  className={cn(
                    "flex-1 h-14 flex flex-col items-center justify-center gap-1.5 transition-all border border-transparent",
                    "data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-200 data-[state=on]:shadow-sm",
                    "dark:data-[state=on]:bg-red-900/20 dark:data-[state=on]:text-red-400 dark:data-[state=on]:border-red-800",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Bug className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("typeBug")}</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="feature"
                  aria-label="Feature Request"
                  className={cn(
                    "flex-1 h-14 flex flex-col items-center justify-center gap-1.5 transition-all border border-transparent text-center px-1",
                    "data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700 data-[state=on]:border-amber-200 data-[state=on]:shadow-sm",
                    "dark:data-[state=on]:bg-amber-900/20 dark:data-[state=on]:text-amber-400 dark:data-[state=on]:border-amber-800",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{t("typeFeature")}</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="general"
                  aria-label="General"
                  className={cn(
                    "flex-1 h-14 flex flex-col items-center justify-center gap-1.5 transition-all border border-transparent",
                    "data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 data-[state=on]:border-blue-200 data-[state=on]:shadow-sm",
                    "dark:data-[state=on]:bg-blue-900/20 dark:data-[state=on]:text-blue-400 dark:data-[state=on]:border-blue-800",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("typeGeneral")}</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-sm font-medium">{t("messageLabel")}</Label>
              <div className="relative">
                <Textarea
                  id="feedback-message"
                  placeholder={t("placeholder")}
                  className="min-h-[150px] resize-none focus-visible:ring-primary/20 transition-all border-slate-200 dark:border-slate-800"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MAX_CHARS}
                />
                <div 
                  className={cn(
                    "absolute bottom-3 end-3 text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md text-start",
                    message.length >= MAX_CHARS ? "text-red-500 bg-red-50 dark:bg-red-950/20" : "text-slate-400 bg-slate-50 dark:bg-slate-900/20"
                  )}
                >
                  {t("characterCount", { count: message.length })}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || message.length === 0}
                className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
