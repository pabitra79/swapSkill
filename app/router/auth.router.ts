import { Router } from 'express';
const Authrouter = Router();
import { authController } from '../controllers/auth.controller';

Authrouter.get("/register", authController.showRegistrationForm);
Authrouter.post("/register", authController.register);
Authrouter.get("/login", authController.showLoginForm);
Authrouter.post("/login", authController.login);

// Email verification
Authrouter.get("/verify-email", authController.verifyEmail);

// Forgot Password routes - ADD THIS GET ROUTE
Authrouter.get("/forgot-password", authController.showForgotPasswordForm); // ← ADD THIS LINE
Authrouter.post("/forgot-password", authController.forgotPassword);

// Reset Password routes
Authrouter.get("/reset-password", authController.showResetPasswordPage);
Authrouter.post("/reset-password", authController.resetPassword);

Authrouter.get("/logout", authController.logout);

export { Authrouter };