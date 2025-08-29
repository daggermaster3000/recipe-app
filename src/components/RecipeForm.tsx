import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Upload, Plus, Minus } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface RecipeFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialRecipe?: {
    id: string;
    title: string;
    description: string | null;
    prep_time: number;
    cook_time: number;
    servings: number;
    image_url?: string | null;
    ingredients: string[];
    steps: string[];
    step_items?: Array<{ text: string; image_url?: string | null }> | null;
  } | null;
}

export function RecipeForm({ onClose, onSuccess, initialRecipe }: RecipeFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialRecipe?.image_url ?? null);
  
  const [formData, setFormData] = useState({
    title: initialRecipe?.title || '',
    description: initialRecipe?.description || '<p>Enter a brief description of your recipe...</p>',
    prep_time: initialRecipe?.prep_time ?? 0,
    cook_time: initialRecipe?.cook_time ?? 0,
    servings: initialRecipe?.servings ?? 1,
  });
  
  const [ingredients, setIngredients] = useState(initialRecipe?.ingredients?.length ? initialRecipe.ingredients : ['']);
  const [steps, setSteps] = useState(initialRecipe?.steps?.length ? initialRecipe.steps : ['']);
  const [stepItems, setStepItems] = useState<Array<{ text: string; image_url?: string | null }>>(
    initialRecipe?.step_items && initialRecipe.step_items.length
      ? initialRecipe.step_items
      : (initialRecipe?.steps?.length ? initialRecipe.steps.map((t) => ({ text: t })) : [{ text: '' }])
  );
  const [stepImageFiles, setStepImageFiles] = useState<Array<File | null>>(
    new Array(stepItems.length).fill(null)
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
    setStepItems([...stepItems, { text: '' }]);
    setStepImageFiles([...stepImageFiles, null]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    setStepItems(stepItems.filter((_, i) => i !== index));
    setStepImageFiles(stepImageFiles.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
    const updatedItems = [...stepItems];
    updatedItems[index] = { ...updatedItems[index], text: value };
    setStepItems(updatedItems);
  };

  const handleStepImageChange = (index: number, file: File | null) => {
    const files = [...stepImageFiles];
    files[index] = file;
    setStepImageFiles(files);
    if (!file) {
      const updatedItems = [...stepItems];
      updatedItems[index] = { ...updatedItems[index], image_url: null };
      setStepItems(updatedItems);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageFile);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const uploadStepImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user');
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/steps/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      // Process step images uploads if any
      const finalStepItems = await Promise.all(stepItems.map(async (item, index) => {
        const file = stepImageFiles[index];
        if (file) {
          const url = await uploadStepImage(file);
          return { ...item, image_url: url };
        }
        return item;
      }));

      const recipeData = {
        ...formData,
        ingredients: ingredients.filter(i => i.trim() !== ''),
        steps: finalStepItems.map((s) => s.text).filter(s => s.trim() !== ''),
        step_items: finalStepItems,
        image_url: imageUrl ?? (initialRecipe?.image_url || null),
        user_id: user.id,
      };
      
      let error;
      if (initialRecipe?.id) {
        ({ error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', initialRecipe.id));
      } else {
        ({ error } = await supabase
          .from('recipes')
          .insert([recipeData]));
      }
      
      if (error) throw error;
      
      onSuccess();
    } catch (err: any) {
      alert('Error creating recipe: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-black uppercase font-mono">{initialRecipe ? 'Edit Recipe' : 'Add Recipe'}</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold tracking-wide text-black uppercase mb-4 font-mono">
              Photo
            </label>
            <div className="border-2 border-dashed border-black p-8 text-center">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover border border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <div>
                    <label className="cursor-pointer font-medium text-black hover:text-red-500 transition-colors uppercase tracking-wide font-mono">
                      Upload Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold tracking-wide text-black uppercase mb-2 font-mono">
                Recipe Name
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter recipe name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold tracking-wide text-black uppercase mb-2 font-mono">
                Servings
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold tracking-wide text-black uppercase mb-2 font-mono">
                Prep Time (min)
              </label>
              <input
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold tracking-wide text-black uppercase mb-2 font-mono">
                Cook Time (min)
              </label>
              <input
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold tracking-wide text-black uppercase mb-2 font-mono">
              Description
            </label>
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Brief description of your recipe"
            />
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold tracking-wide text-black uppercase font-mono">
                Ingredients
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center space-x-2 px-3 py-1 text-xs font-bold tracking-wide text-black border border-black hover:bg-black hover:text-white transition-colors uppercase font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold tracking-wide text-black uppercase font-mono">
                Instructions
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center space-x-2 px-3 py-1 text-xs font-bold tracking-wide text-black border border-black hover:bg-black hover:text-white transition-colors uppercase font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-sm font-bold text-black mt-3 min-w-[2rem] font-mono">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      placeholder={`Step ${index + 1}`}
                    />
                    <div className="flex items-center space-x-3">
                      {stepItems[index]?.image_url ? (
                        <div className="relative">
                          <img src={stepItems[index]?.image_url as string} alt="Step" className="w-24 h-24 object-cover border border-black" />
                          <button
                            type="button"
                            onClick={() => {
                              handleStepImageChange(index, null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-sm font-medium text-black hover:text-red-500 transition-colors uppercase tracking-wide font-mono">
                          Add Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleStepImageChange(index, e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors mt-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-bold tracking-wide text-black border border-black hover:bg-gray-100 transition-colors uppercase font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black text-white text-sm font-bold tracking-wide hover:bg-gray-900 disabled:opacity-50 transition-colors uppercase font-mono"
            >
              {loading ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}