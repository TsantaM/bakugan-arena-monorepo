'use client'

import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { BookOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

type GameLogsDocumentationSheetProps = {
    documentation: string
}

const markdownComponents = {
    h1: ({ children }: { children?: ReactNode }) => (
        <h1 className="mt-6 mb-3 text-xl font-bold first:mt-0">{children}</h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
        <h2 className="mt-5 mb-2 text-lg font-semibold">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
        <h3 className="mt-4 mb-2 text-base font-semibold">{children}</h3>
    ),
    p: ({ children }: { children?: ReactNode }) => (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{children}</ol>
    ),
    li: ({ children }: { children?: ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
    ),
    code: ({ children, className }: { children?: ReactNode; className?: string }) => {
        const isBlock = className?.includes("language-")
        if (isBlock) {
            return (
                <code className="block overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                    {children}
                </code>
            )
        }
        return (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
        )
    },
    pre: ({ children }: { children?: ReactNode }) => (
        <pre className="mb-3 overflow-x-auto">{children}</pre>
    ),
    table: ({ children }: { children?: ReactNode }) => (
        <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }: { children?: ReactNode }) => (
        <thead className="border-b bg-muted/50">{children}</thead>
    ),
    th: ({ children }: { children?: ReactNode }) => (
        <th className="px-3 py-2 text-left font-medium">{children}</th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
        <td className="border-t px-3 py-2 text-muted-foreground">{children}</td>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
    ),
    hr: () => <hr className="my-4 border-border" />,
}

export default function GameLogsDocumentationSheet({
    documentation,
}: GameLogsDocumentationSheetProps) {
    const t = useTranslations('admin.gameLogs')

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <BookOpen />
                    {t('documentation.open')}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle>{t('documentation.title')}</SheetTitle>
                    <SheetDescription>{t('documentation.desc')}</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {documentation}
                    </ReactMarkdown>
                </div>
            </SheetContent>
        </Sheet>
    )
}
