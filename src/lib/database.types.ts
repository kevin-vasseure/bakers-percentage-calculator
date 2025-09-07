export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			recipes: {
				Row: {
					id: string;
					user_id: string | null;
					title: string;
					description: string | null;
					notes: string | null;
					is_public: boolean | null;
					total_weight: number | null;
					slug: string | null;
					metadata: Json | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					title: string;
					description?: string | null;
					notes?: string | null;
					is_public?: boolean | null;
					total_weight?: number | null;
					slug?: string | null;
					metadata?: Json | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					title?: string;
					description?: string | null;
					notes?: string | null;
					is_public?: boolean | null;
					total_weight?: number | null;
					slug?: string | null;
					metadata?: Json | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
			};
			ingredients: {
				Row: {
					id: string;
					recipe_id: string;
					name: string;
					is_flour: boolean | null;
					amount: number | null;
					percentage: number | null;
					sort_order: number | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					id?: string;
					recipe_id: string;
					name: string;
					is_flour?: boolean | null;
					amount?: number | null;
					percentage?: number | null;
					sort_order?: number | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					id?: string;
					recipe_id?: string;
					name?: string;
					is_flour?: boolean | null;
					amount?: number | null;
					percentage?: number | null;
					sort_order?: number | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
			};
			recipe_collections: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					is_public: boolean | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					is_public?: boolean | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					description?: string | null;
					is_public?: boolean | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
			};
			recipe_collection_items: {
				Row: {
					id: string;
					collection_id: string;
					recipe_id: string;
					sort_order: number | null;
					added_at: string | null;
				};
				Insert: {
					id?: string;
					collection_id: string;
					recipe_id: string;
					sort_order?: number | null;
					added_at?: string | null;
				};
				Update: {
					id?: string;
					collection_id?: string;
					recipe_id?: string;
					sort_order?: number | null;
					added_at?: string | null;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			generate_slug: {
				Args: {
					title: string;
				};
				Returns: string;
			};
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
