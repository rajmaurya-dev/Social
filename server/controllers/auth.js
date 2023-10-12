import Users from "../models/userModel.js";
import { compareString, createJWT, hashedString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //validate fields
  if (!(firstName || lastName || email, password)) {
    next("Provide required fields");
    return;
  }

  try {
    const userExists = await Users.findOne({ email });
    if (userExists) {
      next("Email already exists");
      return;
    }
    const hashedPassword = await hashedString(password);
    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    sendVerificationEmail(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("Please enter User Credentials");
      return;
    }

    const user = await Users.findOne({ email }).select("password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    });

    if (!user) {
      next("Invalid username or password");
    }
    if (!user?.verified) {
      next(
        "User email is not verified. Check your email and verify your account"
      );
    }
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      next("Invalid username or password");
    }
    user.password = undefined;
    const token = createJWT(user?._id);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
