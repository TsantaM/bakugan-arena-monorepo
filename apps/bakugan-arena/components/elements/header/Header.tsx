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
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/ui/logo";
import { AnimatedThemeToggler } from "@/components/magicui/theme-toggler";
import { SignInModal } from "../sign-in/Sign-in";
import { SignUpModal } from "../sign-up/Sign-up";
import { LinksList } from "@/src/store/links-list";

export default async function Header() {

    const user = await getUser()



    return (
        <header className="w-screen flex justify-between items-center px-5 md:px-10 py-3 sticky top-0 left-0 bg-background">
            <div className="flex items-center gap-10">
                <Logo height={50} width={50} />

                <nav className='hidden md:block'>
                    <ul className="flex items-center gap-3">
                        {
                            LinksList.map((l, index) => <li key={index}><Button asChild variant='link'><Link href={l.href}>{l.name}</Link></Button></li>)
                        }
                    </ul>
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <AnimatedThemeToggler />
                {
                    user ?
                        <Suspense fallback={<Skeleton />}>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant='outline' asChild className="p-0">
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
                                            Account
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
                                                <LogOutIcon /> Log out
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
                            LinksList.map((l, index) => <DropdownMenuItem key={index} asChild>
                                <Link href={l.href}>{l.name}</Link>
                            </DropdownMenuItem>)
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}