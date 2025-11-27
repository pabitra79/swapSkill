// import mongoose, { Schema, Types } from 'mongoose';
// import { ISession, ISessionInput, IBalanceStats } from '../interfaces/ISession.interface';

// const sessionSchema = new Schema<ISession>({
//   teacher: {
//     type: Schema.Types.ObjectId,  // Use Schema.Types.ObjectId
//     ref: 'User',
//     required: true
//   },
//   student: {
//     type: Schema.Types.ObjectId,  // Use Schema.Types.ObjectId
//     ref: 'User',
//     required: true
//   },
//   skill: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   hours: {
//     type: Number,
//     required: true,
//     min: 0.5
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   rated: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Indexes for faster queries
// sessionSchema.index({ teacher: 1, student: 1 });
// sessionSchema.index({ date: -1 });

// export default mongoose.model<ISession>('Session', sessionSchema);