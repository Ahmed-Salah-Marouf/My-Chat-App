// User model matching backend UserDto
export interface User {
    id: number;
    userName: string;
    email: string;
    createdAt: string;
}

// For creating a new user
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}
