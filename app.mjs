import express, { json } from "express";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLSchema,
} from "graphql";

import roomState from "./helpers/roomState.mjs";
import comments from "./helpers/comments.mjs";
import index from "./routes/index.mjs";
import RootQueryType from "./types/Root.mjs";
import RootMutationType from "./types/RootMutation.mjs";

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 1337;

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const io = new Server(httpServer, {
  cors: {
    // origin: ["http://localhost:3000", "https://www.student.bth.se/"],
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let timeout;

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("create", async function (room) {
    socket.join(room);

    socket.currentRoom = room;
    console.log("Joined the room:", room);

    const docComments = await comments.getComments(socket.currentRoom);

    socket.emit("newComment", docComments);

    if (socket.rooms.has(room)) {
      const data = await roomState.getRoomState(room);
      if (data) {
        socket.emit("socketJoin", data);
      }
    }
  });

  socket.on("update", (data) => {
    socket.to(socket.currentRoom).emit("serverUpdate", data);

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      roomState.updateRoomState(socket.currentRoom, data);
    }, 2000);
  });

  socket.on("comment", (data) => {
    comments.addComment(
      socket.currentRoom,
      data.comment,
      data.caretPosition.caret,
      data.caretPosition.line
    );

    socket.to(socket.currentRoom).emit("newComment", data);
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    const users = io.sockets.adapter.rooms.get(socket.currentRoom);
    if (users === undefined) {
      roomState.clearRoomState(socket.currentRoom);
    }
  });
});

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

app.use("/docs", index);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

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

httpServer.listen(port, () =>
  console.log(`Example API listening on port ${port}!`)
);
