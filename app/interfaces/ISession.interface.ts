// import { Document, Types } from 'mongoose';

// export interface ISession extends Document {
//   teacher: Types.ObjectId;  // Change from string to Types.ObjectId
//   student: Types.ObjectId;  // Change from string to Types.ObjectId
//   skill: string;
//   hours: number;
//   date: Date;
//   rated: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface ISessionInput {
//   teacher: string;  // Keep as string for input (can convert when creating)
//   student: string;
//   skill: string;
//   hours: number;
//   date: Date;
// }

// export interface IBalanceStats {
//   taught: number;
//   learned: number;
//   balance: number;
//   totalSessions: number;
// }