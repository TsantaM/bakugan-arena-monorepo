import { slots_id } from "../type/type-index.js"

export type slot_limits = {
    slot: slots_id,
    slot_limit: slots_id[]
}[]

export const slots_limits: slot_limits = [
    {
        slot: 'slot-1',
        slot_limit: ["slot-2", "slot-4", "slot-5"]
    },
    {
        slot: 'slot-2',
        slot_limit: ["slot-1", "slot-3", "slot-4", "slot-5", "slot-6"]
    },
    {
        slot: "slot-3",
        slot_limit: ['slot-2', "slot-5", "slot-6"]
    },
    {
        slot: 'slot-4',
        slot_limit: ["slot-1", "slot-2", "slot-5"]
    },
    {
        slot: 'slot-5',
        slot_limit: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-6"]
    },
    {
        slot: 'slot-6',
        slot_limit: ['slot-2', "slot-3", "slot-5"]
    }
] 