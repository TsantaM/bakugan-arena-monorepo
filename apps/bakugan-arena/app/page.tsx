'use server'

import Header from "@/components/elements/header/Header";
import { SignInModal } from "@/components/elements/sign-in/Sign-in";
import { SignUpModal } from "@/components/elements/sign-up/Sign-up";
import { Button } from "@/components/ui/button";
import { getUser } from "@/src/actions/getUserSession";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {

  const user = await getUser()

  return (
    <>
      <Header />

      <section className="flex-1 min-h-0 lg:w-full flex flex-col lg:flex-row items-center md:items-start justify-center lg:items-center bg-background px-10 py-5 gap-5">

        <div className="flex flex-col items-center md:items-start gap-5">
          <div>
            <h1 className="lg:max-w-[65%] text-5xl font-bold text-center md:text-start text-red-500">Bakugan Arena - Online Battle Simulator</h1>
            <p className="text-neutral-500 text-sm text-center md:text-start">Play Bakugan battles directly in your browser. No install. Fan Made. Multiplayer</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className='md:max-w-[50%] text-center md:text-start'>Welcome to Bakugan Arena (Alpha), a fan made online simulator inspired by Bakugan Battle Brawlers.</p>
            <p className='md:max-w-[50%] text-center md:text-start'>Create an account, build deck with your favorite Bakugan, and challenge other players in browser based matches - no download requierd.</p>
          </div>

          <div className="flex items-center gap-2">

            {
              !user ? <>
                <SignInModal triggerContent="Connect to your account !" />
                <SignUpModal triggerContent="Create an account and Play !" />
              </> : <Button asChild>
                <Link href="/dashboard">{"You're already logged ! Go to dashboard"}</Link>
              </Button>
            }

          </div>

        </div>

        <div className='aspect-16/10 w-full lg:w-[65dvw] relative'>
          <Image fill src='/images/landing-screenshot.png' alt='battle-screenshot' />
        </div>

      </section>

    </>

  );
}         
