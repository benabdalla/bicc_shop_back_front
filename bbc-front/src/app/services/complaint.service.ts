import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintResponse, ComplaintWithResponses, ComplaintStatus, ComplaintPriority } from '../interfaces/complaint';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = 'http://localhost:8080/api/complaints';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // Customer Methods
  createComplaint(complaint: Complaint): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.apiUrl}`, complaint, this.getHttpOptions());
  }

  getComplaintsByCustomer(customerId: number): Observable<ComplaintWithResponses[]> {
    return this.http.get<ComplaintWithResponses[]>(`${this.apiUrl}/customer/${customerId}`, this.getHttpOptions());
  }

  getComplaintById(id: number): Observable<ComplaintWithResponses> {
    return this.http.get<ComplaintWithResponses>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  updateComplaint(id: number, complaint: Partial<Complaint>): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.apiUrl}/${id}`, complaint, this.getHttpOptions());
  }

  // Admin Methods
  getAllComplaints(page: number = 0, size: number = 10, status?: ComplaintStatus, priority?: ComplaintPriority): Observable<any> {
    let params = `page=${page}&size=${size}`;
    if (status) params += `&status=${status}`;
    if (priority) params += `&priority=${priority}`;

    return this.http.get<any>(`${this.apiUrl}/admin?${params}`, this.getHttpOptions());
  }

  updateComplaintStatus(id: number, status: ComplaintStatus): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.apiUrl}/${id}/status`, { status }, this.getHttpOptions());
  }

  updateComplaintPriority(id: number, priority: ComplaintPriority): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.apiUrl}/${id}/priority`, { priority }, this.getHttpOptions());
  }

  // Response Methods
  addComplaintResponse(response: ComplaintResponse): Observable<ComplaintResponse> {
    return this.http.post<ComplaintResponse>(`${this.apiUrl}/responses`, response, this.getHttpOptions());
  }

  getComplaintResponses(complaintId: number): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.apiUrl}/${complaintId}/responses`, this.getHttpOptions());
  }

  // Email Notifications
  sendNotificationEmail(complaintId: number, emailType: 'CREATED' | 'RESPONDED' | 'STATUS_CHANGED'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${complaintId}/notify`, { emailType }, this.getHttpOptions());
  }

  // Send email directly to admin when complaint is created
  sendAdminNotification(complaint: Complaint): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/notify`, complaint, this.getHttpOptions());
  }

  // Send confirmation email to customer
  sendCustomerConfirmation(complaintId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${complaintId}/confirm`, {}, this.getHttpOptions());
  }

  // File Upload
  uploadAttachment(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
  }

  // Statistics for Admin Dashboard
  getComplaintStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistics`, this.getHttpOptions());
  }
}
