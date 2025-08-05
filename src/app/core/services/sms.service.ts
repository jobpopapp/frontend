
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = '/api/sms'; // Adjust if your API endpoint is different

  constructor(private http: HttpClient) { }

  sendSms(phoneNumber: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-sms`, { phoneNumber, message });
  }

  sendNewCompanyNotification(name: string, phone: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-new-company-notification`, { name, phone, email });
  }

  sendDocumentUploadNotification(companyName: string, documentName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-document-upload-notification`, { companyName, documentName });
  }
}
