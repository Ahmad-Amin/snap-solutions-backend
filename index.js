const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const mongoose = require("./mongoose");
const bodyParser = require("body-parser");
const UserModel = require("./models/UserModel");
const FileModel = require("./models/FileModel");

const nodemailer = require("nodemailer");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const port = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_TEST_MAIL,
    pass: process.env.GMAIL_TEST_PASS,
  },
});

const { binaryToDataURI, dataURIToBinary } = require("./imageUtils");
const TransactionModel = require("./models/TransactionModel");

const app = express();
app.use(express.json());
app.use(cors());
// app.use(bodyParser.json());

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferTimeoutMS: 30000, // Set a higher timeout value (in milliseconds)
};

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const mongoURI =
  "mongodb+srv://baigahmad323:KdaXcHsVFSjNg7vd@cluster0snap.392yntg.mongodb.net/?retryWrites=true&w=majority";
const databaseName = "snap_solutions";
const collectionName = "users";

app.get("/", async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    let user = await UserModel.findOne({ email, password });

    if (user) {
      user = user.toObject()
      user.displayImage = binaryToDataURI(user.displayImage);
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-all-users", async (req, res) => {
  try {
    const query = { role: { $ne: "superadmin" } };

    const users = await UserModel.find(query);

    const usersWithImageDataURI = users.map((user) => {
      if (user.displayImage) {
        return {
          ...user.toObject(),
          displayImage: binaryToDataURI(user.displayImage),
        };
      } else {
        return user.toObject();
      }
    });

    if (users) {
      res.json(usersWithImageDataURI);
    } else {
      res.status(404).json({ error: "Not Users Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/get-all-transactions", async (req, res) => {
  try {
    const alltransactions = await TransactionModel.find({});
    console.log(alltransactions);
    if (alltransactions) {
      res.json(alltransactions);
    } else {
      res.status(404).json({ error: "Not Transactions Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/update-user", upload.single("displayImage"), async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    const displayImageBuffer = req.file ? req.file.buffer : null;

    const updatedUserData = {
      $set: req.body,
    };

    if (displayImageBuffer) {
      updatedUserData.$set.displayImage = displayImageBuffer;
    } else {
      updatedUserData.$set.displayImage = dataURIToBinary(
        req.body.displayImage
      );
    }

    const updatedUser = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.body.id) },
      updatedUserData,
      { returnDocument: "after" }
    );

    if (updatedUser) {
      updatedUser.displayImage = binaryToDataURI(updatedUser.displayImage);
      return res.json(updatedUser);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    const { originalname, size, mimetype, buffer } = req.file;
    const userId = req.body.userId;
    console.log(userId);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const file = new FileModel({
      filename: originalname,
      size: size,
      fileType: mimetype,
      data: buffer,
      timeOfUpload: new Date(Date.now()),
      user: user._id,
    });

    await file.save();
    res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add-new-user", async (req, res) => {
  try {
    const { name, email, phoneNumber, companyName, inviteLink } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const dummyPassword = generateDummyPassword();

    const newUser = new UserModel({
      email,
      name,
      password: dummyPassword,
      additionalUserDetails: {
        phoneNumber,
        companyName,
      },
      inviteLink,
    });

    const savedUser = await newUser.save();

    const emailTemplate = `
     Hey, You are just been added to the Snap Solutions Software\nHere is the credentails to Login to the system\n
     Email: ${email}\n
     Password: ${dummyPassword}
    `;

    const mailOptions = {
      from: "baigahmad323@gmail.com",
      to: email,
      subject: "Your Dummy Password",
      text: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    if (savedUser) {
      console.log("saved User-->", savedUser);
      res.status(201).json(savedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/user:userId", async (req, res) => {
  const { userId } = req.body.id;
  console.log()
});

const generateDummyPassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let dummyPassword = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    dummyPassword += charset[randomIndex];
  }

  return dummyPassword;
};

app.listen(port, () => {
  console.log("Server is running");
});
