import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";

import Users from "../models/userModel.js";
import { compareString, hashedString } from "../utils/index.js";
import PasswordReset from "../models/passwordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const result = await Verification.findOne({ userId });
    if (result) {
      const { expiresAt, token: hashedToken } = result;
      if (expiresAt < Date.now()) {
        Verification.findOneAndDelete({ _id: userId })
          .then(() => {
            const message = "Verification token has expired.";
            res.redirect(`/users/verified?status=error&message=${message}`);
          })
          .catch((err) => {
            res.redirect(`/users/verified?status=error&message=`);
          });
      } else {
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed ot link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              const message = "Verification failed ot link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?status=error&message=`);
          });
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/users/verified?message=`);
  }
};

// export const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await Users.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         status: "FAILED",
//         message: "Email address not found",
//       });
//     }
//     const existingUser = await PasswordReset.findOne({ email });
//     if (existingUser) {
//       if (existingUser.expiresAt > Date.now()) {
//         return res.status(201).json({
//           status: "PENDING",
//           message: "Reset password link has already been sent to your email",
//         });
//       }
//       await PasswordReset.findOneAndDelete({ email });
//     }
//     await resetPasswordLink(user, res);
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: error.message });
//   }
// };

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent tp your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const user = await Users.findById(userId);
    if (!user) {
      const message = "Invalid password reset link. Try again";
      res.redirect(
        `/users/resetPassword?type=reset&status=error&message=${message}`
      );
    }
    const resetPassword = await PasswordReset.findOne({ userId });
    if (!resetPassword) {
      const message = "Invalid password reset link. Try again";
      res.redirect(
        `/users/resetPassword?type=reset&status=error&message=${message}`
      );
    }

    const { expiresAt, token: resetToken } = resetPassword;
    if (expiresAt < Date.now()) {
      const message = `Reset Password Link Has Been Expired`;
      res.redirect(
        `/users/resetPassword?type=reset&status=error&message=${message}`
      );
    } else {
      const isMatch = await compareString(token, resetToken);
      if (!isMatch) {
        const message = `Invalid Password Link. Please try again`;
        res.redirect(
          `/users/resetPassword?type=reset&status=error&message=${message}`
        );
      } else {
        res.redirect(`/users/resetPassword?type=reset&id=${userId}`);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const hashedPassword = await hashedString(password);
    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );
    if (user) {
      await PasswordReset.findOneAndDelete({ userId });
      const message = "Password reset successful";
      res.redirect(`/users/resetPassword?status=success&message=${message}`);
    }
    res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.log(error);
  }
};
