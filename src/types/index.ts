export interface College {
  id: number;
  name: string;
  slug: string;
  location: string;
  feesPerYear: number;
  calculatedFee?: number;
  appliedCategory?: string;
  averagePlacement: number;
  highestPlacement: number;
  rating: number;
}

export interface CollegesResponse {
  colleges: College[];
  meta: { totalCount: number; totalPages: number; currentPage: number };
}

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export type PredictStatus = "SAFE" | "TARGET" | "REACH";

export interface PredictResult {
  college: College;
  status: PredictStatus;
  closingRank: number;
  category: string;
}

export interface PredictResponse {
  examType: string;
  branch: string;
  rank: number;
  category: string;
  results: PredictResult[];
  meta: { totalMatches: number };
}

export interface ReviewUser {
  name: string | null;
  email: string;
}

export interface Review {
  id: number;
  collegeId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewsResponse {
  reviews: Review[];
}
