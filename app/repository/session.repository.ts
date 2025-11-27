import Session from '../models/session.model';
import { ISession, ISessionInput, IBalanceStats } from '../interfaces/ISession.interface';

class SessionRepository {
  // Create new session
  async createSession(sessionData: ISessionInput): Promise<ISession> {
    const session = await Session.create(sessionData);
    return session;
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<ISession | null> {
    return await Session.findById(sessionId)
      .populate('teacher', 'name email')
      .populate('student', 'name email');
  }

  // Get all sessions for a user (as teacher or student)
  async getUserSessions(userId: string): Promise<ISession[]> {
    return await Session.find({
      $or: [{ teacher: userId }, { student: userId }]
    })
      .populate('teacher', 'name email')
      .populate('student', 'name email')
      .sort({ date: -1 });
  }

  // Get sessions where user was teacher
  async getTeacherSessions(userId: string): Promise<ISession[]> {
    return await Session.find({ teacher: userId });
  }

  // Get sessions where user was student
  async getStudentSessions(userId: string): Promise<ISession[]> {
    return await Session.find({ student: userId });
  }

  // Calculate balance for a user
  async calculateUserBalance(userId: string): Promise<IBalanceStats> {
  const taughtSessions = await this.getTeacherSessions(userId);
  const learnedSessions = await this.getStudentSessions(userId);

  const hoursTaught = taughtSessions.reduce((sum, session) => sum + session.hours, 0);
  const hoursLearned = learnedSessions.reduce((sum, session) => sum + session.hours, 0);

  return {
    hoursTaught: hoursTaught,
    hoursLearned: hoursLearned,
    balance: hoursTaught - hoursLearned,
    totalSessions: taughtSessions.length + learnedSessions.length
  };
}

  // Update session rated status
  async markSessionAsRated(sessionId: string): Promise<ISession | null> {
    return await Session.findByIdAndUpdate(
      sessionId,
      { rated: true },
      { new: true }
    );
  }

  // Get sessions between two users
  async getSessionsBetweenUsers(user1Id: string, user2Id: string): Promise<ISession[]> {
    return await Session.find({
      $or: [
        { teacher: user1Id, student: user2Id },
        { teacher: user2Id, student: user1Id }
      ]
    }).sort({ date: -1 });
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await Session.findByIdAndDelete(sessionId);
    return result !== null;
  }
}

export default new SessionRepository();