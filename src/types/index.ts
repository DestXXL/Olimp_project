import {
  User,
  ApplicantProfile,
  Company,
  Opportunity,
  Tag,
  Application,
  Favorite,
  ProfessionalContact,
  Notification,
  UserRole,
  OpportunityType,
  OpportunityFormat,
  Level,
  EmploymentType,
  OpportunityStatus,
  ApplicationStatus,
  VerificationStatus,
} from '@prisma/client';

// Extended types with relations
export type UserWithProfile = User & {
  applicantProfile?: ApplicantProfile & {
    skills?: { tag: Tag }[];
    projects?: ProjectWithId[];
    experiences?: ExperienceWithId[];
  };
  company?: Company;
};

export type ProjectWithId = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  technologies: string[];
};

export type ExperienceWithId = {
  id: string;
  company: string;
  position: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
};

export type OpportunityWithDetails = Opportunity & {
  company: Company;
  tags: { tag: Tag }[];
  _count?: {
    favorites: number;
    applications: number;
  };
};

export type ApplicationWithDetails = Application & {
  opportunity: Opportunity & {
    company: Company;
  };
  user: User & {
    applicantProfile?: ApplicantProfile;
  };
};

export type FavoriteWithOpportunity = Favorite & {
  opportunity: OpportunityWithDetails;
};

export type ContactWithDetails = ProfessionalContact & {
  sender: User & {
    applicantProfile?: ApplicantProfile;
    company?: Company;
  };
  receiver: User & {
    applicantProfile?: ApplicantProfile;
    company?: Company;
  };
};

// Filter types
export interface OpportunityFilters {
  type?: OpportunityType;
  format?: OpportunityFormat;
  level?: Level;
  employmentType?: EmploymentType;
  city?: string;
  tags?: string[];
  salaryFrom?: number;
  salaryTo?: number;
  search?: string;
  status?: OpportunityStatus;
}

export interface FilterState {
  types: OpportunityType[];
  formats: OpportunityFormat[];
  levels: Level[];
  employmentTypes: EmploymentType[];
  cities: string[];
  tags: string[];
  salaryFrom?: number;
  salaryTo?: number;
  search: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole.applicant | UserRole.employer;
  // Applicant fields
  fullName?: string;
  university?: string;
  faculty?: string;
  course?: string;
  graduationYear?: number;
  city?: string;
  // Employer fields
  companyName?: string;
  inn?: string;
  website?: string;
  description?: string;
  address?: string;
}

export interface OpportunityFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  requirements?: string;
  responsibilities?: string;
  type: OpportunityType;
  format: OpportunityFormat;
  level: Level;
  employmentType: EmploymentType;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  salaryFrom?: number;
  salaryTo?: number;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  tags: string[];
  contacts?: Record<string, string>;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Map types
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: OpportunityType;
  isFavorite: boolean;
}

// Recommendation types
export interface Recommendation {
  opportunity: OpportunityWithDetails;
  score: number;
  reasons: string[];
}

export interface MatchScore {
  score: number;
  breakdown: {
    skills: number;
    level: number;
    location: number;
    format: number;
  };
  explanation: string;
}
