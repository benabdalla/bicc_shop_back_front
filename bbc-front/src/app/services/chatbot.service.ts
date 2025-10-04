import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private readonly API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private isChatOpenSubject = new BehaviorSubject<boolean>(false);
  public isChatOpen$ = this.isChatOpenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeChat();
  }

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      text: "Bonjour ! 👋 Bienvenue sur BICC Shop ! Je suis votre assistant(e) d'achat. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
    };
    this.messagesSubject.next([welcomeMessage]);
  }

  sendMessage(userMessage: string): Observable<any> {
    // Add user message
    const userMsg: ChatMessage = {
      id: this.generateId(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add typing indicator
    const typingMsg: ChatMessage = {
      id: this.generateId(),
      text: 'Rédaction en cours...',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true,
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMsg, typingMsg]);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      contents: [
        {
          parts: [
            {
              text: this.formatPrompt(userMessage),
            },
          ],
        },
      ],
    };

    return new Observable((observer) => {
      this.http
        .post<GeminiResponse>(`${this.API_URL}?key=${this.API_KEY}`, body, {
          headers,
        })
        .subscribe({
          next: (response) => {
            this.handleBotResponse(response);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Chatbot API error:', error);
            this.handleError();
            observer.error(error);
          },
        });
    });
  }

  private formatPrompt(userMessage: string): string {
    return `Tu es un(e) assistant(e) d'achat e-commerce pour BICC Shop.
    Tu aides les clients à :
    - Trouver des produits et faire des recommandations
    - Suivre et comprendre le statut de leurs commandes
    - Répondre aux questions sur la livraison
    - Aider pour le paiement et la facturation
    - Expliquer les politiques de retour et de remboursement
    - Fournir une assistance générale pour le shopping

    Merci de répondre de façon utile, amicale et concise.
    Si tu ne connais pas la réponse exacte, invite poliment le client à contacter le support.

    Question de l'utilisateur : ${userMessage}`;
  }

  private handleBotResponse(response: GeminiResponse): void {
    const currentMessages = this.messagesSubject.value;
    // Remove typing indicator
    const messagesWithoutTyping = currentMessages.filter(
      (msg) => !msg.isTyping
    );

    const botText =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Désolé, je n'ai pas pu traiter cette demande. Veuillez réessayer.";

    const botMessage: ChatMessage = {
      id: this.generateId(),
      text: botText,
      sender: 'bot',
      timestamp: new Date(),
    };

    this.messagesSubject.next([...messagesWithoutTyping, botMessage]);
  }

  private handleError(): void {
    const currentMessages = this.messagesSubject.value;
    const messagesWithoutTyping = currentMessages.filter(
      (msg) => !msg.isTyping
    );

    const errorMessage: ChatMessage = {
      id: this.generateId(),
      text: 'Désolé, je rencontre un problème de connexion. Veuillez réessayer plus tard ou contacter notre support.',
      sender: 'bot',
      timestamp: new Date(),
    };

    this.messagesSubject.next([...messagesWithoutTyping, errorMessage]);
  }

  toggleChat(): void {
    this.isChatOpenSubject.next(!this.isChatOpenSubject.value);
  }

  closeChat(): void {
    this.isChatOpenSubject.next(false);
  }

  openChat(): void {
    this.isChatOpenSubject.next(true);
  }

  clearChat(): void {
    this.initializeChat();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
