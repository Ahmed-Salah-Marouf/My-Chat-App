import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    getUserByEmail(email: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/email/${email}`);
    }

    searchUsersByUsername(usernamePart: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/search/username/${usernamePart}`);
    }

    searchUsersByEmail(emailPart: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/search/email/${emailPart}`);
    }

    searchUsers(part: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/search/${part}`);
    }

    createUser(user: CreateUserRequest): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
