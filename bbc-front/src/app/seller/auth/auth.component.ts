import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthRequest } from 'src/app/interfaces/auth-request';
import { AuthResponse } from 'src/app/interfaces/auth-response';
import { Seller } from 'src/app/interfaces/seller';
import { SellerService } from 'src/app/services/seller.service';
import { UtilService } from 'src/app/services/util.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  showPassword = false;
  emailExists = false;
  checkingEmail = false;
  signupError = false;
  signupErrorMessage = '';
  isLoginLoading = false;
  isSignupLoading = false;

  private emailCheckSubject = new Subject<string>();

  constructor(
    private sellerService: SellerService,
    private router: Router,
    private util: UtilService
  ) {
    // Check if seller is already logged in
    if (localStorage.getItem('seller-token') != null) {
      this.router.navigate(['seller']);
    }

    // Debounce email checking
    this.emailCheckSubject
      .pipe(debounceTime(500))
      .subscribe((email) => {
        if (email && this.isEmailValid(email)) {
          this.checkEmailInDatabase(email);
        }
      });
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  onEmailInput(email: string): void {
    this.emailExists = false;
    this.signupError = false;
    this.signupErrorMessage = '';

    if (email && email.length > 3) {
      this.emailCheckSubject.next(email);
    }
  }

  checkEmailAvailability(email: string): void {
    if (email && this.isEmailValid(email)) {
      this.checkingEmail = true;
      this.checkEmailInDatabase(email);
    }
  }

  private checkEmailInDatabase(email: string): void {
    // Replace with your actual email check service
    this.sellerService.checkEmailExists(email).subscribe({
      next: (exists: boolean) => {
        this.emailExists = exists;
        this.checkingEmail = false;
      },
      error: (error: any) => {
        console.error('Error checking email:', error);
        this.checkingEmail = false;
      },
    });
  }

  onSellerLogin(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.util.toastify(false, 'Veuillez remplir tous les champs requis correctement');
      return;
    }

    this.isLoginLoading = true;

    let req: AuthRequest = {
      email: form.value.email,
      password: form.value.password,
    };

    this.sellerService.sellerLogin(req).subscribe({
      next: (res: AuthResponse) => {
        this.isLoginLoading = false;
        if (res.status == 'success') {
          localStorage.setItem('seller-jwt', res.token);
          localStorage.setItem('seller-token', JSON.stringify(res.user));

          const payload = JSON.parse(atob(res.token.split('.')[1]));
          const role = payload.role;

          if (role === 'SELLER') {
            this.router.navigate(['seller']);
          } else if (role === 'CUSTOMER') {
            this.router.navigate(['']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['admin']);
          } else {
            this.router.navigate(['seller']);
          }

          this.util.toastify(true, 'Connexion réussie');
        } else {
          this.util.toastify(false, 'Email ou mot de passe incorrect');
        }
      },
      error: (error) => {
        this.isLoginLoading = false;
        this.util.toastify(false, 'Erreur de connexion');
        console.error('Login error:', error);
      }
    });
  }

  onSellerSignup(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.util.toastify(false, 'Veuillez remplir tous les champs requis correctement');
      return;
    }

    if (this.emailExists) {
      this.util.toastify(false, 'Cette adresse e-mail est déjà utilisée');
      return;
    }

    this.isSignupLoading = true;
    this.signupError = false;
    this.signupErrorMessage = '';

    let seller: Seller = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      storeName: form.value.storeName,
      officeAddress: form.value.officeAddress,
      role: 'SELLER',
      id: 0,
      balance: 0
    };

    this.sellerService.sellerSignup(seller).subscribe({
      next: (response: Seller) => {
        this.isSignupLoading = false;
        if (response != null) {
          // Successful signup
          localStorage.setItem('seller-token', JSON.stringify(response));
          this.router.navigate(['seller']);
          this.util.toastify(true, 'Compte vendeur créé avec succès');
        } else {
          // Email already exists (backend returned null)
          this.signupError = true;
          this.signupErrorMessage = 'Cette adresse e-mail est déjà utilisée';
          this.emailExists = true;
          this.util.toastify(false, 'Cette adresse e-mail est déjà utilisée');
        }
      },
      error: (error) => {
        this.isSignupLoading = false;
        this.signupError = true;
        this.signupErrorMessage = 'Une erreur s\'est produite lors de l\'inscription';
        this.util.toastify(false, 'Une erreur s\'est produite lors de l\'inscription');
        console.error('Signup error:', error);
      }
    });
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
