// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import database from "./database.mjs";
// import sendInviteEmail from "./utils/sendInviteEmail.js";

// const router = express.Router();

// const JWT_SECRET = "your_jwt_secret_key";

// function authenticate(req, res, next) {
//     const token = req.header('Authorization');
//     if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.userId = decoded.id;
//         next();
//     } catch (error) {
//         res.status(401).json({ error: 'Invalid token' });
//     }
// }

// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         const { collection, client } = await database.getDb("users");

//         const existingUser = await collection.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: "User already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 12);
//         await collection.insertOne({ name, email, password: hashedPassword });

//         client.close();
//         res.status(201).json({ message: "User registered successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Registration failed" });
//     }
// });

// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const { collection, client } = await database.getDb("users");

//         const user = await collection.findOne({ email });
//         if (!user) {
//             client.close();
//             return res.status(400).json({ error: "Invalid email or password" });
//         }

//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             client.close();
//             return res.status(400).json({ error: "Invalid email or password" });
//         }

//         const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
//         client.close();
//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ error: "Login failed" });
//     }
// });

// router.post("/documents", authenticate, async (req, res) => {
//     const { title, content } = req.body;

//     try {
//         const { collection, client } = await database.getDb("docs");
//         const newDocument = {
//             title,
//             content,
//             owner: req.userId,
//             sharedWith: [],
//         };
//         await collection.insertOne(newDocument);

//         client.close();
//         res.status(201).json(newDocument);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to create document" });
//     }
// });

// router.get("/documents", authenticate, async (req, res) => {
//     try {
//         const { collection, client } = await database.getDb("docs");
//         const documents = await collection.find({ owner: req.userId }).toArray();

//         client.close();
//         res.json(documents);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch documents" });
//     }
// });

// router.put("/documents/:id", authenticate, async (req, res) => {
//     const { id } = req.params;
//     const { title, content } = req.body;

//     try {
//         const { collection, client } = await database.getDb("docs");

//         const document = await collection.findOne({ _id: id, owner: req.userId });
//         if (!document) {
//             client.close();
//             return res.status(403).json({ error: "Not authorized to update this document" });
//         }

//         await collection.updateOne({ _id: id }, { $set: { title, content } });

//         client.close();
//         res.json({ message: "Document updated successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to update document" });
//     }
// });

// router.post("/documents/:id/share", authenticate, async (req, res) => {
//     const { id } = req.params;
//     const { email } = req.body;

//     try {
//         const { collection: userCollection, client: userClient } = await database.getDb("users");
//         const { collection: docCollection, client: docClient } = await database.getDb("docs");

//         const userToShareWith = await userCollection.findOne({ email });
//         if (!userToShareWith) {
//             userClient.close();
//             docClient.close();
//             return res.status(404).json({ error: "User not found" });
//         }

//         const document = await docCollection.findOne({ _id: id, owner: req.userId });
//         if (!document) {
//             userClient.close();
//             docClient.close();
//             return res.status(403).json({ error: "Not authorized to share this document" });
//         }

//         await docCollection.updateOne({ _id: id }, { $addToSet: { sharedWith: userToShareWith._id } });

//         sendInviteEmail(userToShareWith.email, document._id); // Skicka inbjudningsmail

//         userClient.close();
//         docClient.close();
//         res.json({ message: "Document shared successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to share document" });
//     }
// });

// export default router;
