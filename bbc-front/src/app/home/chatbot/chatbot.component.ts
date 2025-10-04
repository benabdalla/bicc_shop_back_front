import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/app/environment.prod';


interface Msg {
  sender: 'You' | 'Bot';
  text: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatBotComponent {
  opened = false;
  draft = '';
  isTyping = false;
  private model: any;

  messages: Msg[] = [{
    sender: 'Bot',
    text: `👋 Welcome to BICC Shop! I am your AI shopping assistant powered by Google Gemini.

How can I assist you today?`,
    timestamp: new Date()
  }];

  @ViewChild('scrollBox') scrollBox!: ElementRef<HTMLDivElement>;

  // BICC Shop context for AI responses
  private shopContext = `
You are a helpful AI assistant for BICC Shop, an e-commerce platform.
`;
  genAI: GoogleGenerativeAI | undefined;

  constructor(private http: HttpClient) {
    // Initialize Gemini AI
    if (environment.geminiApiKey && environment.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({model: 'gemini-2.5-flash'}); // or 'gemini-1.5'
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
      }
    } else {
      console.warn('⚠️ Gemini API key not found. Using fallback responses.');
    }
  }

  open() {
    this.opened = true;
    this.scrollDown();
  }

  close() {
    this.opened = false;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async send() {
    const text = this.draft.trim();
    if (!text) return;

    // Add user message
    this.messages.push({
      sender: 'You',
      text: text,
      timestamp: new Date()
    });
    this.draft = '';
    this.scrollDown();

    // Show typing indicator
    this.isTyping = true;

    try {
      let reply: string;

      if (this.model && environment.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        // Use Gemini AI
        reply = await this.askGemini(text);
      } else {
        // Fallback to predefined responses
        reply = this.generateFallbackResponse(text);
      }

      // Add bot response with slight delay for realism
      setTimeout(() => {
        this.messages.push({
          sender: 'Bot',
          text: reply,
          timestamp: new Date()
        });
        this.isTyping = false;
        this.scrollDown();
      }, 1000 + Math.random() * 1000); // 1-2 second delay

    } catch (error) {
      console.error('Error generating response:', error);

      // Fallback response on error
      setTimeout(() => {
        this.messages.push({
          sender: 'Bot',
          text: "I'm sorry, I'm having trouble connecting right now. Let me help you with a standard response, or you can contact our support team at support@BICCshop.com 📧",
          timestamp: new Date()
        });
        this.isTyping = false;
        this.scrollDown();
      }, 1000);
    }
  }

  private async askGemini(prompt: string): Promise<string> {
    try {
      const fullPrompt = `${this.shopContext}

Customer message: "${prompt}"

Please provide a helpful response as a BICC Shop customer service assistant:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return text || this.generateFallbackResponse(prompt);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error; // Re-throw to trigger fallback in send()
    }
  }

  private generateFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    // Greeting detection
    if (this.containsKeywords(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'bonjour'])) {
      return "Hello! 👋 Welcome to BICC Shop! I'm here to help you with all your shopping needs. What can I assist you with today?";
    }

    // Product inquiries
    if (this.containsKeywords(message, ['product', 'item', 'buy', 'purchase', 'catalog', 'what do you have', 'what do you sell', 'shopping'])) {
      return "We have a fantastic range of products including electronics 📱, clothing 👕, home goods 🏠, and much more! You can browse our categories or use the search function. What specific type of product are you looking for?";
    }

    // Shipping inquiries
    if (this.containsKeywords(message, ['shipping', 'delivery', 'ship', 'deliver', 'how long', 'when will', 'tracking', 'livraison'])) {
      return "We offer several shipping options: 📦\n• Standard shipping (5-7 business days)\n• Express shipping (2-3 business days)\n• Free shipping on orders over $50!\n\nWhere would you like your order delivered?";
    }

    // Return policy
    if (this.containsKeywords(message, ['return', 'refund', 'exchange', 'send back', 'policy', 'remboursement'])) {
      return "Our return policy is customer-friendly! 😊\n• 30-day return window\n• Items must be in original condition\n• Easy return process through your account\n• Full refunds available\n\nNeed help with a specific return?";
    }

    // Account related
    if (this.containsKeywords(message, ['account', 'profile', 'login', 'register', 'sign up', 'sign in', 'compte'])) {
      return "Creating an account makes shopping easier! 🎯\n• Save your favorite items\n• Track your orders\n• Faster checkout\n• Exclusive member offers\n\nWould you like help setting up your account?";
    }

    // Order inquiries
    if (this.containsKeywords(message, ['order', 'my order', 'order status', 'track order', 'where is my', 'commande'])) {
      return "I can help you track your order! 📍\n• Log into your account and go to 'My Orders'\n• Use your order number for quick tracking\n• Email notifications for status updates\n\nDo you have your order number handy?";
    }

    // Support requests
    if (this.containsKeywords(message, ['help', 'support', 'contact', 'customer service', 'talk to human', 'aide'])) {
      return "I'm here to help! 🤝 For additional support:\n• Email: support@BICCshop.com\n• Live chat available 24/7\n• Phone support during business hours\n\nWhat specific issue can I help you with?";
    }

    // Price/discount inquiries
    if (this.containsKeywords(message, ['price', 'cost', 'discount', 'sale', 'offer', 'promotion', 'coupon', 'prix', 'promo'])) {
      return "Great news about savings! 💰\n• Regular sales and promotions\n• Member exclusive discounts\n• Free shipping over $50\n• Sign up for our newsletter for special offers\n\nLooking for deals on something specific?";
    }

    // Default response
    return "Thank you for reaching out! 😊 I'm here to help with:\n• Product information\n• Orders and shipping\n• Returns and refunds\n• Account assistance\n\nCould you tell me more about what you need help with?";
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private scrollDown() {
    setTimeout(() => {
      const el = this.scrollBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // Quick response buttons
  sendQuickResponse(message: string) {
    this.draft = message;
    this.send();
  }

  getQuickResponses(): string[] {
    return [
      "What products do you have?",
      "How can I track my order?",
      "What are your shipping options?",
      "What is your return policy?",
      "Do you have any discounts?",
      "How do I create an account?",
      "Tell me about BICC Shop",
      "Contact customer support"
    ];
  }

  // Check if AI is available
  isAIAvailable(): boolean {
    return !!(this.model && environment.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE');
  }

  // Get AI status for display
  getAIStatus(): string {
    return this.isAIAvailable() ? '🤖 AI-Powered by Gemini' : '🛍️ BICC Shop Assistant';
  }
}

