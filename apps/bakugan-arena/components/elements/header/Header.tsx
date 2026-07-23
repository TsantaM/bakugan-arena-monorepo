import { getUser } from "@/src/actions/getUserSession"
import { getTranslations } from "next-intl/server"
import HeaderClient from "./HeaderClient"

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
        <HeaderClient
            user={user ? { name: user.name, image: user.image } : null}
            links={links}
            accountLabel={tCommon('nav.account')}
            logOutLabel={tCommon('nav.logOut')}
        />
    )
}
