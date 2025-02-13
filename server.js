const express = require("express");
const app = express();
const PORT = 3000;
const prisma = require("./prisma");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const cors = require("cors");
const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(require("morgan")("dev"));
app.use(
  cors({
    origin: "http://localhost:5173", // Only allow your frontend origin
    credentials: true, // Allow credentials such as Authorization headers or cookies
  })
);

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({ storage });


// Create an 'uploads' directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Add middleware to check if the user is authenticated
// Except api/stadiums
app.use(async (req, res, next) => {
  console.log(req.path);
  if (
    req.path === "/api/stadiums" ||
    req.path === "/login" ||
    req.path === "/register" ||
    req.path === "/api/users" ||
    req.path === "/api/reviews" ||
    req.path === `/api/stadiums/${req.params.id}` ||
    req.path === `/api/comments/${req.params.id}` ||
    req.path === `/api/reviews/${req.params.id}` ||
    req.path === "/api/contactus"
  ) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.userId = payload.userId;
  } catch (err) {
    console.error(err);
  }
  next();
});

// Get Requests
// get stadium
app.get("/api/stadiums", async (req, res, next) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      // select: {
      //   name: true,
      //   teamName: true,
      //   city: true,
      // }
      include: {
        visitedStadiums: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(stadiums);
  } catch (err) {
    next(err);
  }
});

