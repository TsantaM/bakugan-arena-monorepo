import z from "zod";

export const attributSchema = z.enum([
    "Pyrus",
    "Ventus",
    "Aquos",
    "Subterra",
    "Haos",
    "Darkus"
] as const);


export const niveauDePuissanceSchema = z.enum([
    '220',
    '230',
    '240',
    '250',
    '260',
    '270',
    '280',
    '290',
    '300',
    '310',
    '320',
    '330',
    '340',
    '350',
    '360',
    '370',
    '380',
    '390',
    '400',
    '410',
    '420',
    '430',
    '440'
] as const)