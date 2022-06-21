const express = require("express");
var mongoose = require("mongoose");
const cors = require("cors");
const sendEmail = require("./sendEmail");
const { User, validate } = require("./models/user");
const crypto = require("crypto");
const app = express();
require("dotenv").config();

// env variables
const mongoURL = process.env.MONGO_DB_URL;
const port = process.env.PORT;

// Connecting with database
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("Database is connected");
  })
  .catch((error) => {
    console.log(error);
    console.log(`Error in database connection`);
  });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exist!");
    console.log(req.body.email);
    user = await new User({
      name: req.body.name,
      email: req.body.email,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const message = `${process.env.BASE_URL}/user/verify/${user.id}/${user.token}`;
    await sendEmail(user.email, "Verify Email", message);

    res.status(200).send("Check you email");
  } catch (error) {
    console.log(error);
    res.status(400).send("An error occured");
  }
});

app.get("/verify/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user || !user.token) return res.status(400).send("Invalid link");

    await User.updateOne({ _id: user._id, verified: true, token: null });

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("Something is wrong");
  }
});

app.listen(port, () => {
  console.log("listening to ", `${process.env.BASE_URL}, port ${port}`);
});
