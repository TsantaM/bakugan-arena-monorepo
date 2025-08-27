import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react"

type SectionProps = PropsWithChildren & {
    className?: string
}

export default function Section({children, className, ...props} : SectionProps) {
    return (
        <section className={cn("px-5 md:px-10 py-3", className)} {...props}>
            {children}
        </section>
    )
}