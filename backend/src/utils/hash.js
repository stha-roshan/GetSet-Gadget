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

//salt is optional - generates new salt if not provided
const hashPassword = async (password, salt = generateSalt()) => {
  if (!password) throw new Error("password required");

  try {
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
    };
  } catch (error) {
    console.error(`${MODULE} Failed to hash password:`, error.message);
    throw new Error("Password hashing failed");
  }
};

const verifyPassword = async (inputPassword, storedHash, storedSalt) => {
  if (!inputPassword || !storedHash || !storedSalt) {
    throw new Error("Missing required parameters for password verification");
  }
  const { hash } = await hashPassword(inputPassword, storedSalt);

  const derivedBuff = Buffer.from(hash, "hex");
  const storedBuff = Buffer.from(storedHash, "hex");

  if (derivedBuff.length !== storedBuff.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedBuff, storedBuff);
};

export { hashPassword, verifyPassword };
