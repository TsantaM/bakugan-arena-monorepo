import Header from "@/components/elements/header/Header";
import { SignInModal } from "@/components/elements/sign-in/Sign-in";
import { SignUpModal } from "@/components/elements/sign-up/Sign-up";
import { Button } from "@/components/ui/button";
import { getUser } from "@/src/actions/getUserSession";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser()
  const t = await getTranslations('landing')
  const tCommon = await getTranslations('common')

  if (user) {
    redirect("/dashboard")
  }

  return (
    <>
      <Header />

      <section className="flex-1 min-h-0 w-full flex flex-col lg:flex-row items-center md:items-start justify-center lg:items-center px-10 py-5 gap-5 bg-background">

        <div className="w-[95%] lg:w-full flex flex-col items-center md:items-start gap-5">
          <div>
            <h1 className="lg:max-w-[65%] text-5xl font-bold text-center md:text-start text-red-500">{t('title')}</h1>
            <p className="text-neutral-500 text-sm text-center md:text-start">{t('tagline')}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="https://discord.gg/8HfPK5RVuk" target="_blank">
              <img src="/discord.svg" alt={tCommon('a11y.discordLogo')} className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <p className='w-full md:max-w-[50%] text-center md:text-start'>{t('welcome')}</p>
            <p className='md:max-w-[50%] text-center md:text-start'>{t('ctaBody')}</p>
          </div>

          <div className="w-full flex flex-col lg:flex-row items-center gap-2">

            {
              !user ? <>
                <SignInModal triggerContent={t('cta.signIn')} />
                <SignUpModal triggerContent={t('cta.signUp')} />
              </> : <Button asChild>
                <Link href="/dashboard">{t('cta.alreadyLogged')}</Link>
              </Button>
            }

          </div>

        </div>

        <div className='aspect-16/10 w-full lg:w-[65dvw] relative'>
          <Image fill src='/images/landing-screenshot.png' alt={tCommon('a11y.battleScreenshot')} />
        </div>

      </section>

      <section className="flex-1 min-h-0 w-full flex flex-col lg:flex-row items-center md:items-start justify-center lg:items-center px-10 py-5 gap-5 bg-background">

      </section>

    </>

  );

}
