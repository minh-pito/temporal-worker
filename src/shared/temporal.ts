import fs from "fs/promises";
import path from "path";
import { Connection } from "@temporalio/client";

export class WorkflowConnection {
  public namespace: string;
  public address: string;
  public taskQueue: string;

  constructor(namespace: string, address: string, taskQueue: string) {
    this.namespace = namespace;
    this.address = address;
    this.taskQueue = taskQueue;
  }

  async getCert() {
    const crtPathFile = path.resolve(
      __dirname,
      "../cert/pito-platform-dev.gsmty.crt",
    );
    const keyPathFile = path.resolve(
      __dirname,
      "../cert/pito-platform-dev.gsmty.key",
    );

    const crt = await fs.readFile(crtPathFile);
    const key = await fs.readFile(keyPathFile);
    return { crt, key };
  }

  async getConnection() {
    const { crt, key } = await this.getCert();
    const connection = await Connection.connect({
      address: this.address,
      tls: {
        clientCertPair: {
          crt,
          key,
        },
      },
    });
    return connection;
  }
}
