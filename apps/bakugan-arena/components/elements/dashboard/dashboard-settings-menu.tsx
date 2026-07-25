'use client'

import LanguageSwitcher from "@/components/elements/language-switcher/language-switcher"
import { SoundPlayerControls } from "@/components/elements/sound-player/sound-player"
import { AnimatedThemeToggler } from "@/components/magicui/theme-toggler"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"
import { useTranslations } from "next-intl"

export default function DashboardSettingsMenu() {
    const t = useTranslations('common.a11y')

    return (
        <>
            {/* <div className="hidden md:contents">
                <LanguageSwitcher />
                <SoundPlayerControls />
                <AnimatedThemeToggler />
            </div> */}

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="">
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={t('openSettings')}
                    >
                        <Settings />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3">
                    <div className="flex flex-col gap-3">
                        <LanguageSwitcher className="w-full" />
                        <SoundPlayerControls variant="inline" />
                        <div className="flex items-center justify-between gap-2 px-1">
                            <span className="text-sm text-muted-foreground">{t('toggleTheme')}</span>
                            <AnimatedThemeToggler />
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
