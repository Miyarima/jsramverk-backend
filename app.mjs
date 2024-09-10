import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

const app = express();
const port = 1337;

import index from "./routes/index.mjs";
import greetings from "./routes/hello.mjs";

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use((req, res, next) => {
  console.log(req.method);
  console.log(req.path);
  next();
});

app.use("/", index);
app.use("/hello", greetings);

app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    errors: [
      {
        status: err.status,
        title: err.message,
        detail: err.message,
      },
    ],
  });
});

app.listen(port, () => console.log(`Example API listening on port ${port}!`));
