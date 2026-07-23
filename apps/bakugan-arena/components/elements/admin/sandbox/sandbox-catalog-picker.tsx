"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type CatalogOption = {
    value: string
    label: string
    hint?: string
}

type SandboxCatalogPickerProps = {
    value: string | null
    onChange: (value: string | null) => void
    options: CatalogOption[]
    placeholder: string
    searchPlaceholder: string
    emptyLabel: string
    clearLabel?: string
    allowClear?: boolean
    className?: string
}

export default function SandboxCatalogPicker({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyLabel,
    clearLabel = "—",
    allowClear = true,
    className,
}: SandboxCatalogPickerProps) {
    const [open, setOpen] = useState(false)
    const selected = options.find((option) => option.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                >
                    <span className="truncate">
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyLabel}</CommandEmpty>
                        <CommandGroup>
                            {allowClear && (
                                <CommandItem
                                    value="__clear__"
                                    onSelect={() => {
                                        onChange(null)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 size-4",
                                            value ? "opacity-0" : "opacity-100",
                                        )}
                                    />
                                    {clearLabel}
                                </CommandItem>
                            )}
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.value} ${option.hint ?? ""}`}
                                    onSelect={() => {
                                        onChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 size-4",
                                            value === option.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                    <span className="truncate">{option.label}</span>
                                    {option.hint ? (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {option.hint}
                                        </span>
                                    ) : null}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
