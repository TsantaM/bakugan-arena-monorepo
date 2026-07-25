'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConnectedUsersStore } from "@/src/store/connected-users-store"
import { useTranslations } from "next-intl"

export type LadderPlayer = {
    id: string;
    image: string | null;
    username: string | null;
    displayUsername: string | null;
    elo: number;
}

export default function LadderTable({ players }: { players: LadderPlayer[] }) {
    const t = useTranslations('ladder')
    const tCommon = useTranslations('common')
    const connectedUsers = ConnectedUsersStore((state) => state.users)

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('columns.rank')}</TableHead>
                        <TableHead>{t('columns.avatar')}</TableHead>
                        <TableHead>{t('columns.player')}</TableHead>
                        <TableHead className="text-right">{t('columns.elo')}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {players.map((player, index) => {
                        const displayName = player.displayUsername ?? tCommon('fallback.player')
                        const fallbackInitial = displayName[0]?.toUpperCase() ?? "?"

                        return (
                            <TableRow key={index}>
                                <TableCell className="font-extrabold">{index + 1}</TableCell>

                                <TableCell>
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src={player.image ?? "/images/default-profil-picture.png"}
                                            alt={player.image ? displayName : tCommon('a11y.defaultProfilePicture')}
                                        />
                                        <AvatarFallback>{fallbackInitial}</AvatarFallback>
                                    </Avatar>
                                </TableCell>

                                <TableCell className="font-extrabold">
                                    <span className="flex items-center gap-1">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full border-2 border-white ${connectedUsers.includes(player.id)
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`} >
                                        </span>
                                        {displayName}
                                    </span>
                                </TableCell>

                                <TableCell className="text-right font-extrabold">
                                    {player.elo}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
