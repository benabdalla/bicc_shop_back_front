import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
getCurrentLanguageFlag() {
throw new Error('Method not implemented.');
}
getCurrentLanguageName() {
throw new Error('Method not implemented.');
}
changeLanguage(arg0: string) {
throw new Error('Method not implemented.');
}
  adminName: string = '';
currentLanguage: any;

  constructor(private router: Router, private adminService: AdminService) {
    this.adminName = adminService.getAdmin().name;
  }

  onAdminLogout(): void {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-jwt');
    this.router.navigate(['admin/auth']);
  }
}
