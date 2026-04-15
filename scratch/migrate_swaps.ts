import dbConnect from "../lib/dbConnect";
import SwapRequest from "../models/SwapRequest";

async function migrate() {
  await dbConnect();
  console.log("Connecting to database...");
  
  const result = await SwapRequest.updateMany(
    { status: "accepted" },
    { $set: { status: "negotiating" } }
  );
  
  console.log(`Migrated ${result.modifiedCount} swaps from 'accepted' to 'negotiating'.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
