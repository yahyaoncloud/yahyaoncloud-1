export interface Portfolio {
  name: string;
  bio: string;
  portraitUrl: string;
  location?: string;
  experiences: Experience[];
  certifications: Certification[];
  hobbies: Hobby[];
  skills: string[] | { [key: string]: string[] };
  currentWorks: CurrentWork[];
  projects: Project[];
  socialLinks: Partial<SocialLinks>;
}

export interface Experience {
  title: string;
  description: string[];
  period: string;
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
  url: string;
  imageUrl: string;
  duration: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  youtube: string;
  instagram: string;
  email: string;
}
