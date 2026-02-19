// Timeline Types
export type TimelineCategory = 'education' | 'project' | 'career' | 'life';

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: TimelineCategory;
  details?: string;
}

// Value Circle Types
export type ValueType = 'creative' | 'connection' | 'exploration' | 'wellbeing';
export type ItemStatus = 'done' | 'aspiration';

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  valueType: ValueType;
}

export interface ValueCircle {
  id: ValueType;
  name: string;
  description: string;
  color: string;
  items: ValueItem[];
}

// Philosophy Types
export interface PhilosophyThought {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  connections: string[];
}

// Edit Mode Context
export interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (value: boolean) => void;
  verifyPassword: (password: string) => boolean;
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  sectionId: string;
}
