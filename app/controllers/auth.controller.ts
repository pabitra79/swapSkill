import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { userRepository } from "../repository/user.repository";
import { hassedPassword } from "../utils/crypto.utils";
import { generateSecurePassword } from "../utils/password.utils";
import { generateToken, generateVerificationToken } from "../utils/jwt.utils";

import {
  sendWelcomeEmail,
  sendVerificationSuccessEmail,
  sendPasswordResetEmail,
} from "../service/email.service";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validators";
import { SessionData } from "express-session";

interface CustomSession extends SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';  // ← ADD ROLE
  };
  token?: string;
}

class AuthController {

  showRegistrationForm = (req: Request, res: Response): any => {
    res.render("pages/auth/register", {
      title: "Create Account - SkillSwap",
      user: null,
      error: null,
      formData: null,
    });
  };

  register = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = registerSchema.validate(req.body);

      if (error) {
        console.log(" Validation Error:", error.details[0].message);

        return res.render("pages/auth/register", {
          title: "Create Account - SkillSwap",
          error: error.details[0].message,
          user: null,
          formData: req.body,
        });
      }

      const { name, email } = value;
      const existingUser = await userRepository.findUserbyEmail(email);
      if (existingUser) {
        return res.render("pages/auth/register", {
          title: "Create Account - SkillSwap",
          error: "Email already registered",
          user: null,
          formData: req.body,
        });
      }
      const temporaryPassword = generateSecurePassword(12);
      const hashedPassword = await hassedPassword(temporaryPassword);
      const verificationToken = generateVerificationToken();
      
      // Role is automatically set to 'user' by default in User model
      const newUser = await userRepository.createUser({
        email,
        name,
        password: hashedPassword,
        verificationToken,
      });
      
      await sendWelcomeEmail(email, name, temporaryPassword, verificationToken);
      await newUser.save();
      
