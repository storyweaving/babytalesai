import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';
import { generateBabyCard } from '../../services/geminiService';

const artStyleOptions = ['Classic Storybook', 'Watercolor Whimsy', 'Vintage Charm', 'Playful Cartoon'];
const ageOptions = ['Newborn (0-3 months)', 'Infant (4-12 months)', 'Toddler (1-3 years)', 'Preschooler (3-5 years)'];
const settingOptions = ['Cozy Nursery', 'Sunny Backyard', 'Playful Bathtime', 'Bedtime Stories', 'A Day at the Park', 'Holiday Celebration'];
const toyOptions = ['None', 'Teddy bear', 'Building block', 'Toy car', 'Doll', 'Ball'];
const petOptions = ['None', 'Gentle dog', 'Cuddly cat', 'Small bunny'];
const colorOptions = ['None', 'Pink', 'Blue', 'Yellow', 'Green', 'Purple'];
const accessoryOptions = ['None', 'Bow', 'Small hat', 'Headband'];
const magicMomentOptions = ['A Moment of Wonder', 'A Heartwarming Hug', 'A Playful Giggle', 'A Curious Discovery', 'A Sweet Dream'];

const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode; }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{children}</label>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
        {children}
    </select>
);

const BabyCardBuilderView: React.FC = () => {
    const { dispatch } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string } | null>(null);
    const [artStyle, setArtStyle] = useState(artStyleOptions[0]);
    const [age, setAge] = useState(ageOptions[2]);
    const [setting, setSetting] = useState(settingOptions[0]);
    const [toy, setToy] = useState(toyOptions[0]);
    const [pet, setPet] = useState(petOptions[0]);
    const [clothingColor, setClothingColor] = useState(colorOptions[0]);
    const [hairAccessory, setHairAccessory] = useState(accessoryOptions[0]);
    const [magicMoment, setMagicMoment] = useState(magicMomentOptions[0]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleClose = () => dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Please select an image file.', type: ToastType.Error } });
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage({ data: event.target?.result as string, mimeType: file.type });
                setGeneratedImage(null);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleGenerate = async () => {
        if (!uploadedImage) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Please upload an image first.', type: ToastType.Error } });
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Generating your baby card... this may take a moment.', type: ToastType.Info } });
        
        try {
            const options = { artStyle, age, setting, toy, pet, clothingColor, hairAccessory, magicMoment };
            const result = await generateBabyCard(uploadedImage, options);
            setGeneratedImage(result);
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Your card has been generated!', type: ToastType.Success } });
        } catch (error: any) {
            console.error(error);
            dispatch({ type: 'ADD_TOAST', payload: { message: error.message || "Failed to generate image.", type: ToastType.Error } });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsert = () => {
        if (generatedImage) {
            dispatch({ type: 'REQUEST_IMAGE_INSERTION', payload: generatedImage });
            handleClose();
        }
    };
    
    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'BabyCard.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Build Your Baby Card</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
                    {uploadedImage ? (
                        <img src={uploadedImage.data} alt="Uploaded preview" className="max-h-40 mx-auto rounded-md" />
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-2a2 2 0 012-2h12a2 2 0 012 2v2m-6-4l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p className="mt-2 font-semibold">Click to upload an image</p>
                            <p className="text-xs">This will be the base for your card.</p>
                        </div>
                    )}
                </div>

                <div><FormLabel htmlFor="artStyle">1. Art Style</FormLabel><FormSelect id="artStyle" value={artStyle} onChange={e => setArtStyle(e.target.value)}>{artStyleOptions.map(o => <option key={o}>{o}</option>)}</FormSelect></div>
                <div><FormLabel htmlFor="age">2. Main Character's Age</FormLabel><FormSelect id="age" value={age} onChange={e => setAge(e.target.value)}>{ageOptions.map(o => <option key={o}>{o}</option>)}</FormSelect></div>
                <div><FormLabel htmlFor="setting">3. Setting the Scene</FormLabel><FormSelect id="setting" value={setting} onChange={e => setSetting(e.target.value)}>{settingOptions.map(o => <option key={o}>{o}</option>)}</FormSelect></div>
                <div><FormLabel htmlFor="toy">4. Special Details</FormLabel><FormSelect id="toy" value={toy} onChange={e => setToy(e.target.value)}>{toyOptions.map(o => <option key={o}>{o}</option>)}</FormSelect><FormSelect className="mt-2" value={pet} onChange={e => setPet(e.target.value)}>{petOptions.map(o => <option key={o}>{o}</option>)}</FormSelect><FormSelect className="mt-2" value={clothingColor} onChange={e => setClothingColor(e.target.value)}>{colorOptions.map(o => <option key={o}>{o}</option>)}</FormSelect><FormSelect className="mt-2" value={hairAccessory} onChange={e => setHairAccessory(e.target.value)}>{accessoryOptions.map(o => <option key={o}>{o}</option>)}</FormSelect></div>
                <div><FormLabel htmlFor="magicMoment">5. The "Magic" of the Moment</FormLabel><FormSelect id="magicMoment" value={magicMoment} onChange={e => setMagicMoment(e.target.value)}>{magicMomentOptions.map(o => <option key={o}>{o}</option>)}</FormSelect></div>
                
                {(isLoading || generatedImage) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Generated Card</h3>
                         {isLoading && (
                            <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                                <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                        )}
                        {generatedImage && (
                            <>
                                <img src={generatedImage} alt="Generated baby card" className="w-full rounded-lg shadow-md" />
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <button onClick={handleDownload} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">Download</button>
                                    <button onClick={handleInsert} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600">Insert into Story</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            <div className="mt-6 flex-shrink-0">
                <button onClick={handleGenerate} disabled={!uploadedImage || isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Generating...' : 'Generate Card'}
                </button>
            </div>
        </div>
    );
};

export default BabyCardBuilderView;
