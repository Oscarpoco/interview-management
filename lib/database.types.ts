export interface Profile {
  id: string
  email: string
  full_name: string | null
  professional_title: string | null
  employment_status: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  company_name: string
  interview_date: string
  interviewer_name: string
  job_position: string
  priority_level: "High" | "Medium" | "Low"
  status: "Pending" | "Passed" | "Failed" | "No Feedback"
  created_at: string
  updated_at: string
}

export interface InsertInterview {
  user_id: string
  company_name: string
  interview_date: string
  interviewer_name: string
  job_position: string
  priority_level: "High" | "Medium" | "Low"
  status?: "Pending" | "Passed" | "Failed" | "No Feedback"
}

export interface UpdateInterview {
  company_name?: string
  interview_date?: string
  interviewer_name?: string
  job_position?: string
  priority_level?: "High" | "Medium" | "Low"
  status?: "Pending" | "Passed" | "Failed" | "No Feedback"
  updated_at?: string
}
