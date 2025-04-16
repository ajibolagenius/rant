export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            rants: {
                Row: {
                    id: string
                    content: string
                    mood: string
                    likes: number
                    created_at: string
                }
                Insert: {
                    id: string
                    content: string
                    mood: string
                    likes?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    mood?: string
                    likes?: number
                    created_at?: string
                }
            }
        }
        Functions: {
            increment_rant_likes: {
                Args: {
                    rant_id: string
                }
                Returns: undefined
            }
        }
    }
}
