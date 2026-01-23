import type { bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data"

export function GetSpritePosition({ slotIndex, bakugan, userId, slot }: { slotIndex: number, bakugan: bakuganOnSlot, userId: string, slot: portalSlotsTypeElement }) {

    const isAlly = bakugan.userId === userId ? true : false
    const BakugansOnSlot = slot.bakugans.filter(b => b.userId === bakugan.userId)
    const bakuganIndex = BakugansOnSlot.findIndex(b => b.key === bakugan.key && b.userId === bakugan.userId)

    if(bakuganIndex === -1) return

    const oneBakugans = BakugansOnSlot.length === 1 ? true : false
    const twoBakugans = BakugansOnSlot.length === 2 ? true : false
    const threeBakugans = BakugansOnSlot.length === 3 ? true : false

    const first = bakuganIndex === 0 ? true : false
    const second = bakuganIndex === 1 ? true : false



    const lineX: (slot : number) => number | undefined = (slot) => {
        switch (slot + 1) {
            case 1:
                if (oneBakugans) {
                    return 10
                } else if (twoBakugans) {
                    if (first) {
                        return 11
                    } else {
                        return 9
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 10
                    } else if (second) {
                        return 9
                    } else {
                        return 11
                    }
                }
                break;

            case 2:
                if (oneBakugans) {
                    return 6
                } else if (twoBakugans) {
                    if (first) {
                        return 7
                    } else {
                        return 5
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 6
                    } else if (second) {
                        return 5
                    } else {
                        return 7
                    }
                }
                break;

            case 3:
                if (oneBakugans) {
                    return 2
                } else if (twoBakugans) {
                    if (first) {
                        return 3
                    } else {
                        return 1
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 3
                    } else if (second) {
                        return 1
                    } else {
                        return 3
                    }
                }
                break;

            case 4:
                if (oneBakugans) {
                    return 10
                } else if (twoBakugans) {
                    if (first) {
                        return 11
                    } else {
                        return 9
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 10
                    } else if (second) {
                        return 9
                    } else {
                        return 11
                    }
                }
                break;

            case 5:
                if (oneBakugans) {
                    return 6
                } else if (twoBakugans) {
                    if (first) {
                        return 7
                    } else {
                        return 5
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 6
                    } else if (second) {
                        return 5
                    } else {
                        return 7
                    }
                }
                break;

            case 6:
                if (oneBakugans) {
                    return 2
                } else if (twoBakugans) {
                    if (first) {
                        return 3
                    } else {
                        return 1
                    }
                } else if (threeBakugans) {
                    if (first) {
                        return 3
                    } else if (second) {
                        return 1
                    } else {
                        return 3
                    }
                }
                break;
        }
    }
    const xPos = lineX(slotIndex)

    const lineZ: (slot: number) => number | undefined = (slot) => {
        switch (slot + 1) {
            case 1:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 7
                    } else if (threeBakugans) {
                        if (first) {
                            return 7
                        } else {
                            return 8
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 11
                    } else if (threeBakugans) {
                        if (first) {
                            return 11
                        } else {
                            return 10
                        }
                    }
                }
                break;
            case 2:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 7
                    } else if (threeBakugans) {
                        if (first) {
                            return 7
                        } else {
                            return 8
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 11
                    } else if (threeBakugans) {
                        if (first) {
                            return 11
                        } else {
                            return 10
                        }
                    }
                }
                break;
            case 3:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 7
                    } else if (threeBakugans) {
                        if (first) {
                            return 7
                        } else {
                            return 8
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 11
                    } else if (threeBakugans) {
                        if (first) {
                            return 11
                        } else {
                            return 10
                        }
                    }
                }
                break;
            case 4:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 1
                    } else if (threeBakugans) {
                        if (first) {
                            return 1
                        } else {
                            return 2
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 5
                    } else if (threeBakugans) {
                        if (first) {
                            return 5
                        } else {
                            return 4
                        }
                    }
                }
                break;
            case 5:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 1
                    } else if (threeBakugans) {
                        if (first) {
                            return 1
                        } else {
                            return 2
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 5
                    } else if (threeBakugans) {
                        if (first) {
                            return 5
                        } else {
                            return 4
                        }
                    }
                }
                break;
            case 6:
                if (isAlly) {
                    if (oneBakugans || twoBakugans) {
                        return 1
                    } else if (threeBakugans) {
                        if (first) {
                            return 1
                        } else {
                            return 2
                        }
                    }
                } else {
                    if (oneBakugans || twoBakugans) {
                        return 5
                    } else if (threeBakugans) {
                        if (first) {
                            return 5
                        } else {
                            return 4
                        }
                    }
                }
                break;
        }
    }
    const zPos = lineZ(slotIndex)

    if(!xPos) return
    if(!zPos) return

        const cellSize = 6 / 6
        const start = 12 / 2
        const x = start + -xPos * cellSize
        const z = start + -zPos * cellSize
        return {x, z}

}
