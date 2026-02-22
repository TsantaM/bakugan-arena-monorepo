import type { SelectableBakuganAction, slots_id } from "@bakugan-arena/game-data";

export function SelectBakugan({ data, selectBakugan, userId, bakuganToSelect, bakugan }: {
    data: SelectableBakuganAction,
    selectBakugan: {
        type: "SET_BAKUGAN";
        data: {
            key: string;
            userId: string;
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    bakuganToSelect: NodeListOf<Element>,
    bakugan: Element,
    slots: slots_id[]
}) {

    if (selectBakugan.data && selectBakugan.data.key === data.key) {
        selectBakugan.data = undefined
        bakuganToSelect.forEach((c) => {
            c.classList.remove('selected-bakugan')
        })
    } else {
        selectBakugan.data = undefined
        selectBakugan.data = {
            key: data.key,
            slot: '',
            userId: userId
        }

        bakugan.classList.add('selected-bakugan')
        bakuganToSelect.forEach((c) => {
            if (c === bakugan) return
            if (c.classList.contains('selected-bakugan')) {
                c.classList.remove('selected-bakugan')
            }
        })
    }

}