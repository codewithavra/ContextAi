import { Worker, type Job } from "bullmq";
import { DocumentModel } from "../models";
import {
  embedTexts,
  fileParser,
  splitTextIntoChunks,
  vectorStore,
} from "../services";
import type { ChunkDocument } from "../types";
import { unlink } from "node:fs/promises";
import { ioRedisConnection, connectDB, getMongoDBClient, env } from "../config";
import { ingestionQueue } from "../queues/ingest.queue";

const CONCURRENCY = 3;

async function processDocumentJob(job: Job): Promise<void> {
  const { documentId, userId, filePath, mimeType } = job.data;
  const fileName: string = job.data.filename;

  // derive fileType from mimeType — controller doesn't send fileType
  const fileType =
    mimeType === "application/pdf"
      ? "pdf"
      : mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? "docx"
        : "txt";

  console.log(
    `[worker] ▶ Starting job for document ${documentId} (${fileName})`,
  );

  await DocumentModel.findByIdAndUpdate(documentId, { status: "processing" });

  try {
    const parsed = await fileParser(fileName, filePath, fileType);

    if (!parsed.text.trim()) {
      throw new Error("No extractable text found in file");
    }

    const chunks = await splitTextIntoChunks(parsed.text);

    if (chunks.length === 0) {
      throw new Error("Text splitting produced zero chunks");
    }

    await job.updateProgress(30);

    const vectors = await embedTexts(chunks);

    await job.updateProgress(70);

    const paired = chunks
      .map((chunk, idx) => ({ chunk, vector: vectors[idx] }))
      .filter((p): p is { chunk: string; vector: number[] } =>
        Array.isArray(p.vector),
      );

    if (paired.length === 0) {
      throw new Error(
        "All embeddings came back undefined — check the embedTexts loop condition",
      );
    }

    const documents: ChunkDocument[] = paired.map(({ chunk, vector }, idx) => ({
      text: chunk,
      embedding: vector,
      userId,
      documentId,
      fileName: parsed.metadata.fileName,
      fileType: parsed.metadata.fileType,
      chunkIndex: idx,
      source: parsed.metadata.source,
      charCount: chunk.length,
    }));

    const client = await getMongoDBClient();
    const collection = client.db(env.DB_NAME).collection(env.COLLECTION_NAME);
    await collection.insertMany(documents);

    await job.updateProgress(100);

    await DocumentModel.findByIdAndUpdate(documentId, {
      chunkCount: paired.length,
      status: "ready", // your model uses "ready" not "completed"
    });

    console.log(
      `[worker] ✅ Completed ${documentId}: ${paired.length} chunks embedded`,
    );
  } catch (err: any) {
    console.error(`[worker] ❌ Failed ${documentId}:`, err?.message ?? err);
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: "failed",
      error: err?.message ?? "Unknown error",
    });
    throw err;
  } finally {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await unlink(filePath).catch(() =>
        console.warn(`[worker] Could not delete temp file: ${filePath}`),
      );
    }
  }
}

// ── Connect to MongoDB first, THEN start the worker ──────────────────────────
connectDB()
  .then(() => {
    const worker = new Worker(ingestionQueue.name, processDocumentJob, {
      connection: ioRedisConnection as any,
      concurrency: CONCURRENCY,
    });

    worker.on("completed", (job) =>
      console.log(`[worker] Job ${job.id} completed`),
    );

    worker.on("failed", (job, err) =>
      console.error(
        `[worker] Job ${job?.id} failed (${job?.attemptsMade} attempts):`,
        err.message,
      ),
    );

    worker.on("progress", (job, progress) =>
      console.log(`[worker] Job ${job.id} progress: ${progress}%`),
    );

    console.log(`🚀 Worker started (concurrency: ${CONCURRENCY})`);

    async function shutdown(signal: string) {
      console.log(`${signal} received — draining worker...`);
      await worker.close();
      process.exit(0);
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("Worker failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
