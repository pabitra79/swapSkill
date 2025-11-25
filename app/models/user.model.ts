import { Schema,model } from "mongoose";
import { IUser } from "../interfaces/Iuser.interface";

const userSchema = new Schema <IUser>({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    name: { 
        type: String, 
        required: true 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: { 
        type: String 
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    profile: {
    bio: { type: String, default: '' },
    teachSkills: { type: [String], default: [] },
    learnSkills: { type: [String], default: [] },
    availability: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' },
    language: { type: String, default: 'English' },
    timezone: { type: String, default: 'IST' },
    experienceLevel: { type: String, default: '' },
    hourlyRate: { type: Number, default: null },
    website: { type: String, default: '' },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' }
    }
    },
// for stats
    stats: {
        completedSessions: { type: Number, default: 0 },
        hoursTaught: { type: Number, default: 0 },
        hoursLearned: { type: Number, default: 0 },
        responseRate: { type: Number, default: 0 }
    }
    }, {
    timestamps: true
});
export const User = model<IUser>("User",userSchema)