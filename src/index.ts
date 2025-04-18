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

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));

app.use(
  authMiddleware().unless({
    path: [
      /**
       * ! mention path where you dont wanna check token in following format RegExp("/api/v1/user/auth"),
       *  */
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
  try {
    await AppDataSource.initialize();
    logger.info("Database connection successful...");
  } catch (error) {
    logger.error(error);
  }
});

cron;
