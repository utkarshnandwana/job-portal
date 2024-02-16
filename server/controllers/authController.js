import Users from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate fields
  if (!firstName || !lastName || !email || !password) {
    next("All fields are required");
    return;
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Address already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Save hashed password to the database
    });

    // Generate user token
    const token = user.createJWT();

    res.status(201).send({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      next("Please provide user credentials");
      return;
    }

    // Find user by email
    const user = await Users.findOne({ email });

    if (!user) {
      next("Invalid email");
      return;
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      next("Invalid password");
      return;
    }

    // Remove password field from user object
    user.password = undefined;

    // Generate user token
    const token = user.createJWT();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
