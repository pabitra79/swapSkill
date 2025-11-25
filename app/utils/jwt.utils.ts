import  jwt  from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

    const JWT_SECRET =process.env.JWT_SECRET as string ;
    const JWT_EXPIRES_IN =process.env.JWT_EXPIRES_IN || "2d";
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET not found in .env");
    } 

    export const generateToken = (userId: string): string => {
    try {
    const token = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
    );

    return token;
  } catch (error: any) {
    console.log("error generating jwt token", error);
    throw new Error("Token generation failed");
  }
};


    export const verifyToken = (token: string): any => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(" JWT token verified");
        return decoded;
    } catch (error) {
        console.error(" JWT verification failed:", error);
        throw new Error("Invalid or expired token");
    }
    };


    export const generateVerificationToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15);
    };