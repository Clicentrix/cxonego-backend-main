import { version } from "../../package.json";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "APIs",
      version,
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          in: "header",
          name: "Authorization",
          description: "Bearer token to access these api endpoints",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "/api/v1",
        description: "",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/schemas/*.ts",
    "./src/routes/*.js",
    "./src/schemas/*.js",
  ],
};

export default options;
