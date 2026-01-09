export enum Tab {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  CALCULATOR = 'CALCULATOR'
}

export interface Service {
  title: string;
  description: string;
  iconName: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  business?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}