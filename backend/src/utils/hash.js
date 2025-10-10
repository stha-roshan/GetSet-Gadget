import crypto from "crypto";
import { promisify } from "util";

const MODULE = "[HASH-GENERATION] [hash.js]";
const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = "sha512";

const pbkdf2Async = promisify(crypto.pbkdf2.bind(crypto));

const generateSalt = () => {
  try {
    return crypto.randomBytes(32).toString("hex");
  } catch (error) {
    console.error(`${MODULE} Failed to generate salt:`, error.message);
    throw error;
  }
};

const hashPassword = async (password) => {
  if (!password) throw new Error("password required");

  try {
    const salt = generateSalt();
    const derivedKey = await pbkdf2Async(
      password,
      salt,
      ITERATIONS,
      KEYLEN,
      DIGEST
    );

    return {
      salt,
      hash: derivedKey.toString("hex"),
      iterations: ITERATIONS,
      keylen: KEYLEN,
      digest: DIGEST,
    };
  } catch (error) {
    console.error(`${MODULE} Failed to hash password:`, error.message);
    throw new Error("Password hashing failed");
  }
};

export { hashPassword };