// get stadium info with certain id
app.get("/api/stadiums/:id", async (req, res, next) => {
  const id = +req.params.id;
  try {
    const stadiums = await prisma.stadium.findFirst({
      where: { id },
      include: {
        reviews: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(stadiums);
  } catch (err) {
    next(err);
  }
});
// Get hotels for a specific stadium
app.get("/api/stadiums/:id/hotels", async (req, res, next) => {
  const id = +req.params.id;
  try {
    const hotels = await prisma.stadium.findFirst({
      where: { id },
      include: {
        hotel: true,
      },
    });
    res.json(hotels);
  } catch (err) {
    next(err);
  }
});

// Get restaurants for a specific stadium
app.get("/api/stadiums/:id/restaurants", async (req, res, next) => {
  const id = +req.params.id;
  try {
    const restaurants = await prisma.stadium.findFirst({
      where: { id },
      include: {
        restaurant: true,
      },
    });
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

// get all user info
app.get("/api/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({});
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// get user info with certain id
app.get("/api/users/:id", async (req, res, next) => {
  const id = +req.params.id;
  try {
    const users = await prisma.user.findFirst({
      where: { id },
      // include: {
      //   _count: {
      //     select: { visitedStadiums: true },
      //   },
      // },
      include: {
        visitedStadiums: {
          include: {
            stadium: true,
          },
        },
        reviews: {
          include: {
            stadium: true,
          },
        },
        comments: {
          include: {
            review: {
              include: {
                stadium: true,
              },
            },
          },
        },
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// get all reviews with user and stadium information
app.get("/api/reviews", async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        stadium: {
          select: {
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// get all info (including comments) on specific review with certain id - (NOT SURE IF NEEDED)
app.get("/api/reviews/:id", async (req, res, next) => {
  const id = +req.params.id;
  try {
    const reviews = await prisma.review.findFirst({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// get all comments - (NOT SURE IF NEEDED)
app.get("/api/comments", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany();
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// Post Request

// add new stadium
app.post("/api/stadiums", async (req, res, next) => {
  try {
    const {
      name,
      teamName,
      capacity,
      openYear,
      division,
      zipCode,
      state,
      imageOutsideURL,
      imageInsideURL,
    } = req.body;
    const newStadium = await prisma.stadium.create({
      data: {
        name,
        teamName,
        capacity,
        openYear,
        division,
        zipCode,
        state,
        imageOutsideURL,
        imageInsideURL,
      },
    });
    res.status(201).json(newStadium);
  } catch (err) {
    next(err);
  }
});

// Register a new user
app.post("/register", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      administrator = false,
      googleId,
    } = req.body;

    // Check if the username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if the email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        administrator,
        googleId,
      },
    });
    // Generate a token
    const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log(token);
    res.status(201).json({token, newUser});
  } catch (err) {
    next(err);
  }
});

// Login a user
app.post("/login", async (req, res, next) => {
  try {
    const { username, password, googleId } = req.body;
    const user = await prisma.user.findFirst({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (googleId === "") {
    const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log(token);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// add new visited stadium to a user with certain id
app.post(
  "/api/users/:userId/visitedstadiums/:stadiumId",
  async (req, res, next) => {
    const userId = +req.params.userId;
    const stadiumId = +req.params.stadiumId;
    try {
      // Check if the user and stadium exist
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const stadium = await prisma.stadium.findUnique({
        where: { id: stadiumId },
      });
      if (!user || !stadium) {
        return res.status(404).json({ error: "User or Stadium not found" });
      }
      // Associate the user with the stadium
      await prisma.visitedStadium.create({
        // where: { id: userId },
        data: {
          userId,
          stadiumId,
        },
      });

      res.status(201).json({ message: "Stadium added to user's list" });
    } catch (err) {
      next(err);
    }
  }
);

// add new review to a stadium with certain id
// Multer middleware for handling multipart/form-data
app.post("/api/stadium/:id/reviews", upload.single("image"), async (req, res, next) => {
  const stadiumId = +req.params.id;
  const { rating, comment, userId } = req.body;

  try {
    if (!rating || !comment || !userId) {
      return res.status(400).json({ message: "Rating, comment, and userId are required." });
    }

    // Get the image URL from the uploaded file
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment,
        date: new Date(),
        userId: parseInt(userId),
        stadiumId: parseInt(stadiumId),
        imageURL: imageUrl,
      },
    });

    console.log("Review created successfully:", newReview);

    res.status(201).json({ message: "Review added", review: newReview, rating });
  } catch (err) {
    console.error("Error creating review:", err);
    next(err);
  }
});

// add new comment to a review with certain id
app.post("/api/reviews/:id/comments", async (req, res, next) => {
  const id = +req.params.id;
  const { content, userId } = req.body;
  try {
    // Validate
    if (!content || !userId) {
      return res
        .status(400)
        .json({ message: "Content and userId are required." });
    }

    await prisma.comment.create({
      data: {
        content: content,
        userId: userId,
        reviewId: id,
        date: new Date(),
      },
    });

    res.status(201).json({ message: "Comment added to review" });
  } catch (err) {
    next(err);
  }
});

// Contact Us
app.post("/api/contactus", async (req, res, next) => {
  const { name, email, message } = req.body;
  try {
    // Validate
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required." });
    }

    // Send email to admin
    // await sendEmailToAdmin(name, email, message);
    await prisma.contactUs.create({
      data: {
        name: name,
        email: email,
        message: message,
      },
    });
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    next(err);
  }
});

// Delete Request

// delete a review with certain id (also delete related comments)
app.delete("/api/reviews/:id", async (req, res, next) => {
  try {
    const id = +req.params.id;

    await prisma.comment.deleteMany({ where: { reviewId: id } });
    await prisma.review.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// delete a comment with certain id
app.delete("/api/comments/:id", async (req, res, next) => {
  try {
    const id = +req.params.id;
    await prisma.comment.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// delete a data in visited stadium where exact combo of stadiumid
app.delete(
  "/api/user/:userId/visitedstadium/:stadiumId",
  async (req, res, next) => {
    const userId = +req.params.userId;
    const stadiumId = +req.params.stadiumId;

    try {
      await prisma.visitedStadium.deleteMany({
        where: {
          userId: userId,
          stadiumId: stadiumId,
        },
      });

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

// delete a user and all data related to this user
app.delete("/api/user/:id", async (req, res, next) => {
  try {
    const userId = +req.params.id;

    // delete comments
    await prisma.comment.deleteMany({
      where: {
        userId: userId,
      },
    });

    // delete reviews
    await prisma.review.deleteMany({
      where: {
        userId: userId,
      },
    });

    // delete visited stadiums
    await prisma.visitedStadium.deleteMany({
      where: {
        userId: userId,
      },
    });

    // delete the user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// delete a stadium and all data related to this stadium
app.delete("/api/stadium/:id", async (req, res, next) => {
  try {
    const stadiumId = +req.params.id;

    // delete comments
    await prisma.comment.deleteMany({
      where: {
        review: {
          stadiumId: stadiumId,
        },
      },
    });

    // delete reviews
    await prisma.review.deleteMany({
      where: {
        stadiumId: stadiumId,
      },
    });

    // delete visited stadium
    await prisma.visitedStadium.deleteMany({
      where: {
        stadiumId: stadiumId,
      },
    });

    // delete restaurants
    await prisma.restaurant.deleteMany({
      where: {
        stadiumId: stadiumId,
      },
    });

    // delete hotels
    await prisma.hotel.deleteMany({
      where: {
        stadiumId: stadiumId,
      },
    });

    // delete the stadium
    await prisma.stadium.delete({
      where: {
        id: stadiumId,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Put Request

// update a review with certain id
app.put("/api/review/:id", async (req, res, next) => {
  try {
    const reviewId = +req.params.id;
    const { rating, comment } = req.body;

    // update review
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: rating,
        comment: comment,
        date: new Date(),
      },
    });

    res.status(200).json(updatedReview);
  } catch (err) {
    next(err);
  }
});

// update a comment with certain id
app.put("/api/comment/:id", async (req, res, next) => {
  try {
    const commentId = +req.params.id;
    const { content } = req.body;

    // Validate
    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    // update comment
    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: content,
        date: new Date(),
      },
    });

    res.status(200).json(updatedComment);
  } catch (err) {
    next(err);
  }
});

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
