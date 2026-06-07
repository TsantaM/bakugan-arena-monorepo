
import fs from 'fs/promises'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function TutorialPage() {
    const filePath = path.join(process.cwd(), 'app/dashboard/tutorial/tutorial.md')

    const markdown = await fs.readFile(filePath, 'utf8')

    return (
        <div className="min-h-screen bg-background">
            <div className="container w-full">
                <Card className="border-border/50 shadow-xl">
                    <CardContent className="">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-center text-5xl font-extrabold tracking-tight">
                                        {children}
                                    </h1>
                                ),

                                h2: ({ children }) => (
                                    <>
                                        <Separator className="my-8" />
                                        <h2 className="text-3xl font-bold text-primary">
                                            {children}
                                        </h2>
                                    </>
                                ),

                                h3: ({ children }) => (
                                    <h3 className="text-xl font-semibold">
                                        {children}
                                    </h3>
                                ),

                                p: ({ children }) => (
                                    <p className="leading-8 text-muted-foreground">
                                        {children}
                                    </p>
                                ),

                                ul: ({ children }) => (
                                    <ul className="ml-6 list-disc space-y-2">
                                        {children}
                                    </ul>
                                ),

                                li: ({ children }) => (
                                    <li className="leading-7">
                                        {children}
                                    </li>
                                ),

                                strong: ({ children }) => (
                                    <strong className="font-bold text-foreground">
                                        {children}
                                    </strong>
                                ),

                                hr: () => (
                                    <Separator className="my-10" />
                                ),

                                blockquote: ({ children }) => (
                                    <blockquote className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
                                        {children}
                                    </blockquote>
                                ),
                            }}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

}