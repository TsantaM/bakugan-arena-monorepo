'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ConnectedUsersStore } from "@/src/store/connected-users-store";

import Image from "next/image"
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
                        const imageLink = player.image ?? "/images/default-profil-picture.png"
                        const alt = player.image
                            ? (player.displayUsername ?? tCommon('fallback.player'))
                            : tCommon('a11y.defaultProfilePicture')

                        return (
                            <TableRow key={index}>
                                <TableCell className="font-extrabold">{index + 1}</TableCell>

                                <TableCell>
                                    {imageLink && (
                                        <Image
                                            src={imageLink}
                                            alt={alt}
                                            width={50}
                                            height={50}
                                            className="rounded-full"
                                        />
                                    )}
                                </TableCell>

                                <TableCell className="font-extrabold">
                                    <span className="flex items-center gap-1">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full border-2 border-white ${connectedUsers.includes(player.id)
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`} >
                                        </span>
                                        {player.displayUsername ? player.displayUsername : tCommon('fallback.player')}
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
