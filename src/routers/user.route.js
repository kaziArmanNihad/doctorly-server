const express = require("express");

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require("../controllers/user.controller");

const router = express.Router();

// get routers
router.get("/", getUsers);
router.get("/:id", getUser);

// post router
router.post("/", createUser);

// update routers
router.put("/", updateUser);
router.patch("/", updateUser);

// delete router
router.delete("/", deleteUser);

module.exports = router;
