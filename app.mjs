import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import roomState from "./helpers/roomState.mjs";
import comments from "./helpers/comments.mjs";
import database from "./db/database.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/auth.mjs"; // not yet
import authMiddleware from "./middleware/authMiddleware.mjs";

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 1337;

import index from "./routes/index.mjs";

const io = new Server(httpServer, {
  cors: {
    // origin: ["http://localhost:3000", "https://www.student.bth.se/"],
    origin: "*",
    methods: ["GET", "POST"],
  },
});



app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

const userModel = {
  async findUserByEmail(email) {
    const { collection, client } = await database.getDb("users");
    const user = await collection.findOne({ email });
    client.close();
    return user;
  },

  async createUser(username, email, password) {
    const { collection, client } = await database.getDb("users");
    const newUser = { username, email, password };
    await collection.insertOne(newUser);
    client.close();
  },
};


app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.createUser(username, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", { expiresIn: "1h" });
    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use("/auth", authRoutes);


app.get("/protected", authMiddleware, (req, res) => {
  res.send("This is a protected route");
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

httpServer.listen(port, () =>
  console.log(`Example API listening on port ${port}!`)
);
