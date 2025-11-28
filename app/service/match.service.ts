
import { IUser } from "../interfaces/Iuser.interface";
import { IMatchData, IMatchedUser } from "../interfaces/match.interface";

class MatchService {

  private intersection(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(item => 
      arr2.some(otherItem => 
        item.toLowerCase() === otherItem.toLowerCase()
      )
    );
  }

  calculateMatch(currentUser: IUser, otherUser: IUser): IMatchData {
    const youCanHelp = this.intersection(
      currentUser.profile.teachSkills || [],
      otherUser.profile.learnSkills || []
    );

    const theyCanHelp = this.intersection(
      otherUser.profile.teachSkills || [],
      currentUser.profile.learnSkills || []
    );

    const totalMatches = youCanHelp.length + theyCanHelp.length;


    let percentage = 0;
    
    if (totalMatches > 0) {
      const yourLearnSkills = currentUser.profile.learnSkills?.length || 1;
      const theirLearnSkills = otherUser.profile.learnSkills?.length || 1;


      const youHelpPercentage = (youCanHelp.length / theirLearnSkills) * 100;
      
      const theyHelpPercentage = (theyCanHelp.length / yourLearnSkills) * 100;


      percentage = Math.round((youHelpPercentage + theyHelpPercentage) / 2);
    }
    let matchQuality: 'excellent' | 'good' | 'moderate' | 'low';
    let badgeColor: string;

    if (percentage >= 70) {
      matchQuality = 'excellent';
      badgeColor = 'success'; 
    } else if (percentage >= 40) {
      matchQuality = 'good';
      badgeColor = 'warning'; 
    } else if (percentage >= 20) {
      matchQuality = 'moderate';
      badgeColor = 'info'; 
    } else {
      matchQuality = 'low';
      badgeColor = 'secondary'; 
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


  async findTopMatches(currentUser: IUser, allUsers: IUser[], limit: number = 5): Promise<IMatchedUser[]> {

    const otherUsers = allUsers.filter(
      user => user._id.toString() !== currentUser._id.toString()
    );


    const matchedUsers = otherUsers.map(user => {
      const matchData = this.calculateMatch(currentUser, user);
      return {
        user,
        matchData
      };
    });

    const usersWithMatches = matchedUsers.filter(
      item => item.matchData.score > 0
    );


    usersWithMatches.sort((a, b) => {

      if (b.matchData.percentage !== a.matchData.percentage) {
        return b.matchData.percentage - a.matchData.percentage;
      }

      return b.matchData.score - a.matchData.score;
    });


    return usersWithMatches.slice(0, limit);
  }


  async getAllUsersWithMatch(currentUser: IUser, allUsers: IUser[]): Promise<IMatchedUser[]> {

    const otherUsers = allUsers.filter(
      user => user._id.toString() !== currentUser._id.toString()
    );


    const matchedUsers = otherUsers.map(user => {
      const matchData = this.calculateMatch(currentUser, user);
      return {
        user,
        matchData
      };
    });

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