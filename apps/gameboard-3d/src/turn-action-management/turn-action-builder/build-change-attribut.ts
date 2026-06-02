import type { ActionType, attribut } from "@bakugan-arena/game-data";

function BuildAttributButton( {attribut, selectAttribut} : {attribut: attribut, selectAttribut: HTMLDivElement}) {

    const attributImage = document.createElement("img");
    attributImage.classList.add("attribut-image")
    attributImage.src = `images/attributs/${attribut.toUpperCase()}.png`
    attributImage.alt = attribut
    attributImage.setAttribute("data-attribut", attribut)
    selectAttribut.appendChild(attributImage)

}

export function BuildChangeAttribut({action, turnActionContainer} : {action: ActionType, turnActionContainer: HTMLDivElement}) {

    if (action.type !== "CHANGE_ATTRIBUTE") return
    const attributsList: attribut[] = ["Aquos", "Darkus", "Haos", "Pyrus", "Subterra", "Ventus"] 
    const attributs: attribut[] = action.data.map((a) => a.attributs).flat()
    const filteredAttributs: attribut[] = attributsList.filter((a) => attributs.includes(a))

    if(filteredAttributs.length === 0) return

    const selectAttribut = document.createElement("div")
    selectAttribut.classList.add("select-attribut")
    turnActionContainer.appendChild(selectAttribut)

    filteredAttributs.forEach((a) => BuildAttributButton({attribut: a, selectAttribut}))
    
}