import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 1337;

import index from "./routes/index.mjs";

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

io.sockets.on("connection", function (socket) {
  console.log(socket.id);
});

app.use((req, res, next) => {
  console.log(req.method);
  console.log(req.path);
  next();
});

app.use("/docs", index);
// app.use("/hello", greetings);

app.get("/", async (req, res) => {
  let routes = {
    routes: {
      This: "/",
      "All documents": "/docs",
      "Create document": "/docs/create",
      "Update document": "/docs/update",
    },
  };
  res.json(routes);
});

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
