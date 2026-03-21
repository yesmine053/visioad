export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  details?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

export interface Stat {
  id: number;
  value: string;
  label: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  phone: string;
  message: string;
}