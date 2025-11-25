import {User} from "../models/user.model"
import { IUser } from "../interfaces/Iuser.interface"

export const userRepository = {
    async createUser(userData:{
        email:string; 
        password:string; 
        name:string; 
        verificationToken:string
    }):Promise<IUser>{
        const user = new User(userData);
        return await user.save()
    },
    async findUserbyEmail(email: string) {
    try {
    const user = await User.findOne({ email });
    return user;
    } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
    }
},
    async findUserById(userId: string) {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        return null;
    }
    },
    async findUserByVerificationToken(token: string): Promise<IUser | null> {
        return await User.findOne({ verificationToken: token });
    },
    async verifyUser(userId: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { isVerified: true, verificationToken: null },
            { new: true }
        );
    },
    async setPasswordResetToken(
        userId: string,
        resetToken: string,
        expiresAt: Date
    ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
        userId,
    {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
    },
    { new: true }
        );
    },
    async findUserByResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({
    resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });
    },
    async updatePassword(
    userId: string,
    newHashedPassword: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        password: newHashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { new: true }
    );
    },
    async updateUserProfile(userId: string, profileData: any) {
    try {
    const user = await User.findByIdAndUpdate(
        userId,
        { 
        $set: { 
            'profile.bio': profileData.bio,
            'profile.teachSkills': profileData.teachSkills,
            'profile.learnSkills': profileData.learnSkills,
            'profile.availability': profileData.availability,
            'profile.location': profileData.location,
            'profile.language': profileData.language,
            'profile.timezone': profileData.timezone,
            'profile.experienceLevel': profileData.experienceLevel,
            'profile.hourlyRate': profileData.hourlyRate,
            'profile.website': profileData.website,
            'profile.socialLinks': profileData.socialLinks
        } 
        },
        { new: true }
    );
    return user;
    } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
    }
    },

    async updateUserAvatar(userId: string, avatarPath: string) {
    try {
    const user = await User.findByIdAndUpdate(
        userId,
        { 
        $set: { 'profile.avatar': avatarPath } 
        },
        { new: true }
    );
    return user;
    } catch (error) {
    console.error('Error updating user avatar:', error);
    throw error;
    }
    },
    async getAllUsers(): Promise<IUser[]> {
    try {
    const users = await User.find({ 
    isVerified: true 
    }).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    return users;
    } catch (error) {
    console.error('Error getting all users:', error);
    return [];
    }
    }
};