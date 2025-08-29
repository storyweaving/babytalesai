import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MilestoneData } from '../../types';

const SectionHeader: React.FC<{ number: number; title: string; }> = ({ number, title }) => (
    <div className="flex items-center space-x-3 pt-4 pb-2">
        <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300">
            {number}
        </div>
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
        {children}
    </select>
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
);

const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode; sublabel?: string }> = ({ htmlFor, children, sublabel }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {children}
        {sublabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sublabel}</p>}
    </label>
);

const MilestonesForm: React.FC = () => {
  const { state, dispatch, saveMilestones } = useAppContext();
  const [localMilestones, setLocalMilestones] = useState<MilestoneData>(state.milestones);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setLocalMilestones({ ...localMilestones, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
  }

  const handleSave = async () => {
    await saveMilestones(localMilestones);
    handleClose();
  };

  const formBgColor =
    localMilestones.sex === 'male'
      ? 'bg-blue-100 dark:bg-blue-900/20'
      : localMilestones.sex === 'female'
      ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30'
      : 'bg-white dark:bg-gray-800';

  return (
    <div className={`p-6 h-full flex flex-col ${formBgColor} transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Milestones</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex-grow flex flex-col min-h-0">
            <form className="space-y-4 overflow-y-auto flex-grow pr-2">
                <SectionHeader number={1} title="Story Subject & Relationship" />
                <div>
                    <FormLabel htmlFor="story_subject">Who is the central character of this story?</FormLabel>
                    <FormSelect id="story_subject" name="story_subject" value={localMilestones.story_subject} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option>My Grandchild</option>
                        <option>My Child</option>
                        <option>My Nephew</option>
                        <option>My Niece</option>
                        <option>Myself</option>
                        <option>A Fictional Character</option>
                        <option>A Friend</option>
                        <option value="Other">Other</option>
                    </FormSelect>
                </div>
                 {localMilestones.story_subject === 'Other' && (
                    <div>
                        <FormLabel htmlFor="story_subject_other">If 'Other' or for additional clarity, please specify:</FormLabel>
                        <FormInput type="text" name="story_subject_other" id="story_subject_other" value={localMilestones.story_subject_other} onChange={handleChange} />
                    </div>
                )}
                
                <SectionHeader number={2} title="Character Demographics & Identity" />
                <div>
                    <FormLabel htmlFor="sex">
                        What is their sex?
                        {localMilestones.sex === 'female' && <span className="ml-2" style={{color: '#d946ef'}}>■</span>}
                        {localMilestones.sex === 'male' && <span className="ml-2" style={{color: '#3b82f6'}}>■</span>}
                    </FormLabel>
                    <FormSelect id="sex" name="sex" value={localMilestones.sex} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="female">Girl</option>
                        <option value="male">Boy</option>
                    </FormSelect>
                </div>
                <div>
                    <FormLabel htmlFor="name">What is their full name?</FormLabel>
                    <FormInput type="text" name="name" id="name" value={localMilestones.name} onChange={handleChange} />
                </div>
                <div>
                    <FormLabel htmlFor="dob">When were they born? (Date of Birth)</FormLabel>
                    <FormInput type="date" name="dob" id="dob" value={localMilestones.dob} onChange={handleChange} />
                </div>
                <div>
                    <FormLabel htmlFor="hometown">Where do they primarily live or call home? (Hometown / Neighborhood)</FormLabel>
                    <FormInput type="text" name="hometown" id="hometown" value={localMilestones.hometown} onChange={handleChange} />
                </div>
                <div>
                    <FormLabel htmlFor="ethnicity">Regarding their ethnicity, what best describes them?</FormLabel>
                    <FormSelect id="ethnicity" name="ethnicity" value={localMilestones.ethnicity} onChange={handleChange}>
                         <option value="">Select...</option>
                         <option>Caucasian</option>
                         <option>Hispanic or Latino</option>
                         <option>Black or African American</option>
                         <option>Asian</option>
                         <option>American Indian or Alaska Native</option>
                         <option>Native Hawaiian or Other Pacific Islander</option>
                         <option>Two or More Races</option>
                         <option>Prefer not to specify</option>
                         <option value="Other">Other</option>
                    </FormSelect>
                </div>
                {localMilestones.ethnicity === 'Other' && (
                    <div>
                        <FormLabel htmlFor="ethnicity_other">If 'Other' or for additional details about their cultural background:</FormLabel>
                        <FormInput type="text" name="ethnicity_other" id="ethnicity_other" value={localMilestones.ethnicity_other} onChange={handleChange} />
                    </div>
                )}
                
                <SectionHeader number={3} title="Health & Well-being Context" />
                 <div>
                    <FormLabel htmlFor="health_context" sublabel="e.g., chronic conditions, developmental milestones, unique abilities, significant health events, mental health considerations, etc. This helps the AI understand potential narrative impacts.">
                        Are there any specific aspects of their physical or cognitive health that are relevant to their story?
                    </FormLabel>
                    <FormTextarea name="health_context" id="health_context" value={localMilestones.health_context || ''} onChange={handleChange} />
                </div>
                
                <SectionHeader number={4} title="Family & Social Sphere" />
                <div>
                    <FormLabel htmlFor="family_dynamics" sublabel="Who are the key people in their life? What are their relationships like? This helps the AI understand social dynamics and potential influences.">Describe their immediate and extended family members.</FormLabel>
                    <FormTextarea name="family_dynamics" id="family_dynamics" value={localMilestones.family_dynamics || ''} onChange={handleChange} />
                </div>
                 <div>
                    <FormLabel htmlFor="traditions_and_events">What are some important family traditions, cultural practices, or significant events that shape their life?</FormLabel>
                    <FormTextarea name="traditions_and_events" id="traditions_and_events" value={localMilestones.traditions_and_events || ''} onChange={handleChange} />
                </div>
                
                <SectionHeader number={5} title="Memories & Milestones" />
                <div>
                    <FormLabel htmlFor="significant_memories" sublabel="These provide rich context for memorable time references.">Share some favorite memories, significant experiences, or important places (like vacation spots) that are meaningful to them or their story.</FormLabel>
                    <FormTextarea name="significant_memories" id="significant_memories" value={localMilestones.significant_memories || ''} onChange={handleChange} />
                </div>

                <SectionHeader number={6} title="Hopes & Aspirations (If Applicable)" />
                <div>
                    <FormLabel htmlFor="hopes_and_aspirations" sublabel="This gives the AI a deeper understanding of the story's underlying emotional goals.">If you are writing about a loved one, what are your hopes, dreams, or significant wishes for them as expressed in this story?</FormLabel>
                    <FormTextarea name="hopes_and_aspirations" id="hopes_and_aspirations" value={localMilestones.hopes_and_aspirations || ''} onChange={handleChange} />
                </div>
            </form>
            <div className="mt-6 flex-shrink-0">
                <button
                    type="button"
                    onClick={handleSave}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Save Milestones
                </button>
            </div>
        </div>
    </div>
  );
};

export default MilestonesForm;
