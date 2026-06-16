import { User } from "./user.model.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res.status(500).json({
        message: "Failed to create user",
      });
    }

    const token = user.generateAccessToken();

    return res.status(201).json({
      message: "User created successfully",
      user: createdUser,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    // Recieve
    const { email, password } = req.body;

    // Check if User passed both entries
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    // Find User with email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // If User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Compare password -> Provided in user schema as method
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Generate access token
    const token = user.generateAccessToken();

    const loggedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      user: loggedUser,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
