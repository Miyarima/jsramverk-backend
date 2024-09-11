import express from "express";
import database from "../db/database.mjs";
import { ObjectId } from "mongodb";
var router = express.Router();

let db;

const handleError = (res, e) => {
  res.status(500).json({
    errors: {
      status: 500,
      source: "/",
      title: "Database error",
      detail: e.message,
    },
  });
};

// Returns all documents within the collection
router.get("/", async (req, res) => {
  try {
    const { collection } = await database.getDb();
    const documents = await collection.find().toArray();

    if (documents) {
      res.status(200).json({ data: documents });
    } else {
      res.status(404).json({ message: "No ducuments found" });
    }
  } catch (e) {
    handleError(res, e);
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

// Returns the document with the provided Id
router.get("/:id", async (req, res) => {
  try {
    const { collection } = await database.getDb();
    const filter = { _id: new ObjectId(req.params.id) };
    const keyObject = await collection.findOne(filter);

    if (keyObject) {
      res.status(200).json({ data: keyObject });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    handleError(res, e);
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

// Creates a document with the provided title and content
router.post("/", async (req, res) => {
  try {
    const { collection } = await database.getDb();

    collection.insertOne({
      title: req.body.title,
      content: req.body.content,
      created_at: new Date(),
    });

    res.status(201).json({
      data: {
        msg: "Got a POST request, sending back 201 Created",
      },
    });
  } catch (e) {
    handleError(res, e);
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

// Updates the document with the given Id
router.put("/", async (req, res) => {
  try {
    const { collection } = await database.getDb();

    const result = await collection.updateOne(
      { _id: new ObjectId(req.body.id) },
      { $set: { title: req.body.title, content: req.body.content } }
    );

    res.status(204).send(result);
  } catch (e) {
    handleError(res, e);
  } finally {
    if (db && db.client) {
      await db.client.close();
    }
  }
});

// ==================================
// If delete is needed in the future
// ==================================

// router.delete("/", async (req, res) => {
//   try {
//     const { collection } = await database.getDb();

//     const result = await collection.deleteOne({ name: "John Doe" });

//     res.status(204).send(result);
//   } catch (e) {
//     handleError(res, e);
//   } finally {
//     if (db && db.client) {
//       await db.client.close();
//     }
//   }
// });

export default router;