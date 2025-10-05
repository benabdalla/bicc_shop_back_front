import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  newsletterEmail: string = '';

  subscribeNewsletter() {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {
      // Handle newsletter subscription
      console.log('Subscribing email:', this.newsletterEmail);
      // Add your subscription logic here
      alert('Merci pour votre inscription à la newsletter!');
      this.newsletterEmail = '';
    } else {
      alert('Veuillez saisir une adresse email valide.');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
