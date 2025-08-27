import Image from "next/image";

export default function Logo({width, height} : {width: number, height: number}) {
    return (
        <Image src='/logo.svg' alt='' width={width} height={height}/>
    )
}