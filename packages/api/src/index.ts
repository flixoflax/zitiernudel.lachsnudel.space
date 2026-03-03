import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "./middleware/cors";
import { citeRoutes } from "./routes/cite";

const app = new Hono();
const token = process.env.API_TOKEN ?? "L4ch5nud3ln";

// CORS middleware (must come first to handle preflight requests)
app.use("*", cors());

// Bearer auth middleware (protects all routes)
app.use(
  "*",
  bearerAuth({
    token,
    noAuthenticationHeader: {
      message: (c) => {
        c.status(401);
      },
    },
    invalidAuthenticationHeader: {
      message: (c) => {
        c.status(401);
      },
    },
    invalidToken: {
      message: (c) => {
        c.status(401);
      },
    },
  }),
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    name: "ZitierNudel API",
    version: "1.0.0",
    status: "healthy",
  });
});

// Citation generation endpoint
app.route("/api/cite", citeRoutes);

export default {
  port: 8080,
  fetch: app.fetch,
};
