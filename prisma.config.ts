import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
