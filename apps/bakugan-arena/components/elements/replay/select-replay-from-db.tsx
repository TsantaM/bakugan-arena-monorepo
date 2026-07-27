'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

import { GetReplays } from '@/src/actions/replay/get-replays'
import { loadReplaySelectionFromId } from '@/src/lib/replay/replay-api-client'
import type { ReplaySelection } from '@/src/lib/replay/replay-selection'
import { toast } from 'sonner'

export default function SelectReplayFromDb({
    setReplay,
}: {
    setReplay: (replay: ReplaySelection) => void
}) {
    const t = useTranslations('replay')
    const [open, setOpen] = useState(false)
    const [selectedReplayId, setSelectedReplayId] = useState('')
    const [isLoadingReplay, setIsLoadingReplay] = useState(false)

    const replaysQuery = useQuery({
        queryKey: ['get-replay-list'],
        queryFn: () => GetReplays(),
    })

    const replays = replaysQuery.data ?? []

    const selectedReplay = replays.find(
        (replay) => replay.id === selectedReplayId
    )

    async function handleSelect(replayId: string) {
        setIsLoadingReplay(true)
        setSelectedReplayId(replayId)
        setOpen(false)

        try {
            const selection = await loadReplaySelectionFromId(replayId)
            setReplay(selection)
        } catch (error) {
            toast.error(t('toasts.importFailed'))
            console.error(error)
        } finally {
            setIsLoadingReplay(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className='overflow-hidden'>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-64 justify-between"
                    disabled={isLoadingReplay || replaysQuery.isLoading}
                >
                    {isLoadingReplay ? (
                        <>
                            <Loader2 className="animate-spin" />
                            {t('select')}
                        </>
                    ) : (
                        <>
                            {selectedReplay?.title ?? t('select')}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0">
                <Command>
                    <CommandInput placeholder={t('search')} />

                    <CommandList>
                        <CommandEmpty>
                            {t('empty')}
                        </CommandEmpty>

                        <CommandGroup>
                            {replays.map((replay) => (
                                <CommandItem
                                    key={replay.id}
                                    value={replay.id}
                                    keywords={[replay.title]}
                                    onSelect={() => {
                                        void handleSelect(replay.id)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedReplayId === replay.id
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />

                                    {replay.title}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
