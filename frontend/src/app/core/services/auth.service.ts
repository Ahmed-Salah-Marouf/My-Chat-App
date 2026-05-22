import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

interface AuthResponse {
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private readonly TOKEN_KEY = 'jwt_token';
    private readonly USER_KEY = 'current_user';

    private currentUser$ = new BehaviorSubject<User | null>(this.loadCachedUser());

    /**
     * Register a new user. Backend returns the JWT token as a plain string.
     */
    register(username: string, email: string, password: string): Observable<string> {
        return this.http.post(`${environment.apiUrl}/register`, {
            userName: username,
            email,
            password
        }, { responseType: 'text' }).pipe(
            tap(token => {
                this.setToken(token);
            })
        );
    }

    /**
     * Login with email and password. Backend returns the JWT token as a plain string.
     */
    login(email: string, password: string): Observable<string> {
        return this.http.post(`${environment.apiUrl}/login`, {
            email,
            password
        }, { responseType: 'text' }).pipe(
            tap(token => {
                this.setToken(token);
            })
        );
    }

    /**
     * Logout: clear stored data and redirect to login.
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser$.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Get the stored JWT token.
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Check if the user is currently logged in (has a non-expired token).
     */
    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = this.decodeTokenPayload(token);
            const expiry = payload.exp * 1000; // convert to ms
            return Date.now() < expiry;
        } catch {
            return false;
        }
    }

    /**
     * Fetch current user from backend and cache it.
     */
    fetchCurrentUser(): Observable<User> {
        return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
            tap(user => {
                this.currentUser$.next(user);
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            })
        );
    }

    /**
     * Get the current user as an observable.
     */
    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    /**
     * Get the current user's ID synchronously (from cache).
     */
    getCurrentUserId(): number {
        const user = this.currentUser$.getValue();
        return user?.id ?? 0;
    }

    /**
     * Get the current user synchronously (from cache).
     */
    getCurrentUserSync(): User | null {
        return this.currentUser$.getValue();
    }

    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    private decodeTokenPayload(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    }

    private loadCachedUser(): User | null {
        try {
            const cached = localStorage.getItem(this.USER_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }
}
