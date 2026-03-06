// Quick script to hash a password for admin account
const bcrypt = require("bcryptjs");

const password = "admin123"; // Change this to your desired password

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log("\n=================================");
    console.log("Password:", password);
    console.log("Hashed:", hash);
    console.log("=================================\n");
    console.log("Copy the hashed value and update it in MongoDB:");
    console.log("1. Go to MongoDB Atlas → Browse Collections");
    console.log('2. Find your user and edit the "password" field');
    console.log("3. Paste the hashed value above");
    console.log("4. Login with the plain password:", password);
    console.log("\n");
  });
});
