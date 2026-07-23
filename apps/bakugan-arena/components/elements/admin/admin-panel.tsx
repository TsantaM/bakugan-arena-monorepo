'use client'

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cleanupStaleRooms } from "@/src/actions/admin/cleanup-stale-rooms"
import { getStaleRoomsCount } from "@/src/actions/admin/get-stale-rooms-count"
import { resetLadder } from "@/src/actions/admin/reset-ladder"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Brain, FlaskConical, Loader2, RotateCcw, Trash2 } from "lucide-react"
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
import { useTranslations } from "next-intl"

export default function AdminPanel() {
    const t = useTranslations('admin')
    const tCommon = useTranslations('common')
    const queryClient = useQueryClient()

    const staleRoomsQuery = useQuery({
        queryKey: ['admin', 'stale-rooms-count'],
        queryFn: getStaleRoomsCount,
    })

    const resetLadderMutation = useMutation({
        mutationKey: ['admin', 'reset-ladder'],
        mutationFn: resetLadder,
        onSuccess: ({ resetCount }) => {
            toast.success(t('toasts.ladderReset', { n: resetCount }))
            queryClient.invalidateQueries({ queryKey: ['ladder'] })
        },
        onError: () => toast.error(t('toasts.ladderResetFailed')),
    })

    const cleanupRoomsMutation = useMutation({
        mutationKey: ['admin', 'cleanup-stale-rooms'],
        mutationFn: cleanupStaleRooms,
        onSuccess: ({ deletedCount }) => {
            toast.success(t('toasts.roomsDeleted', { n: deletedCount }))
            queryClient.invalidateQueries({ queryKey: ['admin', 'stale-rooms-count'] })
        },
        onError: () => toast.error(t('toasts.cleanupFailed')),
    })

    const confirmAndRun = (message: string, fn: () => void) => {
        if (window.confirm(message)) fn()
    }

    return (
        <>
            <Section className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('sandbox.cardTitle')}</CardTitle>
                        <CardDescription>
                            {t('sandbox.cardDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/dashboard/admin/sandbox">
                                <FlaskConical />
                                {t('sandbox.open')}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('botTraining.cardTitle')}</CardTitle>
                        <CardDescription>
                            {t('botTraining.cardDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/dashboard/admin/bot-training">
                                <Brain />
                                {t('botTraining.open')}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('resetLadder.title')}</CardTitle>
                        <CardDescription>
                            {t('resetLadder.desc')}
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
                                    {tCommon('actions.reset')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('resetLadder.confirmTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('resetLadder.confirmDesc')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={resetLadderMutation.isPending}
                                            onClick={() => resetLadderMutation.mutate()}
                                        >
                                            {t('resetLadder.confirm')}
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('cleanup.title')}</CardTitle>
                        <CardDescription>
                            {t('cleanup.desc')}
                            {staleRoomsQuery.data !== undefined && (
                                <> {t('cleanup.affected', { count: staleRoomsQuery.data.count })}</>
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
                                    {tCommon('actions.delete')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('resetLadder.confirmTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('cleanup.confirmDesc')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={cleanupRoomsMutation.isPending}
                                            onClick={() => cleanupRoomsMutation.mutate()}
                                        >
                                            {t('cleanup.confirm')}
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
