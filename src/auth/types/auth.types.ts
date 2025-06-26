import { UserRole } from "src/users/entities/user.entity";

export type ExistingUserResponse = {
  status: 'existing';
  access_token: string;
  refresh_token: string;
  user: {
    user_id: number;
    email: string;
    role: UserRole;
    doctor_id?: number;
    patient_id?: number;
  };
};

export type NewUserResponse = {
  status: 'new';
  temp_token: string;
  message: string;
  user: {
    user_id: number;
    email: string;
    role: UserRole;
  };
};

export type GoogleCallbackResponse = ExistingUserResponse | NewUserResponse;
