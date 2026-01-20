export interface Portfolio {
  _id?: string; // Optional, as MongoDB adds this
  name: string;
  bio: string[];
  portraitUrl: string;
  location?: string;
  contact?: {
    phone: string;
    email: string;
    linkedin: string;
  };
  title?: string;
  skills: { [key: string]: string[] }; // Object with string arrays, not a union with string[]
  experiences: Experience[];
  certifications: Certification[];
  hobbies: Hobby[];
  currentWorks: CurrentWork[];
  projects: Project[];
  education?: {
    degree: string;
    institution: string;
    courses: string[];
  };
  achievements?: Achievement[];
  socialLinks: Partial<SocialLinks>;
  createdAt?: string | Date; // MongoDB stores as Date, but may be string in JSON
  updatedAt?: string | Date;
}

export interface Experience {
  title: string;
  role: string;
  year: string;
  isWorking: number;
  company: string;
  description: string[];
  location: string;
  period: string;
  location: string;
  summary: string;
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

export interface Hobby {
  name: string;
  description: string;
}

export interface CurrentWork {
  title: string;
  description: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[]; // Added to match MongoDB document
  url: string;
  imageUrl: string; // Changed from image to imageUrl to match MongoDB
  duration: string;
}

export interface Achievement {
  title: string;
  organizer: string;
  description: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;b
  twitter: string;
  youtube: string;
  instagram: string;
  email: string;
}