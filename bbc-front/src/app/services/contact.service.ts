import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactForm {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/complaints/admin/notify';

  constructor(private http: HttpClient) {}

  sendContactForm(form: ContactForm): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Transform data to match backend expectations
    const payload = {
      customerName: form.nom,
      customerEmail: form.email,
      subject: form.sujet,
      description: form.message
    };

    return this.http.post<any>(this.apiUrl, payload, { headers });
  }
}
