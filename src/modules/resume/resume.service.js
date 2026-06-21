import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";

export const extractResumeText = async (filePath) => {
  const fileBuffer = await readFile(filePath);
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return result.text?.trim() || "";
  } finally {
    await parser.destroy();
  }
};
