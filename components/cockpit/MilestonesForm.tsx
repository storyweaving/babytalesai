
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MilestoneData } from '../../types';

const MilestonesForm: React.FC = () => {
  const { state, dispatch, saveMilestones } = useAppContext();
  const [localMilestones, setLocalMilestones] = useState<MilestoneData>(state.milestones);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Collect character information to personalize AI suggestions. All fields are optional.</p>
        <div className="flex-grow flex flex-col min-h-0">
            <form className="space-y-4 overflow-y-auto flex-grow pr-2">
                <div>
                    <label htmlFor="writing_about" className="block text-sm font-medium text-gray-700 dark:text-gray-300">I'm writing about...</label>
                    <select id="writing_about" name="writing_about" value={localMilestones.writing_about} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <option value="">Select...</option>
                        <option>My Grandchild</option>
                        <option>My Child</option>
                        <option>My Nephew</option>
                        <option>My Niece</option>
                        <option>Myself</option>
                        <option>A Fictional Character</option>
                        <option>A Friend</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Their Sex
                        {localMilestones.sex === 'female' && <span className="ml-2" style={{color: '#d946ef'}}>■</span>}
                        {localMilestones.sex === 'male' && <span className="ml-2" style={{color: '#3b82f6'}}>■</span>}
                    </label>
                    <select id="sex" name="sex" value={localMilestones.sex} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <option value="">Select...</option>
                        <option value="female">Girl</option>
                        <option value="male">Boy</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Their Name</label>
                    <input type="text" name="name" id="name" value={localMilestones.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                    <input type="date" name="dob" id="dob" value={localMilestones.dob} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="hometown" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hometown / Neighborhood</label>
                    <input type="text" name="hometown" id="hometown" value={localMilestones.hometown} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ethnicity</label>
                    <select id="ethnicity" name="ethnicity" value={localMilestones.ethnicity} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                         <option value="">Select...</option>
                         <option>Caucasian</option>
                         <option>Hispanic or Latino</option>
                         <option>Black or African American</option>
                         <option>Asian</option>
                         <option>American Indian or Alaska Native</option>
                         <option>Native Hawaiian or Other Pacific Islander</option>
                         <option>Two or More Races</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="traditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Family traditions</label>
                    <input type="text" name="traditions" id="traditions" value={localMilestones.traditions || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="family_members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tell us about their family members</label>
                    <input type="text" name="family_members" id="family_members" value={localMilestones.family_members || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="favorite_memories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Share favorite memories or vacation spots</label>
                    <input type="text" name="favorite_memories" id="favorite_memories" value={localMilestones.favorite_memories || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="parent_wishes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent/Grandparent wishes</label>
                    <input type="text" name="parent_wishes" id="parent_wishes" value={localMilestones.parent_wishes || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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