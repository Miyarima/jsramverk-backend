import database from "../db/database.mjs";

const collectionName = "rooms";

const roomState = {
  updateRoomState: async (roomId, update) => {
    const db = await database.getDb(collectionName);
    const checker = await db.collection.findOne({
      roomId: roomId,
    });

    if (!checker) {
      await db.collection.insertOne({
        roomId: roomId,
        content: update,
      });
    } else {
      await db.collection.updateOne(
        { roomId: roomId },
        { $set: { content: update } }
      );
    }

    await db.client.close();
  },
  getRoomState: async (roomId) => {
    const db = await database.getDb(collectionName);

    const currentState = await db.collection.findOne({
      roomId: roomId,
    });

    await db.client.close();

    return currentState;
  },
};

export default roomState;
