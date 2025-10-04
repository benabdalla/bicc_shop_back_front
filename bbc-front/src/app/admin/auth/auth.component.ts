import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from 'src/app/interfaces/admin';
import { AuthRequest } from 'src/app/interfaces/auth-request';
import { AuthResponse } from 'src/app/interfaces/auth-response';
import { AdminService } from 'src/app/services/admin.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  // Add missing properties for template
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSignup = false;
  allowSignup = true; // Set to false if you don't want signup option

  constructor(
    private adminService: AdminService,
    private router: Router,
    private util: UtilService
  ) {
    if (localStorage.getItem('admin-token') != null) {
      this.router.navigate(['admin']);
    }
  }

  // Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle between login and signup forms
  toggleSignup(event: Event): void {
    event.preventDefault();
    this.showSignup = !this.showSignup;
    this.clearMessages();
  }

  // Show forgot password message
  showForgotPassword(event: Event): void {
    event.preventDefault();
    this.showError(
      'Veuillez contacter votre administrateur système pour réinitialiser votre mot de passe.'
    );
  }

  // Clear error message
  clearError(): void {
    this.errorMessage = '';
  }

  // Clear success message
  clearSuccess(): void {
    this.successMessage = '';
  }

  // Private method to clear all messages
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Private method to show error
  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearError(), 5000);
  }

  // Private method to show success
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearSuccess(), 5000);
  }

  // Enhanced login method
  onAdminLogin(loginData: any): void {
    if (!loginData.email || !loginData.password) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    this.clearMessages();


    const req: AuthRequest = {
      email: loginData.email,
      password: loginData.password,
    };

    console.log('[LOGIN] Payload:', req);

    this.adminService.adminLogin(req).subscribe({
      next: (res: AuthResponse) => {
        this.isLoading = false;
        console.log('[LOGIN] Response:', res);

        if (res.status == 'success') {
          localStorage.setItem('admin-jwt', res.token);
          localStorage.setItem('admin-token', JSON.stringify(res.user));

          this.showSuccess('Connexion réussie! Redirection en cours...');

          // Décoder le JWT pour récupérer le rôle
          setTimeout(() => {
            const payload = JSON.parse(atob(res.token.split('.')[1]));
            const role = payload.role;

            if (role === 'ADMIN') {
              this.router.navigate(['admin']);
            } else if (role === 'SELLER') {
              this.router.navigate(['seller']);
            } else if (role === 'CUSTOMER') {
              this.router.navigate(['customer']);
            } else {
              this.router.navigate(['']);
            }
          }, 1500);
        } else {
          this.showError('Identifiants invalides');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[LOGIN] Error:', err);

        if (err.error && err.error.error) {
          this.showError(err.error.error);
        } else {
          this.showError('Erreur serveur. Veuillez réessayer.');
        }
      },
    });
  }

  // Enhanced signup method
  onAdminSignup(signupData: any): void {
    if (!signupData.name || !signupData.email || !signupData.password) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const admin: Admin = {
      id: 0, // Default value for id
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      role: 'ADMIN',
    };

    console.log('[SIGNUP] Payload:', admin);

    this.adminService.adminSignup(admin).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('[SIGNUP] Response:', res);

        if (res && res.email) {
          this.showSuccess(
            'Admin inscrit avec succès! Connexion automatique...'
          );
          setTimeout(() => {
            this.showSignup = false;
            this.onAdminLogin({ email: admin.email, password: admin.password });
          }, 1500);
        } else if (res && res.error) {
          this.showError(res.error);
        } else {
          this.showError("Erreur lors de l'inscription");
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[SIGNUP] Error:', err);

        if (err.error && err.error.error) {
          this.showError(err.error.error);
        } else {
          this.showError('Erreur serveur. Veuillez réessayer.');
        }
      },
    });
  }
}
