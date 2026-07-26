import Link from "next/link";
import { Button } from "../../ui/button";
import { getUser } from "@/src/actions/getUserSession";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogOutIcon, MenuIcon, User2 } from "lucide-react";
import Logo from "@/components/ui/logo";
import { AnimatedThemeToggler } from "@/components/magicui/theme-toggler";
import { SignInModal } from "../sign-in/Sign-in";
import { SignUpModal } from "../sign-up/Sign-up";
import LanguageSwitcher from "@/components/elements/language-switcher/language-switcher";
import { getTranslations } from "next-intl/server";

export default async function Header() {
    const user = await getUser()
    const tNav = await getTranslations('nav')
    const tCommon = await getTranslations('common')

    const links = [
        { name: tNav('home'), href: '/' },
        { name: tNav('bakuDex'), href: '/baku-dex' },
        { name: tNav('patchNotes'), href: '/patch-notes' },
        { name: tNav('thanks'), href: '/thanks' },
        { name: tNav('legal'), href: '/legal' },
    ]

    return (
        <header className="sticky top-0 left-0 z-20 flex w-full max-w-full items-center justify-between gap-2 bg-background px-5 py-3 md:px-10">
            <div className="flex min-w-0 items-center gap-10">
                <Logo height={50} width={50} />

                <nav className='hidden md:block'>
                    <ul className="flex flex-wrap items-center gap-3">
                        {
                            links.map((l, index) => <li key={index}><Button asChild variant='link'><Link href={l.href}>{l.name}</Link></Button></li>)
                        }
                    </ul>
                </nav>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                <LanguageSwitcher />
                <AnimatedThemeToggler />
                {
                    user ?
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant='outline' asChild className="p-0 shrink-0">
                                    <Avatar>
                                        {
                                            user.image != undefined && <AvatarImage src={user.image} className="size-5" alt={user.name} />
                                        }
                                        <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link className="flex items-center gap-3" href='/dashboard'>
                                        <User2 />
                                        {tCommon('nav.account')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <form className='w-full'>
                                        <button className='w-full flex items-center gap-3' formAction={async () => {
                                            'use server'

                                            await auth.api.signOut({
                                                headers: await headers()
                                            })

                                            redirect('/')
                                        }}>
                                            <LogOutIcon /> {tCommon('nav.logOut')}
                                        </button>
                                    </form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        : <>
                            <SignInModal />
                            <SignUpModal />
                        </>
                }
                <DropdownMenu>
                    <DropdownMenuTrigger className="md:hidden" asChild>
                        <Button variant='outline' size="icon" className="shrink-0">
                            <MenuIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {
                            links.map((l, index) => <DropdownMenuItem key={index} asChild>
                                <Link href={l.href}>{l.name}</Link>
                            </DropdownMenuItem>)
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
