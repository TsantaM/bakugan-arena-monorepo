'use client'

import { z } from "zod";

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function createEditAccountSchema(messages: {
  imageMaxSize: string;
  imageFormats: string;
}) {
  const fileSchema = z
    .custom<FileList>()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      messages.imageMaxSize
    )
    .refine(
      (files) =>
        !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      messages.imageFormats
    )
    .optional();

  return z.object({
    username: z.string().optional(),
    displayName: z.string(),
    image: fileSchema
  });
}

export type editAccount_type = z.infer<ReturnType<typeof createEditAccountSchema>>
