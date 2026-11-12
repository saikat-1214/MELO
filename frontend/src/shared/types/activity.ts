export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface HostSummary {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  general_location?: string | null;
  age?: number | null;
  bio?: string | null;
}

export interface ParticipantSummary {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  general_location?: string | null;
  role: 'HOST' | 'CO_HOST' | 'MEMBER' | string;
  joined_at: string;
}

export interface ActivitySummary {
  id: string;
  title: string;
  description: string;
  city: string;
  location_landmark: string;
  approx_latitude?: number | null;
  approx_longitude?: number | null;
  start_time: string;
  end_time: string;
  min_participants: number;
  max_participants: number;
  status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CANCELLED' | 'COMPLETED' | string;
  rules?: string | null;
  created_at: string;
  category: CategorySummary;
  host: HostSummary;
  participant_count: number;
  spots_left: number;
  viewer_status: 'HOST' | 'MEMBER' | 'PENDING_REQUEST' | 'NONE' | string;
}

export interface ActivityDetail extends ActivitySummary {
  participants: ParticipantSummary[];
}

export interface ActivityListResponse {
  items: ActivitySummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RequesterSummary {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  general_location?: string | null;
  age?: number | null;
  bio?: string | null;
  interests: string[];
}

export interface JoinRequest {
  id: string;
  activity_id: string;
  activity_title?: string | null;
  requester: RequesterSummary;
  note?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | string;
  created_at: string;
  reviewed_at?: string | null;
}

export interface MyActivitiesOverview {
  hosting: ActivitySummary[];
  joined: ActivitySummary[];
  pending_requests: JoinRequest[];
}

