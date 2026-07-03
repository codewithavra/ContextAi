/**
 * Node Imports
 */

import mammoth from "mammoth";
import { extractText } from "unpdf";
import { readFile } from "node:fs/promises";

/**
 * Other Imports
 */
import type { ParsedText } from "../types";

export const fileParser = async (
  fileName: string,
  source: string,
  fileType: "pdf" | "txt" | "docx",
): Promise<ParsedText> => {
  let text = "";

  switch (fileType) {
    case "pdf": {
      const buffer = await readFile(source);
      const { text: extracted } = await extractText(new Uint8Array(buffer));
      text = extracted.join("\n\n");
      break;
    }
    case "txt": {
      text = await readFile(source, { encoding: "utf-8" });
      break;
    }
    case "docx": {
      const result = await mammoth.extractRawText({ path: source });
      text = result.value;
      break;
    }
    default: {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    text,
    metadata: {
      fileName,
      fileType,
      source,
      charCount: text.length,
    },
  };
};
