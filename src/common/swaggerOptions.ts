import { version } from "../../package.json";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRM API Documentation",
      version,
      description: "API documentation for the CRM system"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message"
            },
            error: {
              type: "object",
              description: "Error details" 
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    servers: [
      {
        url: "/api/v1",
        description: "API server"
      }
    ]
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts", 
    "./src/schemas/*.ts",
    "./src/entity/*.ts"
  ]
};

export default options;
