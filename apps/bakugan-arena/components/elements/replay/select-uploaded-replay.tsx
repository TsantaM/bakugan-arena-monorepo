'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { replayDataType } from '@bakugan-arena/game-data'
import { useQuery } from '@tanstack/react-query'

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

export default function SelectUploadedReplay({
    setReplay,
}: {
    setReplay: (replay: replayDataType) => void
}) {
    const [open, setOpen] = useState(false)
    const [selectedReplayId, setSelectedReplayId] = useState('')

    const getReplaysFunction = async () => {
        const replays = await GetReplays()
        return replays
    }

    const replaysQuery = useQuery({
        queryKey: ['get-replays'],
        queryFn: getReplaysFunction,
    })

    const replays = replaysQuery.data ?? []

    const selectedReplay = replays.find(
        (replay) => replay.roomId === selectedReplayId
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-75 justify-between"
                >
                    {selectedReplay
                        ? `${selectedReplay.replayData.player1?.displayUsername} VS ${selectedReplay.replayData.player2?.displayUsername}`
                        : 'Select a replay'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-75 p-0">
                <Command>
                    <CommandInput placeholder="Search replay..." />

                    <CommandList>
                        <CommandEmpty>
                            No replay found.
                        </CommandEmpty>

                        <CommandGroup>
                            {replays.map((replay) => (
                                <CommandItem
                                    key={replay.roomId}
                                    value={`${replay.replayData.player1?.displayUsername} ${replay.replayData.player2?.displayUsername}`}
                                    onSelect={() => {
                                        setSelectedReplayId(replay.roomId)
                                        setReplay(replay.replayData)
                                        setOpen(false)
                                        setSelectedReplayId('')
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedReplayId === replay.roomId
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />

                                    {`${replay.replayData.player1?.displayUsername} VS ${replay.replayData.player2?.displayUsername}`}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}