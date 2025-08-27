import EditAccount from "@/components/elements/edit-account/edit-account";
import EditPassword from "@/components/elements/edit-account/edit-password";
import Section from "@/components/ui/section";
import { getUser } from "@/src/actions/getUserSession";
import { unauthorized } from "next/navigation";

export default async function EditAccountPage() {

    const user = await getUser()

    if (!user) {
        unauthorized()
    }


    return (
        <Section className="flex flex-col gap-3 md:grid md:grid-cols-2">
            <EditAccount username={user?.username ? user?.username : ''} displayUsername={user?.displayUsername ? user?.displayUsername : ''} imgUrl={user?.image} />
            <EditPassword />
        </Section>
    )
}