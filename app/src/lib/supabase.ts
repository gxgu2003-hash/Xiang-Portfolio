import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Event {
  id: string;
  title: string;
  description: string;
  summary?: string;
  start_year: number;
  end_year?: number;
  category: 'exploration' | 'connection' | 'creative';
  images?: string[];
  pdf_url?: string;
  parent_id?: string | null;
  created_at?: string;
}

export interface Thought {
  id: string;
  title: string;
  content: string;
  x?: number;
  y?: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  thought_id: string;
  content: string;
  author?: string;
  is_public: boolean;
  created_at?: string;
}

// API Functions
export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_year', { ascending: true });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data || [];
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  return data;
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating event:', error);
    return false;
  }
  return true;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  return true;
}

export async function fetchThoughts(): Promise<Thought[]> {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*');
  
  if (error) {
    console.error('Error fetching thoughts:', error);
    return [];
  }
  return data || [];
}

export async function createThought(thought: Omit<Thought, 'id' | 'created_at'>): Promise<Thought | null> {
  const { data, error } = await supabase
    .from('thoughts')
    .insert(thought)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating thought:', error);
    return null;
  }
  return data;
}

export async function updateThought(id: string, updates: Partial<Thought>): Promise<boolean> {
  const { error } = await supabase
    .from('thoughts')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating thought:', error);
    return false;
  }
  return true;
}

export async function deleteThought(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting thought:', error);
    return false;
  }
  return true;
}

export async function fetchComments(thoughtId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('thought_id', thoughtId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data || [];
}

export async function fetchAllComments(thoughtId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('thought_id', thoughtId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
  return data || [];
}

export async function createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }
  return data;
}

export async function approveComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .update({ is_public: true })
    .eq('id', id);
  
  if (error) {
    console.error('Error approving comment:', error);
    return false;
  }
  return true;
}

export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  return true;
}
