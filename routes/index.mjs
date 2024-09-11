import express from "express";
import database from "../db/database.mjs";
import { ObjectId } from "mongodb";
var router = express.Router();

let db;

// const doc = {
//     name: body.name,
//     html: body.html,
// };

// const result = await db.collection.insertOne(doc);

// if (result.result.ok) {
//     return res.status(201).json({ data: result.ops });
// }

// const ObjectId = require('mongodb').ObjectId;

// const filter = { _id: ObjectId(body["_id"]) };
// const updateDocument = {
//     name: body.name,
//     html: body.html,
// };

// const result = await db.collection.updateOne(
//     filter,
//     updateDocument,
// );

router.get("/user", async (req, res) => {
  try {
    const { collection } = await database.getDb();
    const keyObject = await collection.findOne({ name: "John Doe" });

    console.log(keyObject);

    if (keyObject) {
      res.status(200).json({ data: keyObject });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    res.status(500).json({
      errors: {
        status: 500,
        source: "/",
        title: "Database error",
        detail: e.message,
      },
    });
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

router.post("/user", async (req, res) => {
  try {
    const { collection } = await database.getDb();

    collection.insertOne({
      name: "John Doe",
      age: 30,
      email: "johndoe@example.com",
    });

    res.status(201).json({
      data: {
        msg: "Got a POST request, sending back 201 Created",
      },
    });
  } catch (e) {
    res.status(500).json({
      errors: {
        status: 500,
        source: "/",
        title: "Database error",
        detail: e.message,
      },
    });
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

router.put("/user", (req, res) => {
  res.status(204).send();
});

router.delete("/user", (req, res) => {
  res.status(204).send();
});

export default router;
