import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // Existing properties
  name: any;
  email: any;
  address: any;
  emailVerified: boolean = false;
  customer: any;
  verificationCode: any;
  emailVerifiedNotifyModal: boolean = false;

  // Additional properties needed by template
  phone: string = '';
  dateOfBirth: string = '';
  gender: string = '';
  memberSince: string = '';
  totalOrders: number = 0;
  wishlistItems: number = 0;

  constructor(private customerService: CustomerService, private util: UtilService) { }

  ngOnInit(): void {
    const customerData = this.customerService.getCustomer();

    // Safe property access for existing properties
    this.name = customerData?.name || '';
    this.email = customerData?.email || '';
    this.address = customerData?.address || '';

    // Safe property access for additional fields (using any type casting)
    const customerAny = customerData as any;
    this.phone = customerAny?.phone || '';
    this.dateOfBirth = customerAny?.dateOfBirth || '';
    this.gender = customerAny?.gender || '';

    this.getCustomer();
  }

  getCustomer() {
    this.customerService.getCustomer1().subscribe(res => {
      this.customer = res;
      this.emailVerified = res.emailVerified;

      // Safe property access using any type casting
      const resAny = res as any;

      // Update additional fields from server response if available
      if (resAny.phone) this.phone = resAny.phone;
      if (resAny.dateOfBirth) this.dateOfBirth = resAny.dateOfBirth;
      if (resAny.gender) this.gender = resAny.gender;
      if (resAny.memberSince) this.memberSince = this.formatDate(resAny.memberSince);
      if (resAny.totalOrders !== undefined) this.totalOrders = resAny.totalOrders;
      if (resAny.wishlistItems !== undefined) this.wishlistItems = resAny.wishlistItems;
    });
  }

  sendVerificationCode() {
    this.customerService.sendVerificationCode(this.customer).subscribe(res => {
      this.util.toastify(res, "Code de vérification envoyé");
    });
  }

  verifyCode() {
    this.customerService.verifyCode(this.verificationCode).subscribe(res => {
      this.emailVerifiedNotifyModal = res;
      this.util.toastify(res, "Email vérifié", "Code invalide");
      this.getCustomer();
    });
  }

  // Missing methods needed by template
  editField(field: string): void {
    console.log(`Editing field: ${field}`);
    this.util.toastify(true, `Modification de ${field} - Fonctionnalité à implémenter`);
  }

  editProfile(): void {
    console.log('Edit profile clicked');
    this.util.toastify(true, "Modification du profil - Fonctionnalité à implémenter");
  }

  changePassword(): void {
    console.log('Change password clicked');
    this.util.toastify(true, "Changement de mot de passe - Fonctionnalité à implémenter");
  }

  downloadData(): void {
    const userData = {
      name: this.name,
      email: this.email,
      address: this.address,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      memberSince: this.memberSince,
      totalOrders: this.totalOrders,
      wishlistItems: this.wishlistItems,
      emailVerified: this.emailVerified,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
    this.util.toastify(true, "Données téléchargées avec succès");
  }

  deactivateAccount(): void {
    if (!this.emailVerified) {
      this.openVerificationModal();
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir désactiver votre compte ? Cette action est irréversible.')) {
      console.log('Deactivate account confirmed');
      this.util.toastify(true, "Désactivation du compte - Fonctionnalité à implémenter");
    }
  }

  openVerificationModal(): void {
    try {
      const modalElement = document.getElementById('verificationModal');
      if (modalElement) {
        if ((window as any).bootstrap) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();
        } else {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          document.body.classList.add('modal-open');

          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
        }
      }
    } catch (error) {
      console.error('Error opening verification modal:', error);
      this.util.toastify(false, '', 'Erreur lors de l\'ouverture de la modal');
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return dateString;
    }
  }

  closeVerificationModal(): void {
    try {
      const modalElement = document.getElementById('verificationModal');
      if (modalElement) {
        if ((window as any).bootstrap) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        } else {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');

          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      }
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  }

  getDisplayValue(value: any, fallback: string = 'Non renseigné'): string {
    return value || fallback;
  }
}
