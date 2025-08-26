
import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useCallback } from 'react';
import { Chapter, MilestoneData, CockpitView, ToastType, Theme, Database } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../services/supabaseClient';
import { Session, User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';

interface AppState {
  chapters: Chapter[];
  activeChapterId: string | null;
  milestones: MilestoneData;
  cockpitView: CockpitView;
  toasts: { id: number; message: string; type: ToastType }[];
  theme: Theme;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  lastSelection: Range | null;
  imageToInsert: string | null;
  onboardingStep: number; // 0=off, 1=milestones, 2=chapter title, 3=first words, 4=complete
}

type Action =
  | { type: 'SET_INITIAL_DATA'; payload: { chapters: Chapter[], milestones: MilestoneData } }
  | { type: 'ADD_CHAPTER_SUCCESS'; payload: Chapter }
  | { type: 'UPDATE_CHAPTER_CONTENT'; payload: { id: string; content: string, word_count: number } }
  | { type: 'UPDATE_CHAPTER_NAME_SUCCESS'; payload: { id: string; name: string } }
  | { type: 'SET_ACTIVE_CHAPTER'; payload: string | null }
  | { type: 'SET_MILESTONES_SUCCESS'; payload: MilestoneData }
  | { type: 'SET_COCKPIT_VIEW'; payload: CockpitView }
  | { type: 'ADD_TOAST'; payload: { message: string; type: ToastType } }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LAST_SELECTION'; payload: Range | null }
  | { type: 'REQUEST_IMAGE_INSERTION'; payload: string }
  | { type: 'IMAGE_INSERTION_COMPLETE' }
  | { type: 'SET_ONBOARDING_STEP'; payload: number };

const initialState: AppState = {
  chapters: [],
  activeChapterId: null,
  milestones: {
    writing_about: '',
    sex: '',
    name: '',
    dob: '',
    hometown: '',
    ethnicity: '',
    traditions: '',
    family_members: '',
    favorite_memories: '',
    parent_wishes: '',
  },
  cockpitView: null,
  toasts: [],
  theme: 'light',
  isLoading: true,
  session: null,
  user: null,
  lastSelection: null,
  imageToInsert: null,
  onboardingStep: 0,
};

const AppContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
    addChapter: () => Promise<void>;
    updateChapterContent: (id: string, content: string) => Promise<void>;
    updateChapterName: (id: string, name: string) => Promise<void>;
    saveMilestones: (milestones: MilestoneData) => Promise<void>;
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
    signOut: () => Promise<{ error: Error | null }>;
}>({
  state: initialState,
  dispatch: () => null,
  addChapter: async () => {},
  updateChapterContent: async () => {},
  updateChapterName: async () => {},
  saveMilestones: async () => {},
  signUp: async () => ({} as AuthResponse),
  signIn: async () => ({} as AuthResponse),
  signOut: async () => ({ error: null }),
});

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_INITIAL_DATA': {
        const { chapters, milestones } = action.payload;
        const activeId = state.activeChapterId && chapters.some(c => c.id === state.activeChapterId)
            ? state.activeChapterId
            : chapters[0]?.id || null;

        return { 
            ...state, 
            chapters, 
            milestones: milestones ? { ...initialState.milestones, ...milestones } : state.milestones,
            activeChapterId: activeId,
            isLoading: false 
        };
    }
    case 'ADD_CHAPTER_SUCCESS':
      return { ...state, chapters: [...state.chapters, action.payload], activeChapterId: action.payload.id };
    
    case 'UPDATE_CHAPTER_CONTENT': {
        const { id, content, word_count } = action.payload;
        return {
            ...state,
            chapters: state.chapters.map(ch =>
                ch.id === id ? { ...ch, content, word_count } : ch
            ),
        };
    }
    case 'UPDATE_CHAPTER_NAME_SUCCESS': {
        const { id, name } = action.payload;
        return {
            ...state,
            chapters: state.chapters.map(ch =>
                ch.id === id ? { ...ch, name } : ch
            ),
        };
    }
    case 'SET_ACTIVE_CHAPTER':
      return { ...state, activeChapterId: action.payload };
    case 'SET_MILESTONES_SUCCESS':
      return { ...state, milestones: action.payload };
    case 'SET_COCKPIT_VIEW':
      return { ...state, cockpitView: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.payload) };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user ?? null,
        isLoading: false,
      };
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
    case 'SET_LAST_SELECTION':
      return { ...state, lastSelection: action.payload };
    case 'REQUEST_IMAGE_INSERTION':
      return { ...state, imageToInsert: action.payload };
    case 'IMAGE_INSERTION_COMPLETE':
      return { ...state, imageToInsert: null };
    case 'SET_ONBOARDING_STEP':
        return { ...state, onboardingStep: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('babytales-theme', 'light');
  const [state, dispatch] = useReducer(appReducer, {
      ...initialState,
      theme: storedTheme,
  });

  useEffect(() => { setStoredTheme(state.theme) }, [state.theme, setStoredTheme]);

  useEffect(() => {
    dispatch({type: 'SET_LOADING', payload: true});
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        dispatch({ type: 'SET_SESSION', payload: session });
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'auth' });
        } else if (event === 'SIGNED_IN') {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async (user: User) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select()
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true });

            if (chaptersError) throw chaptersError;

            const { data: milestonesData, error: milestonesError } = await supabase
                .from('milestones')
                .select()
                .eq('user_id', user.id)
                .single();

            if (milestonesError && milestonesError.code !== 'PGRST116') { // Ignore "missing row" error
                 throw milestonesError;
            }
            
            const typedMilestonesData = milestonesData as Database['public']['Tables']['milestones']['Row'] | null;

            let chaptersToSet: Chapter[] = chaptersData || [];
            if (chaptersData && chaptersData.length === 0) {
                // Create first chapter for new user
                const newChapterData: Database['public']['Tables']['chapters']['Insert'] = { 
                    name: 'My First Chapter',
                    content: '',
                    word_count: 0,
                    sort_order: 0,
                    user_id: user.id 
                };
                const { data: newChapter, error: insertError } = await supabase
                    .from('chapters')
                    .insert(newChapterData)
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                if (newChapter) chaptersToSet = [newChapter];
            }
            
            const activeChapterId = chaptersToSet[0]?.id || null;

            const processedMilestones = typedMilestonesData ? {
                writing_about: typedMilestonesData.writing_about || '',
                sex: (typedMilestonesData.sex || '') as MilestoneData['sex'],
                name: typedMilestonesData.name || '',
                dob: typedMilestonesData.dob || '',
                hometown: typedMilestonesData.hometown || '',
                ethnicity: typedMilestonesData.ethnicity || '',
                traditions: typedMilestonesData.traditions || '',
                family_members: typedMilestonesData.family_members || '',
                favorite_memories: typedMilestonesData.favorite_memories || '',
                parent_wishes: typedMilestonesData.parent_wishes || '',
            } : null;

            dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: activeChapterId });
            dispatch({ type: 'SET_INITIAL_DATA', payload: { chapters: chaptersToSet, milestones: processedMilestones || initialState.milestones } });
            
            const hasMilestones = typedMilestonesData && typedMilestonesData.writing_about;
            const hasNamedChapter = chaptersToSet.length > 0 && chaptersToSet[0].name !== 'My First Chapter' && chaptersToSet[0].name.trim() !== '';
            const hasWrittenContent = chaptersToSet.length > 0 && chaptersToSet[0].word_count > 0;

            if (!hasMilestones) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 1 });
                dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'milestones' });
            } else if (!hasNamedChapter) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 2 });
                dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
            } else if (!hasWrittenContent) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 3 });
            } else {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 4 }); // Onboarding complete
            }

        } catch (error: any) {
            console.error("Error fetching data:", error);
            const message = error?.message || "An unexpected error occurred while loading your story.";
            dispatch({ type: 'ADD_TOAST', payload: { message: `Error: ${message}`, type: ToastType.Error } });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    if (state.user) {
      fetchData(state.user);
    } else {
        // Set up view for logged-out user
        const defaultChapter: Chapter = {
            id: 'temp-1',
            created_at: new Date().toISOString(),
            name: '',
            content: '',
            word_count: 0,
            sort_order: 0,
            user_id: 'unauthenticated'
        };
        dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: 'temp-1' });
        dispatch({ type: 'SET_INITIAL_DATA', payload: { chapters: [defaultChapter], milestones: initialState.milestones }});
    }
  }, [state.user]);

  const addChapter = useCallback(async () => {
    if (!state.user) return;
    const newSortOrder = state.chapters.reduce((max, ch) => Math.max(ch.sort_order, max), -1) + 1;
    
    const newChapterData: Database['public']['Tables']['chapters']['Insert'] = {
        name: `Chapter ${state.chapters.length + 1}`,
        content: '',
        word_count: 0,
        sort_order: newSortOrder,
        user_id: state.user.id
    };
    const { data: newChapter, error } = await supabase
        .from('chapters')
        .insert(newChapterData)
        .select()
        .single();
    
    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Could not add chapter: ${error.message}`, type: ToastType.Error } });
    } else if (newChapter) {
        dispatch({ type: 'ADD_CHAPTER_SUCCESS', payload: newChapter as Chapter });
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
    }
  }, [state.chapters, state.user, dispatch]);

  const updateChapterContent = useCallback(async (id: string, content: string) => {
    if (!state.user) return;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const word_count = textContent.trim().split(/\s+/).filter(Boolean).length;

    if (state.onboardingStep === 3 && word_count > 0) {
        dispatch({ type: 'SET_ONBOARDING_STEP', payload: 4 });
    }
    
    const chapterUpdate: Database['public']['Tables']['chapters']['Update'] = { content, word_count };
    const { error } = await supabase
        .from('chapters')
        .update(chapterUpdate)
        .eq('id', id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Failed to save changes: ${error.message}`, type: ToastType.Error } });
    }
  }, [state.user, dispatch, state.onboardingStep]);

  const updateChapterName = useCallback(async (id: string, name: string) => {
    if (!state.user) return;
    const chapterUpdate: Database['public']['Tables']['chapters']['Update'] = { name };
    const { error } = await supabase
        .from('chapters')
        .update(chapterUpdate)
        .eq('id', id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Failed to update name: ${error.message}`, type: ToastType.Error } });
    } else {
        if (state.onboardingStep === 2 && name.trim() !== '') {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: 3 });
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
        }
    }
  }, [state.user, dispatch, state.onboardingStep]);

  const saveMilestones = useCallback(async (milestones: MilestoneData) => {
    if (!state.user) return;
    const milestonesDataToSave: Database['public']['Tables']['milestones']['Insert'] = { ...milestones, user_id: state.user.id };
    const { error } = await supabase
        .from('milestones')
        .upsert(milestonesDataToSave);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Could not save milestones: ${error.message}`, type: ToastType.Error } });
    } else {
        dispatch({ type: 'SET_MILESTONES_SUCCESS', payload: milestones });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Milestones saved!', type: ToastType.Success } });
        if (state.onboardingStep === 1) {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: 2 });
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
        }
    }
  }, [state.user, dispatch, state.onboardingStep]);
  
  const signUp = (credentials: SignUpWithPasswordCredentials) => supabase.auth.signUp(credentials);
  const signIn = (credentials: SignInWithPasswordCredentials) => supabase.auth.signInWithPassword(credentials);
  const signOut = () => supabase.auth.signOut();

  return <AppContext.Provider value={{ state, dispatch, addChapter, updateChapterContent, updateChapterName, saveMilestones, signUp, signIn, signOut }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);
