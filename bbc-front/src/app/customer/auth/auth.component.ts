import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthRequest } from 'src/app/interfaces/auth-request';
import { AuthResponse } from 'src/app/interfaces/auth-response';
import { Customer } from 'src/app/interfaces/customer';
import { CustomerService } from 'src/app/services/customer.service';
import { UtilService } from 'src/app/services/util.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  signIn = true;
  showLoginPassword = false;
  showSignupPassword = false;
  emailExists = false;
  checkingEmail = false;
  signupError = false;
  signupErrorMessage = '';
  isLoginLoading = false;
  isSignupLoading = false;

  private emailCheckSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private util: UtilService,
    private authService: AuthService
  ) {
    if (localStorage.getItem('customer-token') != null) {
      this.router.navigate(['customer']);
    }

    this.emailCheckSubject
      .pipe(debounceTime(500))
      .subscribe((email) => {
        if (email && this.isEmailFormatValid(email)) {
          this.checkEmailInDatabase(email);
        }
      });
  }

  isEmailFormatValid(email: string): boolean {
    if (!email) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const parts = email.split('@');

    if (!emailRegex.test(email)) return false;
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;

    if (domain.length === 0 || domain.length > 253) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.includes('..')) return false;

    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return false;

    return true;
  }

  checkEmailFormat(email: string): void {
    console.log('Checking email format:', email);
  }

  onEmailInput(email: string): void {
    this.emailExists = false;
    this.signupError = false;
    if (email && email.length > 3) {
      this.emailCheckSubject.next(email);
    }
  }

  checkEmailAvailability(email: string): void {
    if (email && this.isEmailFormatValid(email)) {
      this.checkingEmail = true;
      this.checkEmailInDatabase(email);
    }
  }

  private checkEmailInDatabase(email: string): void {
    this.authService.checkEmailExists(email).subscribe({
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

  onCustomerLogin(form: NgForm): void {
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

    this.customerService.customerLogin(req).subscribe({
      next: (res: AuthResponse) => {
        this.isLoginLoading = false;
        if (res.status == 'success') {
          localStorage.setItem('customer-jwt', res.token);
          localStorage.setItem('customer-token', JSON.stringify(res.user));

          const payload = JSON.parse(atob(res.token.split('.')[1]));
          const role = payload.role;

          if (role === 'CUSTOMER') {
            this.router.navigate(['']);
          } else if (role === 'SELLER') {
            this.router.navigate(['seller']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['admin']);
          } else {
            this.router.navigate(['']);
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

  onCustomerSignup(form: NgForm): void {
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

    let customer: Customer = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      address: form.value.address,
      role: 'CUSTOMER',
      id: 0,
      status: '',
      emailVerified: false
    };

    this.customerService.customerSignup(customer).subscribe({
      next: (response: Customer) => {
        this.isSignupLoading = false;
        if (response != null) {
        //  localStorage.setItem('customer-token', JSON.stringify(response));
          this.router.navigate(['customer/auth']);
          this.util.toastify(true, 'Compte créé avec succès');
        } else {
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

  toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleSignupPassword(): void {
    this.showSignupPassword = !this.showSignupPassword;
  }

  signInToggle(): void {
    this.signIn = !this.signIn;
    this.showLoginPassword = false;
    this.showSignupPassword = false;
    this.emailExists = false;
    this.checkingEmail = false;
    this.signupError = false;
    this.signupErrorMessage = '';
    this.isLoginLoading = false;
    this.isSignupLoading = false;
  }
}
