export interface Portfolio {
  name: string;
  bio: string;
  portraitUrl: string;
  experiences: Experience[];
  certifications: Certification[];
  hobbies: Hobby[];
  skills: string[];
  currentWorks: CurrentWork[];
  socialLinks: SocialLinks;
}

export interface Experience {
  title: string;
  description: string[];
  period: string;
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

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  youtube: string;
  instagram: string;
  email: string;
}
