"use client"

import { useLocale } from "next-intl"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const { user } = useUser()
  const locale = useLocale()
  const router = useRouter()

  const languages = [
    { code: "en", label: "English (en)" },
    { code: "ar", label: "العربية (ar)" },
    { code: "fr", label: "Français (fr)" },
  ]

  const handleLanguageChange = async (newLocale: string) => {
    if (!user) return
    try {
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, locale: newLocale },
      })
      router.push(`/${newLocale}/dashboard`)
    } catch (error) {
      console.error("Failed to update language preference", error)
    }
  }

  const currentLang = languages.find((l) => l.code === locale)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="me-2 size-4" />
        <span>{currentLang?.label || "Language"}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
