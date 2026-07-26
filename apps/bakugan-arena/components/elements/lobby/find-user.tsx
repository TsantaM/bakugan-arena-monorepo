'use client'

import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FindUser } from "@/src/actions/get-users-data";
import { useChatStore } from "@/src/store/chat-window-store";
import { ConnectedUsersStore } from "@/src/store/connected-users-store";
import { Avatar } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function FindUserComponent() {
    const t = useTranslations('lobby.findUser')
    const tCommon = useTranslations('common')
    const [displayUserName, setDisplayUserName] = useState('')
    const [open, setOpen] = useState(false)
    const debouncedName = useDebouncedValue(displayUserName.trim(), 300)

    const findUser = useQuery({
        queryKey: ['find-user', debouncedName],
        queryFn: () => FindUser({ displayUserName: debouncedName }),
        enabled: open && debouncedName.length >= 2,
    })

    const addChat = useChatStore((state) => state.upsertChat)
    const setFocused = useChatStore((state) => state.setFocused)
    const connectedUsers = ConnectedUsersStore((state) => state.users)

    const users = findUser.data ?? []

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                setDisplayUserName('')
            }
        }}>
            <DialogTrigger asChild>
                <Button className="h-auto w-full whitespace-normal">{t('trigger')}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {t('title')}
                </DialogTitle>

                <Input
                    placeholder={t('placeholder')}
                    onChange={(e) => setDisplayUserName(e.target.value)}
                    value={displayUserName}
                />

                <ScrollArea className="min-h-14 max-h-60">
                    {findUser.isFetching ? (
                        <div className="flex flex-col gap-2 py-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : users.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='font-extrabold'>{t('tableUser')}</TableHead>
                                    <TableHead className="text-right">#</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={u.image || "/images/default-profil-picture.png"}
                                                        className="rounded-full"
                                                    />
                                                    <AvatarFallback>
                                                        {u.displayUsername?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <span className="min-w-0 truncate text-sm">
                                                    {u.displayUsername}
                                                </span>
                                                <span
                                                    className={`h-2.5 w-2.5 rounded-full border-2 border-white ${connectedUsers.includes(u.id)
                                                        ? "bg-green-500"
                                                        : "bg-gray-400"
                                                        }`} >
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                disabled={connectedUsers.includes(u.id) ? false : true}
                                                size="sm"
                                                className="h-auto max-w-[8rem] whitespace-normal"
                                                onClick={() => {
                                                    addChat({
                                                        targetId: u.id,
                                                        targetName: u.displayUsername || tCommon('fallback.unknownPlayer')
                                                    })
                                                    setFocused(u.id)
                                                    setOpen(false)
                                                }}
                                            >
                                                {connectedUsers.includes(u.id) ? t('openChat') : tCommon('status.offline')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        debouncedName.length >= 2 && (
                            <p className="text-sm text-neutral-500 text-center py-4">
                                {t('empty')}
                            </p>
                        )
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
