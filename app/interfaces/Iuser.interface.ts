import { Document } from "mongoose";
export interface IUser extends Document{
    googleId: any;
    _id: any;
    email: string;
    password: string;
    name: string;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    profile: {
    bio: string;
    teachSkills: string[];
    learnSkills: string[];
    availability: string;
    location: string;
    avatar: string;
    language: string;
    timezone: string;
    experienceLevel: string;        // ADDED
        hourlyRate: number | null;      // ADDED
        website: string;                // ADDED
        socialLinks: {                  // ADDED
            github: string;
            linkedin: string;
            twitter: string;
        };
    };
    stats: {
    completedSessions: number;
    hoursTaught: number;
    hoursLearned: number;
    responseRate: number;
    };
    createdAt: Date;
    updatedAt: Date;
}