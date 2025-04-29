import { createEnv } from "@t3-oss/env-nextjs";

import { keys as billing } from "@workspace/billing/keys";
import { keys as email } from "@workspace/email/keys";
import { keys as monitoring } from "@workspace/monitoring/keys";
import { keys as routes } from "@workspace/routes/keys";

export const env = createEnv({
  extends: [billing(), email(), monitoring(), routes()],
  server: {},
  client: {},
  runtimeEnv: {},
});
