const bcryptjs = require("bcryptjs");

const hassedPassword = async (password: any) => {
  try {
    console.log(" Hashing password with bcryptjs...");
    console.log("Plain password:", password);

    const salt = await bcryptjs.genSalt(10);
    console.log(" Salt generated");

    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log(" Password hashed");
    console.log("Hash:", hashedPassword);

    return hashedPassword;
  } catch (err) {
    console.error(" Hashing error:", err);
    throw err;
  }
};

export {hassedPassword};