      return res.render("pages/auth/register-success", {
        title: "Registration Successful",
        message:
          "Registration successful! Check your email for login credentials and verification link.",
      });
    } catch (error: any) {
      console.error(" Registration error:", error);

      return res.status(500).render("pages/auth/register", {
        title: "Create Account - SkillSwap",
        error: "Something went wrong. Please try again.",
        user: null,
        formData: req.body,
      });
    }
  };

  showLoginForm = (req: Request, res: Response) => {
    const session = req.session as CustomSession; 
    res.render("pages/auth/login", {
      title: "Login - SkillSwap",
      error: null,
      user: session.user || null, 
      formData: {}
    });
  };

  login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.render("pages/auth/login", {
        title: "Login - SkillSwap",
        error: error.details[0].message,
        user: null,
        formData: req.body,
      });
    }

    const { email, password } = value;

    const user = await userRepository.findUserbyEmail(email);
    if (!user) {
      return res.render("pages/auth/login", {
        title: "Login - SkillSwap",
        error: "Invalid email or password",
        user: null,
        formData: req.body,
      });
    }

    if (!user.isVerified) {
      return res.render("pages/auth/login", {
        title: "Login - SkillSwap",
        error: "Please verify your email first",
        user: null,
        formData: req.body,
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("pages/auth/login", {
        title: "Login - SkillSwap",
        error: "Invalid email or password",
        user: null,
        formData: req.body,
      });
    }

    const token = generateToken(user._id.toString());

    // Store user in session WITH ROLE
    const session = req.session as CustomSession;
    session.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role  
    };
    session.token = token;

    // Save session and redirect
    return req.session.save((err) => {
      if (err) {
        console.error(' Session save error:', err);
        return res.render("pages/auth/login", {
          title: "Login - SkillSwap",
          error: "Login failed. Please try again.",
          user: null,
          formData: req.body,
        });
      }
      
      const session = req.session as CustomSession;
      console.log(' Session saved successfully:', session.user);
      console.log('👤 User role:', session.user?.role);
      
      if (session.user?.role === 'admin') {
        console.log('🛡️ Redirecting to admin dashboard');
        return res.redirect("/admin/dashboard");
      } else {
        console.log('👤 Redirecting to user dashboard');
        return res.redirect("/dashboard");
      }
    });

  } catch (error: any) {
    console.error(' Login error:', error);
    return res.render("pages/auth/login", {
      title: "Login - SkillSwap",
      error: "Login failed. Please try again.",
      user: null,
      formData: req.body,
    });
  }
};

  verifyEmail = async (req: Request, res: Response): Promise<any> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.render("pages/auth/verify-email", {
          success: null,
          error: "Invalid or missing verification token",
          title: "Verify Email"
        });
      }

      const user = await userRepository.findUserByVerificationToken(token);

      if (!user) {
        return res.render("pages/auth/verify-email", {
          success: null,
          error: "Invalid or expired verification token",
          title: "Verify Email"
        });
      }

      if (user.isVerified) {
        return res.render("pages/auth/verify-email", {
          success: "Your email is already verified. You can log in now.",
          error: null,
          title: "Verify Email"
        });
      }

      // Verify user
      await userRepository.verifyUser(user._id.toString());
      await sendVerificationSuccessEmail(user.email, user.name);

      return res.render("pages/auth/verify-email", {
        success: "Email verified successfully! You can now log in.",
        error: null,
        title: "Verify Email"
      });

    } catch (error: any) {
      console.log(" VERIFY ERROR:", error);  
      return res.render("pages/auth/verify-email", {
        success: null,
        error: "Something went wrong. Please try again.",
        title: "Verify Email"
      });
    }
  };

  showResetPasswordPage = async (req: Request, res: Response) => {
    const session = req.session as CustomSession;
    
    res.render("pages/auth/reset-password", {
      title: "Reset Password - SkillSwap",
      token: req.query.token,
      error: null,
      success: null,
      user: session.user || null, 
    });
  };

  resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession; 
      
      const { error, value } = resetPasswordSchema.validate(req.body);

      if (error) {
        return res.render("pages/auth/reset-password", {
          title: "Reset Password - SkillSwap", 
          user: session.user || null, 
          token: req.body.token,
          error: error.details[0].message,
          success: null,
        });
      }

      const { token, newPassword } = value;

      const user = await userRepository.findUserByResetToken(token);

      if (!user) {
        return res.render("pages/auth/reset-password", {
          title: "Reset Password - SkillSwap", 
          user: session.user || null, 
          token,
          error: "Invalid or expired token",
          success: null,
        });
      }

      const hashedPassword = await hassedPassword(newPassword);
      await userRepository.updatePassword(user._id.toString(), hashedPassword);

      return res.render("pages/auth/reset-password", {
        title: "Reset Password - SkillSwap", 
        user: session.user || null, 
        token: null,
        error: null,
        success: "Password reset successfully.",
      });
    } catch (error: any) {
      const session = req.session as CustomSession;
      
      return res.render("pages/auth/reset-password", {
        title: "Reset Password - SkillSwap",
        user: session.user || null,
        token: req.body.token,
        error: "Password reset failed",
        success: null,
      });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { error, value } = forgotPasswordSchema.validate(req.body);

      if (error) {
        return res.render("pages/auth/forgot-password", {
          title: "Forgot Password - SkillSwap", 
          user: null, 
          error: error.details[0].message,
          success: null,
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

      return res.render("pages/auth/forgot-password", {
        title: "Forgot Password - SkillSwap", 
        user: null, 
        error: null,
        success: "If the email exists, you will receive a reset link.",
      });
    } catch {
      return res.render("pages/auth/forgot-password", {
        title: "Forgot Password - SkillSwap", 
        user: null, 
        error: "Something went wrong.",
        success: null,
      });
    }
  };

  showForgotPasswordForm = (req: Request, res: Response): any => {
    res.render("pages/auth/forgot-password", {
      title: "Forgot Password - SkillSwap",
      user: null,
      error: null,
      success: null,
    });
  };

logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const session = req.session as CustomSession;
    const userId = session.user?.id;
    const userName = session.user?.name || 'Unknown user';
    const userRole = session.user?.role || 'unknown';
    
    console.log(` Logout initiated for: ${userName} (${userRole})`);

    // Get Socket.io instance from app
    const io = (req as any).app.get('io');
    

    req.session.destroy((err) => {
      if (err) {
        console.error(' Session destruction error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
    
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      if (io && userId) {
        console.log(`Broadcasting logout to user_${userId}`);
        io.to(`user_${userId}`).emit('force_logout', {
          message: 'You have been logged out from another tab',
          timestamp: new Date().toISOString(),
          userId: userId
        });
      }
      
      console.log(` Logout successful for: ${userName} (${userRole})`);
      res.redirect('/api/login');
    });
  } catch (error) {
    console.error(' Logout error:', error);
    res.redirect('/api/login');
  }
};
}

const authController = new AuthController();
export { authController };