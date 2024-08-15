import { createClient } from "@supabase/supabase-js";
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionInvokeOptions,
  SupabaseClient,
} from "@supabase/supabase-js";
import { log } from "@temporalio/activity";
import config from "./config";

export const supabase = createClient(config.supabaseUrl, config.serviceRole);

export async function invokeFunc(
  supabase: SupabaseClient,
  routeName: string,
  options: FunctionInvokeOptions,
) {
  const { data, error } = await supabase.functions.invoke(routeName, options);
  let errorMessage = error?.message;
  let errorJson = null;

  if (error instanceof FunctionsHttpError) {
    const errorMsg = await error.context.json();
    errorJson = errorMsg;
    errorMessage = errorMsg.message;
    log.error("Supabase Http error:", errorMsg);
  } else if (error instanceof FunctionsRelayError) {
    log.error("Supabase Relay error:", error);
  } else if (error instanceof FunctionsFetchError) {
    log.error("Supabase Fetch error:", error);
  }

  return { data, error, errorMessage, errorJson };
}
