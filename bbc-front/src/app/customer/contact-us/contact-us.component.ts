import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { ComplaintService } from 'src/app/services/complaint.service';
import { CustomerService } from 'src/app/services/customer.service';
import { AdminService } from 'src/app/services/admin.service';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
} from 'src/app/interfaces/complaint';
import { Customer } from 'src/app/interfaces/customer';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
})
export class ContactUsComponent implements OnInit {
  complaintForm: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  selectedFiles: File[] = [];
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ];

  // Admin support emails
  adminSupportEmails: string[] = [];
  primarySupportEmail = 'support@yourstore.com'; // Default fallback

  complaintCategories = [
    { value: ComplaintCategory.PRODUCT_ISSUE, label: 'Product Issue' },
    { value: ComplaintCategory.DELIVERY_ISSUE, label: 'Delivery Issue' },
  ];
  complaintPriorities = [
    { value: ComplaintPriority.LOW, label: 'Low', color: 'success' },
    { value: ComplaintPriority.MEDIUM, label: 'Medium', color: 'warning' },
    { value: ComplaintPriority.HIGH, label: 'High', color: 'danger' },
    { value: ComplaintPriority.URGENT, label: 'Urgent', color: 'dark' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private complaintService: ComplaintService,
    private customerService: CustomerService,
    private adminService: AdminService,
    private router: Router,
    private toast: NgToastService
  ) {
    this.complaintForm = this.formBuilder.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerAddress: [''],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: [ComplaintCategory.PRODUCT_ISSUE, [Validators.required]],
      priority: [ComplaintPriority.MEDIUM, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Auto-fill customer info if logged in
    this.loadCustomerInfo();
    // Load admin support emails
    this.loadAdminSupportEmails();
  }

  loadCustomerInfo(): void {
    // First try to get customer data from localStorage (customer-token)
    const customerTokenInfo = localStorage.getItem('customer-token');
    if (customerTokenInfo) {
      const customer = JSON.parse(customerTokenInfo);
      this.complaintForm.patchValue({
        customerName: customer.name || '',
        customerEmail: customer.email || '',
        customerAddress: customer.address || '',
      });

      // Also try to get fresh data from server to ensure we have latest info
      this.loadFreshCustomerData();
    } else {
      // Fallback to old customer storage method
      const customerInfo = localStorage.getItem('customer');
      if (customerInfo) {
        const customer = JSON.parse(customerInfo);
        this.complaintForm.patchValue({
          customerName: customer.name || '',
          customerEmail: customer.email || '',
          customerAddress: customer.address || '',
        });
      }
    }
  }

  private loadFreshCustomerData(): void {
    try {
      this.customerService.getCustomer1().subscribe({
        next: (customer: Customer) => {
          if (customer) {
            // Update form with fresh server data
            this.complaintForm.patchValue({
              customerName: customer.name || '',
              customerEmail: customer.email || '',
              customerAddress: customer.address || '',
            });

            console.log('Customer data loaded:', {
              name: customer.name,
              email: customer.email,
              address: customer.address,
            });
          }
        },
        error: (error) => {
          console.warn('Could not load fresh customer data:', error);
          // Form will keep the localStorage data, which is fine
        },
      });
    } catch (error) {
      console.warn('Error loading customer data:', error);
    }
  }

  private loadAdminSupportEmails(): void {
    try {
      this.adminService.getSupportEmails().subscribe({
        next: (emails: string[]) => {
          if (emails && emails.length > 0) {
            this.adminSupportEmails = emails;
            this.primarySupportEmail = emails[0]; // Use first admin email as primary

            console.log('Admin support emails loaded:', emails);
          } else {
            // Fallback to default
            this.adminSupportEmails = [this.primarySupportEmail];
          }
        },
        error: (error) => {
          console.warn('Could not load admin support emails:', error);
          // Use fallback emails
          this.adminSupportEmails = [
            this.primarySupportEmail,
            'admin@yourstore.com',
          ];
        },
      });
    } catch (error) {
      console.warn('Error loading admin support emails:', error);
      // Use fallback emails
      this.adminSupportEmails = [
        this.primarySupportEmail,
        'admin@yourstore.com',
      ];
    }
  }

  get f() {
    return this.complaintForm.controls;
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById(
      'attachments'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [];
    this.errorMessage = '';

    for (let file of files) {
      if (file.size > this.maxFileSize) {
        this.errorMessage = `File ${file.name} is too large. Maximum size is 5MB.`;
        continue;
      }

      if (!this.allowedFileTypes.includes(file.type)) {
        this.errorMessage = `File ${file.name} has an unsupported format.`;
        continue;
      }

      this.selectedFiles.push(file);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.complaintForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;

    try {
      const attachmentUrls = await this.uploadFiles();
      const complaint = this.createComplaintObject(attachmentUrls);
      const response = await this.submitComplaint(complaint);
      if (
        response &&
        typeof response === 'object' &&
        (response as any).message
      ) {
        await this.sendNotificationEmails(complaint);
        this.handleSuccessfulSubmission();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      this.handleSubmissionError(error);
    } finally {
      this.loading = false;
    }
  }

  private async uploadFiles(): Promise<string[]> {
    const attachmentUrls: string[] = [];

    for (let file of this.selectedFiles) {
      try {
        const uploadResponse = await this.complaintService
          .uploadAttachment(file)
          .toPromise();
        if (uploadResponse?.url) {
          attachmentUrls.push(uploadResponse.url);
        }
      } catch (uploadError) {
        console.warn(`Failed to upload file ${file.name}:`, uploadError);
      }
    }

    return attachmentUrls;
  }

  private createComplaintObject(attachmentUrls: string[]): Complaint {
    return {
      customerId: this.getCustomerId(),
      customerName: this.f['customerName'].value.trim(),
      customerEmail: this.f['customerEmail'].value.trim().toLowerCase(),
      customerAddress: this.f['customerAddress'].value?.trim() || '',
      subject: this.f['subject'].value.trim(),
      description: this.f['description'].value.trim(),
      category: this.f['category'].value,
      priority: this.f['priority'].value,
      status: 'PENDING' as any,
      attachments: attachmentUrls,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async submitComplaint(
    complaint: Complaint
  ): Promise<{ message: string }> {
    console.log('Submitting complaint:', complaint);
    const response = await this.complaintService
      .createComplaint(complaint)
      .toPromise();
    if (!response) {
      throw new Error('No response received from server');
    }
    console.log('Complaint created successfully:', response);
    return response as unknown as { message: string };
  }

  private async sendNotificationEmails(complaint: Complaint): Promise<void> {
    try {
      await this.complaintService.sendAdminNotification(complaint).toPromise();
      console.log('Admin notification sent');
    } catch (emailError) {
      console.warn('Email notification failed:', emailError);
    }
  }

  private handleSuccessfulSubmission(): void {
    this.successMessage = `Votre plainte a été soumise avec succès !
    Vous recevrez un email de confirmation sous peu.
    Un administrateur examinera votre plainte et vous répondra dans les 24 à 48 heures.`;

    // Show success toast
    this.toast.success({
      detail: 'Plainte soumise avec succès !',
      summary: `Votre plainte a été reçue. Vous recevrez bientôt un email de confirmation.`,
      duration: 6000,
    });

    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private handleSubmissionError(error: any): void {
    console.error('Complaint submission error:', error);

    const errorMessages: { [key: number]: string } = {
      0: 'Unable to connect to the server. Please check your internet connection and try again.',
      400:
        error.error?.message ||
        'Invalid form data. Please check your entries and try again.',
      401: 'You must be logged in to submit a complaint. Please log in and try again.',
      500: 'Server error occurred. Please try again later or contact support.',
    };

    this.errorMessage =
      errorMessages[error.status] ||
      error.error?.message ||
      'An error occurred while submitting your complaint. Please try again.';

    // Show error toast
    this.toast.error({
      detail: 'Complaint Submission Failed',
      summary: this.errorMessage,
      duration: 8000,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private resetForm(): void {
    this.complaintForm.reset();
    this.selectedFiles = [];
    this.submitted = false;
    this.loadCustomerInfo();
  }

  private getCustomerId(): number {
    // First try customer-token (newer method)
    const customerTokenInfo = localStorage.getItem('customer-token');
    if (customerTokenInfo) {
      try {
        const customer = JSON.parse(customerTokenInfo);
        return customer.id || 0;
      } catch (error) {
        console.warn('Error parsing customer-token:', error);
      }
    }

    // Fallback to older customer storage method
    const customerInfo = localStorage.getItem('customer');
    if (customerInfo) {
      try {
        const customer = JSON.parse(customerInfo);
        return customer.id || 0;
      } catch (error) {
        console.warn('Error parsing customer info:', error);
      }
    }

    // Last resort: try to get from customerService
    try {
      const customer = this.customerService.getCustomer();
      return customer.id || 0;
    } catch (error) {
      console.warn('Error getting customer from service:', error);
    }

    return 0;
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return 'bi-file-earmark-image';
    if (file.type === 'application/pdf') return 'bi-file-earmark-pdf';
    return 'bi-file-earmark-text';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
