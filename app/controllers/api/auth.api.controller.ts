// app/controllers/api/auth.api.controller.ts
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { userRepository } from "../../repository/user.repository";
import { hassedPassword } from "../../utils/crypto.utils";
import { generateSecurePassword } from "../../utils/password.utils";
import { generateToken, generateVerificationToken } from "../../utils/jwt.utils";
import {
  sendWelcomeEmail,
  sendVerificationSuccessEmail,
  sendPasswordResetEmail,
} from "../../service/email.service";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth.validators";
import { CustomSession } from "../../../types/session.types";

class AuthApiController {
  register = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = registerSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { name, email } = value;
      const existingUser = await userRepository.findUserbyEmail(email);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already registered"
        });
      }

      const temporaryPassword = generateSecurePassword(12);
      const hashedPassword = await hassedPassword(temporaryPassword);
      const verificationToken = generateVerificationToken();
      
      const newUser = await userRepository.createUser({
        email,
        name,
        password: hashedPassword,
        verificationToken,
      });
      
      await sendWelcomeEmail(email, name, temporaryPassword, verificationToken);
      await newUser.save();
      
      return res.status(201).json({
        success: true,
        message: "Registration successful! Check your email for login credentials and verification link.",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        error: "Registration failed. Please try again."
      });
    }
  };

  login = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = loginSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { email, password } = value;
      const user = await userRepository.findUserbyEmail(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password"
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          error: "Please verify your email first"
        });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password"
        });
      }

      const token = generateToken(user._id.toString());

      const session = req.session as CustomSession;
      session.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role  
      };
      session.token = token;

      return new Promise((resolve) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
              success: false,
              error: "Login failed. Please try again."
            });
          }
          
          return res.json({
            success: true,
            message: "Login successful",
            user: {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role
            },
            token: token
          });
        });
      });

    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        error: "Login failed. Please try again."
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<any> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid or missing verification token"
        });
      }

      const user = await userRepository.findUserByVerificationToken(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Invalid or expired verification token"
        });
      }

      if (user.isVerified) {
        return res.json({
          success: true,
          message: "Your email is already verified. You can log in now."
        });
      }

      await userRepository.verifyUser(user._id.toString());
      await sendVerificationSuccessEmail(user.email, user.name);

      return res.json({
        success: true,
        message: "Email verified successfully! You can now log in."
      });

    } catch (error: any) {
      console.log("VERIFY ERROR:", error);  
      return res.status(500).json({
        success: false,
        error: "Something went wrong. Please try again."
      });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = forgotPasswordSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { email } = value;
      const user = await userRepository.findUserbyEmail(email);

      const resetToken = generateVerificationToken();
      const expires = new Date(Date.now() + 3600000);

      if (user) {
        await userRepository.setPasswordResetToken(
          user._id.toString(),
          resetToken,
          expires
        );
        await sendPasswordResetEmail(email, user.name, resetToken);
      }

      return res.json({
        success: true,
        message: "If the email exists, you will receive a reset link."
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Something went wrong."
      });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = resetPasswordSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { token, newPassword } = value;
      const user = await userRepository.findUserByResetToken(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        });
      }

      const hashedPassword = await hassedPassword(newPassword);
      await userRepository.updatePassword(user._id.toString(), hashedPassword);

      return res.json({
        success: true,
        message: "Password reset successfully."
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: "Password reset failed"
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      const userId = session.user?.id;
      const userName = session.user?.name || 'Unknown user';
      const userRole = session.user?.role || 'unknown';
      
      console.log(`Logout initiated for: ${userName} (${userRole})`);

      const io = (req as any).app.get('io');
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Logout failed' 
          });
        }
      
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        if (io && userId) {
          io.to(`user_${userId}`).emit('force_logout', {
            message: 'You have been logged out from another tab',
            timestamp: new Date().toISOString(),
            userId: userId
          });
        }
        
        return res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  };
}

export const authApiController = new AuthApiController();