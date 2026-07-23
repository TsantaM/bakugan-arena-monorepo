"use client"

import Link from "next/link"
import { Button } from "../../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar"
import { LogOutIcon, MenuIcon, User2 } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Logo from "@/components/ui/logo"
import { AnimatedThemeToggler } from "@/components/magicui/theme-toggler"
import { SignInModal } from "../sign-in/Sign-in"
import { SignUpModal } from "../sign-up/Sign-up"
import LanguageSwitcher from "@/components/elements/language-switcher/language-switcher"
import { signOutAction } from "./sign-out-action"

export type HeaderUser = {
    name: string
    image?: string | null
}

export type HeaderLink = {
    name: string
    href: string
}

type HeaderClientProps = {
    user: HeaderUser | null
    links: HeaderLink[]
    accountLabel: string
    logOutLabel: string
}

export default function HeaderClient({
    user,
    links,
    accountLabel,
    logOutLabel,
}: HeaderClientProps) {
    return (
        <header className="w-screen flex justify-between items-center px-5 md:px-10 py-3 sticky top-0 left-0 z-20 bg-background">
            <div className="flex items-center gap-10">
                <Logo height={50} width={50} />

                <nav className='hidden md:block'>
                    <ul className="flex items-center gap-3">
                        {
                            links.map((l, index) => (
                                <li key={index}>
                                    <Button asChild variant='link'>
                                        <Link href={l.href}>{l.name}</Link>
                                    </Button>
                                </li>
                            ))
                        }
                    </ul>
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <AnimatedThemeToggler />
                {
                    user ?
                        <Suspense fallback={<Skeleton />}>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant='outline' asChild className="p-0">
                                        <Avatar>
                                            {
                                                user.image != undefined && user.image != null && (
                                                    <AvatarImage src={user.image} className="size-5" alt={user.name} />
                                                )
                                            }
                                            <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link className="flex items-center gap-3" href='/dashboard'>
                                            <User2 />
                                            {accountLabel}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <form className='w-full' action={signOutAction}>
                                            <button className='w-full flex items-center gap-3' type="submit">
                                                <LogOutIcon /> {logOutLabel}
                                            </button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Suspense>

                        : <>
                            <SignInModal />
                            <SignUpModal />
                        </>
                }
                <DropdownMenu>
                    <DropdownMenuTrigger className="md:hidden" asChild>
                        <Button variant='outline'>
                            <MenuIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {
                            links.map((l, index) => (
                                <DropdownMenuItem key={index} asChild>
                                    <Link href={l.href}>{l.name}</Link>
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
