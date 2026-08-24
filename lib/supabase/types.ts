// Hand-written to match supabase/schema.sql exactly (no Supabase CLI
// available to generate these). Update both files together.

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BiasLabel = "left" | "center" | "right" | "mixed" | "unclear";
export type LogLevel = "info" | "warn" | "error";

/** One row returned by `public.match_related_articles` (schema.sql section 7). */
export type RelatedArticleRow = {
  article_id: string;
  title: string;
  image_url: string;
  published_at: string;
  source_name: string;
  sentiment_label: SentimentLabel;
  bias_label: BiasLabel;
  left_percentage: number;
  center_percentage: number;
  right_percentage: number;
  confidence: number;
  /** Cosine similarity, `1 - (embedding <=> query)`. Not displayed in the UI. */
  similarity: number;
};

export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          listing_url: string;
          parser_strategy: string | null;
          is_active: boolean;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          listing_url: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          original_url: string;
          canonical_url: string;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at: string;
          analyzed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          original_url: string;
          canonical_url: string;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      article_analyses: {
        Row: {
          id: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_score: number;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes: string | null;
          loaded_terms: string[];
          disclaimer: string;
          model: string;
          created_at: string;
          /**
           * PostgREST serializes a `vector` column as its text literal
           * (`"[0.1,0.2,...]"`), never as a JSON array.
           */
          embedding: string | null;
        };
        Insert: {
          id?: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_score: number;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes?: string | null;
          loaded_terms?: string[];
          disclaimer: string;
          model: string;
          created_at?: string;
          /** Accepts the same text literal on write; `number[]` is normalized first. */
          embedding?: number[] | string | null;
        };
        Update: Partial<Database["public"]["Tables"]["article_analyses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "article_analyses_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: true;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      logs: {
        Row: {
          id: string;
          level: LogLevel;
          message: string;
          context: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: LogLevel;
          message: string;
          context?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["logs"]["Insert"]>;
        Relationships: [];
      };
      oxylabs_schedules: {
        Row: {
          id: string;
          source_id: string;
          oxylabs_schedule_id: string;
          schedule_config: Record<string, unknown> | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          oxylabs_schedule_id: string;
          schedule_config?: Record<string, unknown> | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["oxylabs_schedules"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedules_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: true;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      oxylabs_schedule_runs: {
        Row: {
          id: string;
          schedule_id: string;
          oxylabs_job_id: string;
          result_status: string | null;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          oxylabs_job_id: string;
          result_status?: string | null;
          processed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["oxylabs_schedule_runs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedule_runs_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "oxylabs_schedules";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      /** Section 20 related articles; cosine ordering PostgREST cannot express. */
      match_related_articles: {
        Args: {
          p_article_id: string;
          /** `vector` text literal, e.g. `"[0.1,0.2,...]"`. */
          p_embedding: string;
          p_match_count: number;
        };
        Returns: RelatedArticleRow[];
      };
    };
    Enums: Record<string, never>;
  };
};

export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"];
export type SourceUpdate = Database["public"]["Tables"]["sources"]["Update"];

export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
export type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];

export type ArticleAnalysis = Database["public"]["Tables"]["article_analyses"]["Row"];
export type ArticleAnalysisInsert = Database["public"]["Tables"]["article_analyses"]["Insert"];
export type ArticleAnalysisUpdate = Database["public"]["Tables"]["article_analyses"]["Update"];

export type LogEntry = Database["public"]["Tables"]["logs"]["Row"];
export type LogEntryInsert = Database["public"]["Tables"]["logs"]["Insert"];

export type OxylabsSchedule = Database["public"]["Tables"]["oxylabs_schedules"]["Row"];
export type OxylabsScheduleInsert = Database["public"]["Tables"]["oxylabs_schedules"]["Insert"];
export type OxylabsScheduleUpdate = Database["public"]["Tables"]["oxylabs_schedules"]["Update"];

export type OxylabsScheduleRun = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Row"];
export type OxylabsScheduleRunInsert = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Insert"];
export type OxylabsScheduleRunUpdate = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Update"];

export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type NewsletterSubscriberInsert = Database["public"]["Tables"]["newsletter_subscribers"]["Insert"];
export type NewsletterSubscriberUpdate = Database["public"]["Tables"]["newsletter_subscribers"]["Update"];

