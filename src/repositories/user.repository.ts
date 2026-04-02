import { IUser, UserModel } from '../models/user.model';

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    const users = await UserModel.find();
    return users;
  }

  // Create a new user
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return await user.save();
  }

  // Find by ID
  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).exec();
  }

  // Find by Email
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).exec();
  }

  // SPECIAL: Find by Email and include the password hash (for login authentication)
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).select('+password_hash').exec();
  }

  // Update a user
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // Delete a user
  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
