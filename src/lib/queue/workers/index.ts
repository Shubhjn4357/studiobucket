import { uploadWorker } from "./upload-worker"
import { downloadWorker } from "./download-worker"
import pino from "pino"

const logger = pino({ level: "info" })

async function startWorkers() {
  logger.info("Starting StudioBucket Background Worker Fleet...")
  
  // They are already initialized by importing them
  // We just need to keep the process alive
  
  process.on("SIGTERM", async () => {
    logger.info("Shutting down workers...")
    if (uploadWorker) await uploadWorker.close()
    if (downloadWorker) await downloadWorker.close()
    process.exit(0)
  })

  logger.info("All workers active. Listening for jobs...")
}

startWorkers().catch(err => {
  logger.error(err, "Worker startup failed:")
  process.exit(1)
})
