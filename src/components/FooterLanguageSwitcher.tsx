"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Languages } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LOCALE_COOKIE = "NEXT_LOCALE"

export function FooterLanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
  ]

  const handleLanguageChange = (newLocale: string) => {
    // Persist locale in cookie so middleware can redirect bare / to saved locale
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000;samesite=lax`;

    // Use locale-aware navigation: stay on current path but switch locale
    router.push(pathname, { locale: newLocale });
  }

  const currentLang = languages.find((lang) => lang.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] hover:bg-[var(--lp-surface-2)] transition-colors h-8"
        >
          <Languages className="h-3.5 w-3.5 text-[var(--lp-text-muted)]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.08em]">
            {currentLang?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[var(--lp-surface)] border-[var(--lp-border)] text-[var(--lp-text)]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "cursor-pointer text-[13px] hover:bg-[var(--lp-surface-2)] focus:bg-[var(--lp-surface-2)] focus:text-[var(--lp-text)] transition-colors",
              lang.code === locale && "font-semibold text-[var(--lp-gold)]"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
