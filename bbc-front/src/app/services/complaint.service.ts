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
    // Use the admin notification endpoint for now since it's the only one available
    return this.http.post<Complaint>(`${this.apiUrl}/admin/notify`, complaint, this.getHttpOptions());
  }

  getComplaintsByCustomer(customerId: number): Observable<ComplaintWithResponses[]> {
    // TODO: This endpoint doesn't exist on backend yet
    // return this.http.get<ComplaintWithResponses[]>(`${this.apiUrl}/customer/${customerId}`, this.getHttpOptions());
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  getComplaintById(id: number): Observable<ComplaintWithResponses> {
    // TODO: This endpoint doesn't exist on backend yet
    // return this.http.get<ComplaintWithResponses>(`${this.apiUrl}/${id}`, this.getHttpOptions());
    return new Observable(observer => {
      observer.next({} as ComplaintWithResponses);
      observer.complete();
    });
  }

  updateComplaint(id: number, complaint: Partial<Complaint>): Observable<Complaint> {
    // TODO: This endpoint doesn't exist on backend yet
    // return this.http.put<Complaint>(`${this.apiUrl}/${id}`, complaint, this.getHttpOptions());
    return new Observable(observer => {
      observer.next({} as Complaint);
      observer.complete();
    });
  }

  // Admin Methods
  getAllComplaints(page: number = 0, size: number = 10, status?: ComplaintStatus, priority?: ComplaintPriority): Observable<any> {
    // TODO: This endpoint doesn't exist on backend yet
    // let params = `page=${page}&size=${size}`;
    // if (status) params += `&status=${status}`;
    // if (priority) params += `&priority=${priority}`;
    // return this.http.get<any>(`${this.apiUrl}/admin?${params}`, this.getHttpOptions());
    return new Observable(observer => {
      observer.next({ content: [], totalElements: 0 });
      observer.complete();
    });
  }

  updateComplaintStatus(id: number, status: ComplaintStatus): Observable<Complaint> {
    // TODO: This endpoint doesn't exist on backend yet
    // return this.http.patch<Complaint>(`${this.apiUrl}/${id}/status`, { status }, this.getHttpOptions());
    return new Observable(observer => {
      observer.next({} as Complaint);
      observer.complete();
    });
  }

  updateComplaintPriority(id: number, priority: ComplaintPriority): Observable<Complaint> {
    // TODO: This endpoint doesn't exist on backend yet
    // return this.http.patch<Complaint>(`${this.apiUrl}/${id}/priority`, { priority }, this.getHttpOptions());
    return new Observable(observer => {
      observer.next({} as Complaint);
      observer.complete();
    });
  }

  // Response Methods
  addComplaintResponse(response: ComplaintResponse): Observable<ComplaintResponse> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next({} as ComplaintResponse);
      observer.complete();
    });
  }

  getComplaintResponses(complaintId: number): Observable<ComplaintResponse[]> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  // Email Notifications
  sendNotificationEmail(complaintId: number, emailType: 'CREATED' | 'RESPONDED' | 'STATUS_CHANGED'): Observable<any> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  // Send email directly to admin when complaint is created
  sendAdminNotification(complaint: Complaint): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/notify`, complaint, this.getHttpOptions());
  }

  // Send confirmation email to customer
  sendCustomerConfirmation(complaintId: number): Observable<any> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  // File Upload
  uploadAttachment(file: File): Observable<any> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next({ url: 'placeholder-url' });
      observer.complete();
    });
  }

  // Statistics for Admin Dashboard
  getComplaintStatistics(): Observable<any> {
    // TODO: This endpoint doesn't exist on backend yet
    return new Observable(observer => {
      observer.next({ total: 0, pending: 0, resolved: 0 });
      observer.complete();
    });
  }
}
