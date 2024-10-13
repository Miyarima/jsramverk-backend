import database from "../db/database.mjs";

const collectionName = "comments";

const comments = {
  addComment: async (roomId, comment, caret, row) => {
    const db = await database.getDb(collectionName);
    await db.collection.insertOne({
      roomId: roomId,
      comment: comment,
      caret: caret,
      row: row,
    });

    await db.client.close();
  },
  getComments: async (roomId) => {
    const db = await database.getDb(collectionName);
    const roomComments = await db.collection
      .find({
        roomId: roomId,
      })
      .toArray();

    await db.client.close();

    return roomComments;
  },
};

export default comments;
