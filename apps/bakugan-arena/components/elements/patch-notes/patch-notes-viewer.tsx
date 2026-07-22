'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

type PatchNoteItem = {
    title: string
    body: string
}

type PatchRelease = {
    id: string
    date: string
    title: string
    items: PatchNoteItem[]
}

export default function PatchNotesViewer() {
    const t = useTranslations('patchNotes')
    const releases = t.raw('releases') as PatchRelease[]

    const [selectedId, setSelectedId] = useState(releases[0]?.id ?? '')

    const selectedRelease = useMemo(
        () => releases.find((release) => release.id === selectedId) ?? releases[0],
        [releases, selectedId],
    )

    if (!selectedRelease) {
        return null
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label htmlFor="patch-notes-select" className="text-sm text-muted-foreground">
                    {t('selectLabel')}
                </label>
                <Select value={selectedRelease.id} onValueChange={setSelectedId}>
                    <SelectTrigger id="patch-notes-select" className="w-full max-w-xl">
                        <SelectValue placeholder={t('selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {releases.map((release) => (
                            <SelectItem key={release.id} value={release.id}>
                                {release.date} — {release.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="font-semibold">
                    {selectedRelease.date} — {selectedRelease.title}
                </h2>
                <ul className="flex flex-col gap-2">
                    {selectedRelease.items.map((item) => (
                        <li key={`${selectedRelease.id}-${item.title}`} className="lg:w-[70%]">
                            <span className="font-bold text-red-600">{item.title} :</span>{' '}
                            {item.body}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
