import { Router } from 'express';
const Authrouter = Router();
import { authController } from '../controllers/auth.controller';

Authrouter.get("/register", authController.showRegistrationForm);
Authrouter.post("/register", authController.register);
Authrouter.get("/login", authController.showLoginForm);
Authrouter.post("/login", authController.login);

Authrouter.get("/verify-email", authController.verifyEmail);
Authrouter.get("/forgot-password", authController.showForgotPasswordForm); 
Authrouter.post("/forgot-password", authController.forgotPassword);

Authrouter.get("/reset-password", authController.showResetPasswordPage);
Authrouter.post("/reset-password", authController.resetPassword);

Authrouter.get("/logout", authController.logout);

export { Authrouter };