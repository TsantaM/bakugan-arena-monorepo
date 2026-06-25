'use client'

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cleanupStaleRooms } from "@/src/actions/admin/cleanup-stale-rooms"
import { getStaleRoomsCount } from "@/src/actions/admin/get-stale-rooms-count"
import { resetLadder } from "@/src/actions/admin/reset-ladder"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Reset ladder</CardTitle>
                    <CardDescription>
                        Resets all players&apos; ELO to 1000.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button
                        variant="destructive"
                        disabled={resetLadderMutation.isPending}
                        onClick={() =>
                            confirmAndRun(
                                'Confirm ladder reset for all players?',
                                () => resetLadderMutation.mutate()
                            )
                        }
                    >
                        {resetLadderMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <RotateCcw />
                        )}
                        Reset
                    </Button>
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
                    <Button
                        variant="destructive"
                        disabled={cleanupRoomsMutation.isPending || staleRoomsQuery.isLoading}
                        onClick={() =>
                            confirmAndRun(
                                'Confirm deletion of stale rooms?',
                                () => cleanupRoomsMutation.mutate()
                            )
                        }
                    >
                        {cleanupRoomsMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Trash2 />
                        )}
                        Delete
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
