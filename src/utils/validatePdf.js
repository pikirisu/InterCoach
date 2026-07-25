import { open } from "fs/promises";

export const validatePdf = async (filePath) => {
  const file = await open(filePath, "r");

  try {
    const buffer = Buffer.alloc(5);

    await file.read(buffer, 0, 5, 0);

    return buffer.toString() === "%PDF-";
  } finally {
    await file.close();
  }
};
