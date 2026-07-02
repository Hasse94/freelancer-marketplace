import axios, { AxiosError } from "axios";
import type {
  Bid,
  ClientProfile,
  FreelancerProfile,
  Job,
  MatchingResponse,
  Payment,
  PaymentIntentResponse,
  TokenResponse,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const TOKEN_KEY = "fm_access_token";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** Extract a human-readable message from a FastAPI error response. */
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: unknown }>;
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // Pydantic validation errors: [{ loc, msg, type }]
      return detail
        .map((d) => (typeof d?.msg === "string" ? d.msg : JSON.stringify(d)))
        .join(", ");
    }
    if (err.response) {
      return `Request failed (${err.response.status})`;
    }
    return "Cannot reach the server. Is the API running?";
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

// Auth

export async function login(email: string, password: string): Promise<TokenResponse> {
  // FastAPI's OAuth2PasswordRequestForm expects form-encoded username/password
  const body = new URLSearchParams({ username: email, password });
  const { data } = await api.post<TokenResponse>("/api/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function register(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>("/api/auth/register", { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

// Profiles

export async function getMyClientProfile(): Promise<ClientProfile> {
  const { data } = await api.get<ClientProfile>("/api/users/client/me");
  return data;
}

export async function getMyFreelancerProfile(): Promise<FreelancerProfile> {
  const { data } = await api.get<FreelancerProfile>("/api/users/freelancer/me");
  return data;
}

export async function createClientProfile(companyName: string): Promise<ClientProfile> {
  const { data } = await api.post<ClientProfile>("/api/users/client", {
    company_name: companyName || null,
  });
  return data;
}

export async function createFreelancerProfile(input: {
  bio: string;
  skills: string;
  hourly_rate: number | null;
}): Promise<FreelancerProfile> {
  const { data } = await api.post<FreelancerProfile>("/api/users/freelancer", {
    bio: input.bio || null,
    skills: input.skills || null,
    hourly_rate: input.hourly_rate,
  });
  return data;
}

// Jobs

export async function getJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>("/api/jobs/");
  return data;
}

export async function getJob(jobId: number): Promise<Job> {
  const { data } = await api.get<Job>(`/api/jobs/${jobId}`);
  return data;
}

export async function getMyJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>("/api/jobs/my/jobs");
  return data;
}

export async function createJob(input: {
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
}): Promise<Job> {
  const { data } = await api.post<Job>("/api/jobs/", input);
  return data;
}

export async function closeJob(jobId: number): Promise<Job> {
  const { data } = await api.patch<Job>(`/api/jobs/${jobId}/close`);
  return data;
}

// Bids

export async function submitBid(
  jobId: number,
  input: { proposal: string; bid_amount: number }
): Promise<Bid> {
  const { data } = await api.post<Bid>(`/api/bids/${jobId}`, input);
  return data;
}

export async function getBidsForJob(jobId: number): Promise<Bid[]> {
  const { data } = await api.get<Bid[]>(`/api/bids/job/${jobId}`);
  return data;
}

export async function getMyBids(): Promise<Bid[]> {
  const { data } = await api.get<Bid[]>("/api/bids/my/bids");
  return data;
}

export async function acceptBid(bidId: number): Promise<Bid> {
  const { data } = await api.post<Bid>(`/api/bids/${bidId}/accept`);
  return data;
}

// AI matching

export async function getMatchingFreelancers(jobId: number): Promise<MatchingResponse> {
  const { data } = await api.get<MatchingResponse>(
    `/api/matching/job/${jobId}/matching-freelancers`
  );
  return data;
}

export async function getFreelancerByUserId(userId: number): Promise<FreelancerProfile> {
  const { data } = await api.get<FreelancerProfile>(`/api/users/freelancer/${userId}`);
  return data;
}

// Payments

export async function getPaymentHistory(): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>("/api/payments/history");
  return data;
}

export async function createPaymentIntent(bidId: number): Promise<PaymentIntentResponse> {
  const { data } = await api.post<PaymentIntentResponse>(
    "/api/payments/create-intent",
    { bid_id: bidId }
  );
  return data;
}
