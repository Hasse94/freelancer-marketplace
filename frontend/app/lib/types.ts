// Mirrors the FastAPI response schemas in app/schemas.py

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface FreelancerProfile {
  id: number;
  user_id: number;
  bio: string | null;
  skills: string | null;
  hourly_rate: number | null;
  created_at: string;
}

export interface ClientProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  created_at: string;
}

export interface Job {
  id: number;
  client_id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  is_open: boolean;
  created_at: string;
}

export interface Bid {
  id: number;
  freelancer_id: number;
  job_id: number;
  proposal: string;
  bid_amount: number;
  is_accepted: boolean;
  created_at: string;
}

// Claude returns freelancer_id + match_score; extra fields are optional
// in case the model echoes profile info back.
export interface FreelancerMatch {
  freelancer_id: number;
  match_score: number;
  name?: string;
  skills?: string;
  hourly_rate?: number;
  reason?: string;
}

export interface MatchingResponse {
  job_id: number;
  job_title?: string;
  matches: FreelancerMatch[];
}

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface Payment {
  id: number;
  bid_id: number;
  client_id: number;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentIntentResponse {
  payment_id: number;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
