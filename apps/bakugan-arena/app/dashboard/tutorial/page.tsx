import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function TutorialPage() {
    const t = await getTranslations('tutorial')

    return (
        <div className="min-h-screen bg-background">
            <div className="container w-full">
                <Card className="border-border/50 shadow-xl">
                    <CardContent className="space-y-4 py-6">
                        <h1 className="text-center text-5xl font-extrabold tracking-tight">
                            {t('title')}
                        </h1>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('overview.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('overview.body')}</p>
                        <p className="leading-8 text-muted-foreground">
                            <strong className="font-bold text-foreground">{t('overview.objective')}</strong>
                        </p>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('coreRules.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('coreRules.intro')}</p>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7"><strong className="font-bold text-foreground">{t('coreRules.bakugans')}</strong></li>
                            <li className="leading-7"><strong className="font-bold text-foreground">{t('coreRules.abilityCards')}</strong></li>
                            <li className="leading-7"><strong className="font-bold text-foreground">{t('coreRules.gateCards')}</strong></li>
                        </ul>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('victory.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('victory.intro')}</p>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('victory.eliminate')}</li>
                            <li className="leading-7">{t('victory.timer')}</li>
                        </ul>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('draw.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('draw.intro')}</p>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('draw.noGates')}</li>
                            <li className="leading-7">{t('draw.mutualElimination')}</li>
                            <li className="leading-7">{t('draw.timerTurn0')}</li>
                        </ul>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('battle.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('battle.intro')}</p>
                        <p className="leading-8 text-muted-foreground">{t('battle.duration')}</p>
                        <h3 className="text-xl font-semibold">{t('battle.turn1Title')}</h3>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('battle.turn1First')}</li>
                            <li className="leading-7">{t('battle.turn1May')}
                                <ul className="ml-6 list-disc space-y-2">
                                    <li className="leading-7">{t('battle.turn1Ability')}</li>
                                    <li className="leading-7">{t('battle.turn1Gate')}</li>
                                </ul>
                            </li>
                        </ul>
                        <h3 className="text-xl font-semibold">{t('battle.turn2Title')}</h3>
                        <p className="leading-8 text-muted-foreground">{t('battle.turn2Body')}</p>
                        <h3 className="text-xl font-semibold">{t('battle.endTitle')}</h3>
                        <p className="leading-8 text-muted-foreground">{t('battle.endIntro')}</p>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('battle.endGate')}</li>
                            <li className="leading-7"><strong className="font-bold text-foreground">{t('battle.endEliminate')}</strong></li>
                        </ul>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('abilities.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('abilities.filter')}</p>
                        <p className="leading-8 text-muted-foreground">{t('abilities.unused')}</p>
                        <h3 className="text-xl font-semibold">{t('abilities.examplesTitle')}</h3>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('abilities.airBattle')}</li>
                            <li className="leading-7">{t('abilities.marionette')}</li>
                        </ul>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('neutral.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('neutral.intro')}</p>
                        <h3 className="text-xl font-semibold">{t('neutral.actionsTitle')}</h3>
                        <h3 className="text-xl font-semibold">{t('neutral.placeGateTitle')}</h3>
                        <p className="leading-8 text-muted-foreground">{t('neutral.placeGateBody')}</p>
                        <h3 className="text-xl font-semibold">{t('neutral.deployTitle')}</h3>
                        <p className="leading-8 text-muted-foreground">{t('neutral.deployBody')}</p>
                        <h3 className="text-xl font-semibold">{t('neutral.abilityTitle')}</h3>
                        <p className="leading-8 text-muted-foreground">{t('neutral.abilityBody')}</p>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('strategic.title')}</h2>
                        <p className="leading-8 text-muted-foreground">{t('strategic.intro')}</p>
                        <ul className="ml-6 list-disc space-y-2">
                            <li className="leading-7">{t('strategic.gate')}</li>
                            <li className="leading-7">{t('strategic.abilities')}</li>
                            <li className="leading-7">{t('strategic.overextend')}</li>
                        </ul>
                        <p className="leading-8 text-muted-foreground">{t('strategic.outro')}</p>

                        <Separator className="my-8" />
                        <h2 className="text-3xl font-bold text-primary">{t('help.title')}</h2>
                        <p className="leading-8 text-muted-foreground">
                            {t('help.discord')}{' '}
                            <Link
                                href="https://discord.gg/8HfPK5RVuk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                            >
                                <Badge variant="secondary" className="cursor-pointer text-sm px-3 py-1">
                                    Discord
                                </Badge>
                            </Link>
                        </p>
                        <p className="leading-8 text-muted-foreground">{t('help.refresh')}</p>
                        <p className="leading-8 text-muted-foreground">{t('help.report')}</p>
                        <p className="leading-8 text-muted-foreground">{t('help.thanks')}</p>
                        <p className="leading-8">
                            <strong className="font-bold text-foreground">{t('help.outro')}</strong>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
