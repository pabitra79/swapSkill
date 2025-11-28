import { Document } from "mongoose";
export interface IUser extends Document{
    googleId: any;
    _id: any;
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin'; //
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
    experienceLevel: string;       
        hourlyRate: number | null;      
        website: string;               
        socialLinks: {                 
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