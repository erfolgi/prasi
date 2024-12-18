import OracleDB from "oracledb";
import type { QConnector, QConnectorParams } from "utils/query/types";
import { oracleConfig } from "./utils/config";
import { inspect } from "./inspect";

export type QOracleConnector = Awaited<ReturnType<typeof connectOracle>>;

export const connectOracle = async (conn: QConnectorParams) => {
  const config = oracleConfig(conn);
  config.conn = await OracleDB.getConnection(config.conn_params);

  const result: QConnector = {
    async inspect() {
      return await inspect(config);
    },
    async destroy() {
      console.log("destroy");
    },
  };
  return result;
};
