'use client'

import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
import { FindUser } from "@/src/actions/get-users-data";
import { useChatStore } from "@/src/store/chat-window-store";
import { ConnectedUsersStore } from "@/src/store/connected-users-store";
import { Avatar } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
// import { Check, ChevronsUpDown } from "lucide-react";
// import Link from "next/link";
import { useState } from "react";

export default function FindUserComponent() {
    const [displayUserName, setDisplayUserName] = useState('')
    // const [open, setOpen] = useState(false)
    const [open, setOpen] = useState(false)

    const findUserClientSide = async () => {
        return await FindUser({ displayUserName })
    }

    const findUser = useQuery({
        queryKey: ['find-user-deck', displayUserName],
        queryFn: findUserClientSide
    })

    const addChat = useChatStore((state) => state.upsertChat)
    const setFocused =  useChatStore((state) => state.setFocused)
    const connectedUsers = ConnectedUsersStore((state) => state.users)



    const users = findUser?.data?.map((d) => d)

    return (<>

        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                setDisplayUserName('')
            }
        }}>
            <DialogTrigger asChild>
                <Button className="w-full">Find user</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    Find user
                </DialogTitle>

                <Input
                    placeholder="Username"
                    onChange={(e) => setDisplayUserName(e.target.value)}
                    value={displayUserName}
                />

                <ScrollArea className="min-h-14 max-h-60">
                    {users && users.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='font-extrabold'>User</TableHead>
                                    <TableHead className="text-right">#</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.map((u, index: number) => (
                                    <TableRow key={index}>
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

                                                <span className="text-sm">
                                                    {u.displayUsername}
                                                </span>
                                                <span
                                                    className={`h-2.5 w-2.5 rounded-full border-2 border-white ${connectedUsers.includes(u.id)
                                                        ? "bg-green-500"
                                                        : "bg-gray-400"
                                                        }`} ></span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                disabled={connectedUsers.includes(u.id) ? false : true}
                                                size="sm"
                                                onClick={() => {
                                                    addChat({
                                                        targetId: u.id,
                                                        targetName: u.displayUsername || 'Unknown Player'
                                                    })
                                                    setFocused(u.id)
                                                    setOpen(false)
                                                }}
                                            >
                                                {connectedUsers.includes(u.id) ? `Open Chat` : 'Offline'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        displayUserName && (
                            <p className="text-sm text-neutral-500 text-center py-4">
                                No user found with this username
                            </p>
                        )
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>


    </>)


}