// 'use client'

// import z from "zod";


// const MAX_FILE_SIZE = 5000000; // 5MB
// const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// const fileSchema = z
//     .instanceof(FileList)
//     .refine(
//         (files) => files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
//         `Max file size is 5MB.`
//     )
//     .refine(
//         (files) =>
//             files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
//         "Only .jpg, .jpeg, .png and .webp formats are supported."
//     )
//     .optional();

// export const EditAccountSchema = z.object({
//     name: z.string().optional(),
//     image: fileSchema
// })



'use client'

import z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// On choisit un type safe selon l'environnement
const fileListType =
  typeof window === "undefined" || typeof FileList === "undefined"
    ? z.any()
    : z.instanceof(FileList);

const fileSchema = fileListType
  .refine(
    (files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (files) =>
      !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  )
  .optional();

export const EditAccountSchema = z.object({
  username: z.string().optional(),
  displayName: z.string(),
  image: fileSchema
});
