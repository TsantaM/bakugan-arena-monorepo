import Image from "next/image";

export default function Logo({ width, height }: { width: number, height: number }) {
    return (
        <Image
            src='/logo.png'
            alt='Bakugan Arena'
            width={width}
            height={height}
            priority
            sizes={`${width}px`}
        />
    )
}
