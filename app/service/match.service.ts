// app/services/match.service.ts
import { IUser } from "../interfaces/Iuser.interface";
import { IMatchData, IMatchedUser } from "../interfaces/match.interface";

class MatchService {
  /**
   * Find intersection between two arrays
   */
  private intersection(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(item => 
      arr2.some(otherItem => 
        item.toLowerCase() === otherItem.toLowerCase()
      )
    );
  }

  /**
   * Calculate match between current user and another user
   */
  calculateMatch(currentUser: IUser, otherUser: IUser): IMatchData {
    // Skills you can teach that they want to learn
    const youCanHelp = this.intersection(
      currentUser.profile.teachSkills || [],
      otherUser.profile.learnSkills || []
    );

    // Skills they can teach that you want to learn
    const theyCanHelp = this.intersection(
      otherUser.profile.teachSkills || [],
      currentUser.profile.learnSkills || []
    );

    const totalMatches = youCanHelp.length + theyCanHelp.length;

    // Calculate two-way match percentage
    let percentage = 0;
    
    if (totalMatches > 0) {
      const yourLearnSkills = currentUser.profile.learnSkills?.length || 1;
      const theirLearnSkills = otherUser.profile.learnSkills?.length || 1;

      // Can you help them?
      const youHelpPercentage = (youCanHelp.length / theirLearnSkills) * 100;
      
      // Can they help you?
      const theyHelpPercentage = (theyCanHelp.length / yourLearnSkills) * 100;

      // Overall match is average of both
      percentage = Math.round((youHelpPercentage + theyHelpPercentage) / 2);
    }

    // Determine match quality and badge color
    let matchQuality: 'excellent' | 'good' | 'moderate' | 'low';
    let badgeColor: string;

    if (percentage >= 70) {
      matchQuality = 'excellent';
      badgeColor = 'success'; // Green
    } else if (percentage >= 40) {
      matchQuality = 'good';
      badgeColor = 'warning'; // Yellow
    } else if (percentage >= 20) {
      matchQuality = 'moderate';
      badgeColor = 'info'; // Blue
    } else {
      matchQuality = 'low';
      badgeColor = 'secondary'; // Gray
    }

    return {
      score: totalMatches,
      percentage,
      youCanHelp,
      theyCanHelp,
      matchQuality,
      badgeColor
    };
  }

  /**
   * Find top matches for a user
   */
  async findTopMatches(currentUser: IUser, allUsers: IUser[], limit: number = 5): Promise<IMatchedUser[]> {
    // Filter out current user
    const otherUsers = allUsers.filter(
      user => user._id.toString() !== currentUser._id.toString()
    );

    // Calculate match for each user
    const matchedUsers = otherUsers.map(user => {
      const matchData = this.calculateMatch(currentUser, user);
      return {
        user,
        matchData
      };
    });

    // Filter users with at least 1 skill match
    const usersWithMatches = matchedUsers.filter(
      item => item.matchData.score > 0
    );

    // Sort by match percentage (highest first)
    usersWithMatches.sort((a, b) => {
      // First sort by percentage
      if (b.matchData.percentage !== a.matchData.percentage) {
        return b.matchData.percentage - a.matchData.percentage;
      }
      // If percentage is same, sort by total matches
      return b.matchData.score - a.matchData.score;
    });

    // Return top N matches
    return usersWithMatches.slice(0, limit);
  }

  /**
   * Get all users with match data (for browse page)
   */
  async getAllUsersWithMatch(currentUser: IUser, allUsers: IUser[]): Promise<IMatchedUser[]> {
    // Filter out current user
    const otherUsers = allUsers.filter(
      user => user._id.toString() !== currentUser._id.toString()
    );

    // Calculate match for each user
    const matchedUsers = otherUsers.map(user => {
      const matchData = this.calculateMatch(currentUser, user);
      return {
        user,
        matchData
      };
    });

    // Sort by match percentage (highest first)
    matchedUsers.sort((a, b) => {
      if (b.matchData.percentage !== a.matchData.percentage) {
        return b.matchData.percentage - a.matchData.percentage;
      }
      return b.matchData.score - a.matchData.score;
    });

    return matchedUsers;
  }
}

export const matchService = new MatchService();