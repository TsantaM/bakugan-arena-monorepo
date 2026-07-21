'use client'

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cleanupStaleRooms } from "@/src/actions/admin/cleanup-stale-rooms"
import { getStaleRoomsCount } from "@/src/actions/admin/get-stale-rooms-count"
import { resetLadder } from "@/src/actions/admin/reset-ladder"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Brain, Loader2, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Section from "@/components/ui/section"

export default function AdminPanel() {
    const queryClient = useQueryClient()

    const staleRoomsQuery = useQuery({
        queryKey: ['admin', 'stale-rooms-count'],
        queryFn: getStaleRoomsCount,
    })

    const resetLadderMutation = useMutation({
        mutationKey: ['admin', 'reset-ladder'],
        mutationFn: resetLadder,
        onSuccess: ({ resetCount }) => {
            toast.success(`Ladder reset for ${resetCount} player(s)`)
            queryClient.invalidateQueries({ queryKey: ['ladder'] })
        },
        onError: () => toast.error('Failed to reset ladder'),
    })

    const cleanupRoomsMutation = useMutation({
        mutationKey: ['admin', 'cleanup-stale-rooms'],
        mutationFn: cleanupStaleRooms,
        onSuccess: ({ deletedCount }) => {
            toast.success(`${deletedCount} stale room(s) deleted`)
            queryClient.invalidateQueries({ queryKey: ['admin', 'stale-rooms-count'] })
        },
        onError: () => toast.error('Failed to cleanup stale rooms'),
    })

    const confirmAndRun = (message: string, fn: () => void) => {
        if (window.confirm(message)) fn()
    }

    return (
        <>
            <Section className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Bot training</CardTitle>
                        <CardDescription>
                            Curate replays, train scoring weights, and deploy them to live bots.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/dashboard/admin/bot-training">
                                <Brain />
                                Open training
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reset ladder</CardTitle>
                        <CardDescription>
                            Resets all players&apos; ELO to 1000.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                >
                                    {resetLadderMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <RotateCcw />
                                    )}
                                    Reset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will reset all players&apos; ELO to 1000.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={resetLadderMutation.isPending}
                                            onClick={() => resetLadderMutation.mutate()}
                                        >
                                            Confirm Reset
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cleanup stale rooms</CardTitle>
                        <CardDescription>
                            Deletes unfinished rooms older than 30 minutes.
                            {staleRoomsQuery.data !== undefined && (
                                <> ({staleRoomsQuery.data.count} room(s) affected)</>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                >
                                    {cleanupRoomsMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <Trash2 />
                                    )}
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will delete all stale rooms.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={cleanupRoomsMutation.isPending}
                                            onClick={() => cleanupRoomsMutation.mutate()}
                                        >
                                            Confirm Delete
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </Section>
        </>

    )
}
