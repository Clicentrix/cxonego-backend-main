import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Request, Response, NextFunction } from "express";

import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";

import logger from "./common/logger";
import * as dotenv from "dotenv";
import errorMiddleware from "./middlewares/error.middleware";
import router from "./routes/router";
import * as swaggerJSDoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";
import * as cookieParser from "cookie-parser";
import options from "./common/swaggerOptions";
import { buildResponse } from "./common/utils";
import { authMiddleware } from "./middlewares/firebase.middleware";
import * as cron from "./common/cron";
import rateLimit from "express-rate-limit";

dotenv.config();

morgan.token("host", function (req: express.Request, _res) {
  return req.hostname;
});

const app = express();

app.use(cookieParser());

const specs = swaggerJSDoc(options);

app.use("/api/v1/api-doc", swaggerUi.serve, swaggerUi.setup(specs));

app.use(
  morgan(
    ":date[web] :remote-addr :method :host :url :status :res[content-length] - :response-time ms",
    {
      skip: function (req, _res) {
        return req.originalUrl === "/api/v1/health";
      },
    }
  )
);

// Create an array of allowed origins, filtering out undefined values
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://13.235.48.242:5173'
].filter(Boolean) as string[];

app.use(cors({ 
  credentials: true, 
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add specific CORS settings for captcha endpoint
app.use('/api/v1/superAdmin/verifyCaptcha', cors({
  credentials: true,
  origin: allowedOrigins,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers
app.use((_req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));

app.use(
  authMiddleware().unless({
    path: [
      /**
       * ! mention path where you dont wanna check token in following format RegExp("/api/v1/user/auth"),
       *  */
      RegExp("^/api/v1/cron/markUpcomingToActive"),
      RegExp("/api/v1/document/auth/google/callback"),
      RegExp("/api/v1/document/auth/google"),
      RegExp("/api/v1/document/google/connection"),
      RegExp("/api/v1/document/auth/google/connection"),
      RegExp("/api/v1/document/auth/google/reconnect"),
      RegExp("/api/v1/document/debug/connection"),
      RegExp("/api/v1/email-poc/"),
      RegExp("/api/v1/users/invite"),
      RegExp("/api/v1/users/update"),
      RegExp("/api/v1/health"),
      RegExp("/api/v1/users/role"),
      RegExp("/api/v1/users/isInvitationRevoked"),
      RegExp("/api/v1/organization/"),
      RegExp("/api/v1/users/"),
      RegExp("/api/v1/organization/create-organization"),
      RegExp("/api/v1/plan/getAllPlans"),
      RegExp("^/api/v1/customPlanRequest"),
      RegExp("^/api/v1/superAdmin/verifyCaptcha"),
      RegExp("/api/v1/subscription/update-payment-status"),
      RegExp("^/api/v1/audit/subscription"),
      RegExp("^/api/v1/cron/expiryReminder"),
      RegExp("^/api/v1/cron/updateSubscriptionStatus"),
      RegExp("^/api/v1/cron/sendMonthlyReport"),
      RegExp("^/api/v1/cron/checkActivity"),
      RegExp("^/api/v1/cron/markUpcomingToActive"),
    ],
  })
);

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).send(buildResponse("", "invalid token", err));
  } else {
    next(err);
  }
});

const port = process.env.PORT || 80;

// Define the rate limit rule
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: {
    msg: "Too many requests from this IP, please try again after 60 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use("/api", limiter);

app.use("/api/v1", router);

app.use(errorMiddleware);

app.listen(port, async () => {
  logger.info("App Started on port", { port });
  console.log(`Server running at http://localhost:${port}`);
  
  // Database connection with better error handling
  try {
    // Log database connection parameters (without password)
    console.log("Attempting database connection with:", {
      host: process.env.DATABASE_HOST,
      port: Number.parseInt(process.env.DATABASE_PORT ?? "3306"),
      username: process.env.DATABASE_USER_NAME,
      database: process.env.DATABASE_NAME,
    });
    
    // Initialize database connection
    await AppDataSource.initialize();
    
    logger.info("Database connection successful...");
  } catch (error) {
    logger.error("Database connection error:", error);
    console.error("Failed to connect to database. Details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      stack: error.stack,
    });
    
    // Don't crash the server on database connection failure
    // This allows the server to start and serve routes that don't require database
  }
});

cron;
