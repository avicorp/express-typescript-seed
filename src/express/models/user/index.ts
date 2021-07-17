import { Schema, Model, model, Document } from "mongoose";

export interface IUser extends Document {
  billingCardBrand: string,
  billingCardExpMonth: string,
  billingCardExpYear: string,
  billingCardLast4: string,
  email: string,
  emailChangeCandidate: string,
  emailProofToken: string,
  emailProofTokenExpiresAt: number,
  emailStatus: string,
  facebookId: string,
  fullName: string,
  googleId: string,
  hasBillingCard: boolean,
  password: string,
  passwordResetToken: string,
  passwordResetTokenExpiresAt: string,
  role: string,
  stripeCustomerId: string,
  telephone: number,
  tosAcceptedByIp: string,
  username: string,
}

const userSchema: Schema = new Schema({
  billingCardBrand: { type: String, trim: true },
  billingCardExpMonth: { type: String, trim: true },
  billingCardExpYear: { type: String, trim: true },
  billingCardLast4: { type: String, trim: true },
  email: { type: String, trim: true, unique: true },
  emailChangeCandidate: { type: String, trim: true },
  emailProofToken: { type: String, trim: true },
  emailProofTokenExpiresAt: { type: Number },
  emailStatus: { type: String, trim: true },
  facebookId: { type: String, trim: true, unique: true, sparse: true },
  fullName: { type: String, trim: true },
  googleId: { type: String, trim: true, unique: true, sparse: true },
  hasBillingCard: { type: Boolean },
  password: { type: String, trim: true },
  passwordResetToken: { type: String, trim: true },
  passwordResetTokenExpiresAt: { type: Number },
  role: { type: String, trim: true },
  stripeCustomerId: { type: String, trim: true, unique: true, sparse: true },
  telephone: { type: Number },
  tosAcceptedByIp: { type: String, trim: true },
  username: { type: String, trim: true, required: true, unique: true }
});

const User: Model<IUser> = model('User', userSchema);
export default User;
