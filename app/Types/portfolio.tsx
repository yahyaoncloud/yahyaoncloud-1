export interface Portfolio {
  name: string;
  bio: string;
  portraitUrl: string;
  experiences: Experience[];
  certifications: Certification[];
  hobbies: Hobby[];
  currentWorks: CurrentWork[];
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
