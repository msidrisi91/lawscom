export type UserMode = "advocate" | "citizen";

export interface RelatedSection {
  act: string;
  section: string;
}

export interface SummaryCard {
  id: string;
  court_name: string;
  category: string;
  headline: string;
  advocate_summary: string;
  citizen_summary: string;
  ratio_decidendi?: string;
  holding?: string;
  citation?: string;
  bench?: string;
  related_sections: RelatedSection[];
  status: string;
  confidence_score: number;
  audio_url?: string;
  pdf_url?: string;
  is_breaking: boolean;
  views_count: number;
  shares_count: number;
  published_at?: string;
}

export interface StatuteSection {
  act_name: string;
  short_code: string;
  section_number: string;
  title: string;
  bare_act_text: string;
  layman_explanation: string;
}

export interface DailyLaw {
  id: string;
  date: string;
  topic: string;
  headline: string;
  explanation: string;
  practical_tip: string;
  statute_reference?: string;
  quiz_question?: string;
  quiz_options: string[];
  correct_option_index: number;
}
