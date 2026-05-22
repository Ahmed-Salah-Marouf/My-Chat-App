import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    username = '';
    email = '';
    password = '';
    confirmPassword = '';
    loading = signal(false);
    error = signal<string | null>(null);

    onSubmit(): void {
        if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
            this.error.set('Please fill in all fields');
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.error.set('Passwords do not match');
            return;
        }

        if (this.password.length < 6) {
            this.error.set('Password must be at least 6 characters');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.authService.register(this.username, this.email, this.password).subscribe({
            next: () => {
                // Fetch current user info, then navigate
                this.authService.fetchCurrentUser().subscribe({
                    next: () => this.router.navigate(['/chat']),
                    error: () => this.router.navigate(['/chat'])
                });
            },
            error: (err) => {
                this.loading.set(false);
                if (err.status === 409 || err.error?.includes?.('already exists')) {
                    this.error.set('An account with this email already exists');
                } else {
                    this.error.set(err.error || 'Registration failed. Please try again.');
                }
            }
        });
    }
}
