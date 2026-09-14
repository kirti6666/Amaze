/**
 * Diagnoses MONGODB_URI before the app tries to use it.
 *
 * Mongoose reports every malformed connection string the same way — "Invalid
 * scheme, expected connection string to start with mongodb:// or mongodb+srv://"
 * — whether the value is wrapped in quotes, carries a stray space, still has the
 * angle brackets from the Atlas dashboard, or is missing the scheme outright.
 * This says which of those it is, then tries the connection.
 *
 * The password is never printed.
 *
 * Run with: npm run check:db
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";

/** Hide the password but keep enough of the string to recognise it. */
function redact(uri: string): string {
  return uri.replace(/^(mongodb(?:\+srv)?:\/\/[^:/?#]+:)([^@]*)(@)/i, (_m, head, pw, at) =>
    `${head}${"*".repeat(Math.min(pw.length, 8))}${at}`);
}

function main() {
  const raw = process.env.MONGODB_URI;

  if (raw === undefined) {
    console.log("MONGODB_URI is not set at all.");
    console.log("Add it to .env.local, then restart — Next.js reads that file only at startup.");
    process.exitCode = 1;
    return;
  }
  if (raw.trim() === "") {
    console.log("MONGODB_URI is present but empty.");
    process.exitCode = 1;
    return;
  }

  const problems: string[] = [];
  let uri = raw;

  if (uri !== uri.trim()) {
    problems.push("has leading or trailing whitespace");
    uri = uri.trim();
  }
  if (/^["'].*["']$/.test(uri)) {
    problems.push("is wrapped in quotes — .env values must be bare");
    uri = uri.replace(/^["']|["']$/g, "");
  }
  if (/^<.*>$/.test(uri)) {
    problems.push("is wrapped in angle brackets — those are dashboard placeholders, not part of the value");
    uri = uri.replace(/^<|>$/g, "");
  }
  if (uri.includes("<") || uri.includes(">")) {
    problems.push("still contains < > placeholders — replace them, brackets included");
  }
  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    problems.push('does not start with "mongodb://" or "mongodb+srv://"');
  }

  // An unescaped @ : / ? # or % inside the password splits the URI in the wrong place.
  const creds = uri.match(/^mongodb(?:\+srv)?:\/\/[^:/?#]+:([^@]*)@/i);
  if (creds && /[@:/?#[\]%]/.test(creds[1].replace(/%[0-9a-f]{2}/gi, ""))) {
    problems.push("has an unescaped special character in the password — percent-encode it (@ becomes %40)");
  }

  console.log("MONGODB_URI:", redact(uri) || "(empty)");
  if (problems.length) {
    console.log("\nProblems found:");
    for (const p of problems) console.log("  - " + p);
    console.log("\nA correct value looks like one of:");
    console.log("  mongodb://127.0.0.1:27017/amaze");
    console.log("  mongodb+srv://user:pass@cluster0.abcde.mongodb.net/amaze?retryWrites=true&w=majority");
    process.exitCode = 1;
    return;
  }

  console.log("Format looks right. Connecting...");
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(async () => {
      const db = mongoose.connection;
      console.log(`  Connected to database "${db.name}" at ${db.host ?? "(srv)"}.`);
      const names = (await db.db!.listCollections().toArray()).map((c) => c.name);
      console.log(names.length ? `  Collections: ${names.join(", ")}` : "  No collections yet — run npm run seed.");
      await mongoose.disconnect();
    })
    .catch(async (err: Error) => {
      console.log(`  Could not connect: ${err.message}`);
      if (/ENOTFOUND|querySrv/i.test(err.message)) console.log("  The cluster hostname does not resolve — check it for typos.");
      if (/Authentication failed|bad auth/i.test(err.message)) console.log("  Username or password is wrong.");
      if (/ECONNREFUSED/i.test(err.message)) console.log("  Nothing is listening there — is your local MongoDB running?");
      if (/IP|whitelist|not allowed/i.test(err.message)) console.log("  Atlas is blocking your IP — add it under Network Access.");
      process.exitCode = 1;
      await mongoose.disconnect().catch(() => {});
    });
}

main();
