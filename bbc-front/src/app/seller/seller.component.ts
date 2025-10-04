import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css'],
})
export class SellerComponent implements OnInit {
  sellerName: string = localStorage.getItem('seller-token') ? JSON.parse(localStorage.getItem('seller-token') || '{}').name : 'Seller';
  currentLanguage: string = 'en';
  searchQuery: string = '';
  isDarkMode: boolean = false;
  notificationCount: number = 3;


  // Language configuration
  languages = {
    en: { name: 'English', flag: 'assets/images/county/05.png' },
    fr: { name: 'Français', flag: 'assets/images/county/04.png' },


  };

  constructor(private router: Router) {
    // Load saved language preference
    this.currentLanguage = localStorage.getItem('seller-language') || 'en';
    this.isDarkMode = localStorage.getItem('seller-dark-mode') === 'true';
  }

  ngOnInit(): void {
    this.applyDarkMode();
  }

  // Language Methods
  changeLanguage(language: string): void {
    this.currentLanguage = language;
    localStorage.setItem('seller-language', language);

    // Here you would integrate with your translation service
    // Example: this.translateService.use(language);

    console.log('Language changed to:', language);

    // Show success message
    this.showNotification('Language changed successfully!', 'success');
  }

  getCurrentLanguageFlag(): string {
    return (
      this.languages[this.currentLanguage as keyof typeof this.languages]
        ?.flag || 'assets/images/county/04.png'
    );
  }

  getCurrentLanguageName(): string {
    return (
      this.languages[this.currentLanguage as keyof typeof this.languages]
        ?.name || 'English'
    );
  }

  // Dark Mode Methods
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('seller-dark-mode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  // Sidebar Methods
  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar-wrapper');
    const pageWrapper = document.querySelector('.page-wrapper');

    sidebar?.classList.toggle('toggled');
    pageWrapper?.classList.toggle('toggled');
  }

  // Logout Method
  onSellerLogout(): void {
    // Clear seller data
    localStorage.removeItem('seller-token');
    localStorage.removeItem('seller-data');

    // Navigate to auth page
    this.router.navigate(['/seller/auth']);

    // Show logout message
    this.showNotification('Logged out successfully!', 'info');
  }

  // Utility Methods
  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): void {
    // Here you would integrate with your notification service
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Search Methods
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}
