import * as fs from "fs/promises";
import path from "path";
import { Worker, NativeConnection } from "@temporalio/worker";
import { createActivities } from "./activities";
import config from "./shared/config";
// import { Resource } from "@opentelemetry/resources";
// import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
// import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
// import { NodeSDK } from "@opentelemetry/sdk-node";
// import {
//   OpenTelemetryActivityInboundInterceptor,
//   makeWorkflowExporter,
// } from "@temporalio/interceptors-opentelemetry/lib/worker";

export async function runWorker() {
  const crtPathFile = path.resolve(
    __dirname,
    "cert/pito-platform-dev.gsmty.crt",
  );
  const keyPathFile = path.resolve(
    __dirname,
    "cert/pito-platform-dev.gsmty.key",
  );

  const crt = await fs.readFile(crtPathFile);
  const key = await fs.readFile(keyPathFile);

  const connection = await NativeConnection.connect({
    address: config.address,
    tls: {
      clientCertPair: {
        crt,
        key,
      },
    },
  });

  // const resource = new Resource({
  //   [SemanticResourceAttributes.SERVICE_NAME]: "interceptors-sample-worker",
  // });
  // const exporter = new ConsoleSpanExporter();
  //
  // const otel = new NodeSDK({ traceExporter: exporter, resource });
  // otel.start();

  const activities = createActivities();
  const worker = await Worker.create({
    bundlerOptions: {
      ignoreModules: ["@supabase/supabase-js", "uuid"],
    },
    // reuseV8Context: true,
    namespace: config.namespace,
    taskQueue: config.taskQueue,
    workflowsPath: require.resolve("./workflows"),
    activities,
    connection,
    // sinks: {
    //   exporter: makeWorkflowExporter(exporter, resource),
    // },
    // interceptors: {
    //   workflowModules: [require.resolve("./workflows")],
    //   activityInbound: [
    //     (ctx) => new OpenTelemetryActivityInboundInterceptor(ctx),
    //   ],
    // },
  });

  console.log("Worker created for taskQueue", config.taskQueue);
  await worker.run().then(() => {
    console.log("Worker is running for taskQueue", config.taskQueue);
  });
  console.log("Worker gracefully shutdown");
}
