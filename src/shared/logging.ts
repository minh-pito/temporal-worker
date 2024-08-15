import Pino from "pino";
import PinoHttp from "pino-http";
import config from "./config";

/**
 * Set project Id for log correlation in request-based logger
 * @param {string} projectId - Google Cloud Platform Project Id
 */
let project = config.projectId;
export const initLogCorrelation = (projectId: string) => {
  project = projectId;
};

/**
 * Create a custom formatter to set the "severity" property in the JSON payload
 * to the log level to be automatically parsed
 * https://github.com/winstonjs/winston#creating-custom-formats
 * https://cloud.google.com/run/docs/logging#special-fields
 * https://getpino.io/#/docs/api?id=formatters-object
 */
const formatters = {
  level(label: any) {
    return { severity: label };
  },
};

/**
 * Initialize pino logger
 */
export const logger = Pino({
  formatters,
  // Set log message property name to "message" for automatic parsing
  messageKey: "message",
});

/**
 * Create request-based logger with trace ID field for logging correlation
 * For more info, see https://cloud.google.com/run/docs/logging#correlate-logs
 */
export const pinoHttp = PinoHttp({
  logger,
  useLevel: "info",
  customProps: function (req: any) {
    const traceHeader = req.header("X-Cloud-Trace-Context");
    let trace;
    if (traceHeader) {
      const [traceId] = traceHeader.split("/");
      trace = `projects/${project}/traces/${traceId}`;
    }
    return {
      "logging.googleapis.com/trace": trace,
    };
  },
});
