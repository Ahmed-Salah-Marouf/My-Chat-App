import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';
    loading = signal(false);
    error = signal<string | null>(null);

    onSubmit(): void {
        if (!this.email.trim() || !this.password.trim()) {
            this.error.set('Please fill in all fields');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                // Fetch current user info, then navigate
                this.authService.fetchCurrentUser().subscribe({
                    next: () => this.router.navigate(['/chat']),
                    error: () => this.router.navigate(['/chat'])
                });
            },
            error: (err) => {
                this.loading.set(false);
                if (err.status === 401 || err.status === 403) {
                    this.error.set('Invalid email or password');
                } else {
                    this.error.set('Login failed. Please try again.');
                }
            }
        });
    }
}
