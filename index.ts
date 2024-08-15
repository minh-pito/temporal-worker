import express from "express";
import type { Request, Response } from "express";
import { Client } from "@temporalio/client";
import { Redis } from "@upstash/redis";

import { runWorker } from "./src/worker";
import { createNewOrder } from "./src/workflows";
import { WorkflowConnection } from "./src/shared/temporal";
import { logger, pinoHttp } from "./src/shared/logging";
import config from "./src/shared/config";
import { verifyJWT } from "./src/middlewares/authenticate";
import { CreateOrderPayload } from "./src/types/params";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(pinoHttp);
app.use(verifyJWT);

// let workflowClient: Client;
//
// (async () => {
//   console.time("connection_time_latency");
//   const wfConnection = new WorkflowConnection(
//     config.namespace,
//     config.address,
//     config.taskQueue,
//   );
//   workflowClient = new Client({
//     connection: await wfConnection.getConnection(),
//     namespace: config.namespace,
//     interceptors: {
//       workflow: [new OpenTelemetryWorkflowClientInterceptor()],
//     },
//   });
//   console.timeEnd("connection_time_latency");
// })();

app.post("/orders", async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.supabaseJwt) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Token Provided!" });
    }

    const body: CreateOrderPayload = req.body;
    logger.info({
      body,
    });

    console.time("connection_time_latency");
    const wfConnection = new WorkflowConnection(
      config.namespace,
      config.address,
      config.taskQueue,
    );
    const connection = await wfConnection.getConnection();
    const workflowClient = new Client({
      connection,
      namespace: config.namespace,
    });
    console.timeEnd("connection_time_latency");

    const { id, email } = req.user;
    const workflowPayload = {
      user: { id, email },
      supabaseJwt: req.supabaseJwt,
    };
    const handle = await workflowClient.workflow.start(createNewOrder, {
      args: [body, workflowPayload],
      taskQueue: config.taskQueue,
      workflowId: `${config.taskQueue}-workflow-${Date.now()}`,
    });

    req.log.info(
      `Started Workflow ${handle.workflowId} with RunID ${handle.firstExecutionRunId}`,
    );
    // const result = await handle.result();

    res.json({ status: "success" });
  } catch (error) {
    logger.error({ error });
    console.error(error);
    res.status(500).json(error);
  }
});

app.post("/increment", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const UPSTASH_REDIS_REST_URL = "https://light-sculpin-35997.upstash.io";
    const UPSTASH_REDIS_REST_TOKEN =
      "AYydAAIncDE2NTI5NGFiMGY3YzM0YWFhYjgwYTU4Y2RkMWJmNzYyNHAxMzU5OTc";

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
    const count = await redis.incr("counter");

    res.send(`Page view: ${count} - ${JSON.stringify(body)}`);
  } catch (error) {
    logger.error({ error });
    res.status(500).json(error);
  }
});

app.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query;
    console.log({ query });

    const UPSTASH_REDIS_REST_URL = "https://light-sculpin-35997.upstash.io";
    const UPSTASH_REDIS_REST_TOKEN =
      "AYydAAIncDE2NTI5NGFiMGY3YzM0YWFhYjgwYTU4Y2RkMWJmNzYyNHAxMzU5OTc";

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
    const count = await redis.get("counter");

    res.status(200).send(`Page view: ${count}`);
  } catch (error) {
    logger.error({ error });
    res.status(500).json(error);
  }
});

const port = +(process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`PITO: listening on port ${port}`);
});

runWorker().catch((err: Error) => {
  logger.error({ worker_error: err });
  console.error(err);
  process.exit(1);
});
