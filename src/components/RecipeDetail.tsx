import React from 'react';
import { Recipe } from '../lib/supabase';
import { X, Clock, Users, Edit3, Trash2 } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeDetail({ recipe, onClose, onEdit, onDelete }: RecipeDetailProps) {
  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-bold tracking-wide text-black border border-black hover:bg-black hover:text-white transition-colors uppercase"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-bold tracking-wide text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors uppercase"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          {recipe.image_url && (
            <div className="aspect-square">
              <img 
                src={recipe.image_url} 
                alt={recipe.title}
                className="w-full h-full object-cover border border-black"
              />
            </div>
          )}
          
          {/* Recipe Info */}
          <div className={recipe.image_url ? '' : 'lg:col-span-2'}>
            <h1 className="text-4xl font-bold tracking-tight text-black mb-6 uppercase font-mono">
              {recipe.title}
            </h1>
            
            {recipe.description && (
              <div 
                className="text-lg text-gray-700 mb-8 leading-relaxed prose prose-lg max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-2"
                dangerouslySetInnerHTML={{ __html: recipe.description }}
              />
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-12 pb-8 border-b border-black">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1 font-mono">{recipe.prep_time} min</div>
                <div className="text-xs font-bold tracking-wide text-black uppercase font-mono">Prep</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1 font-mono">{recipe.cook_time} min</div>
                <div className="text-xs font-bold tracking-wide text-black uppercase font-mono">Cook</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1 font-mono">{recipe.servings}</div>
                <div className="text-xs font-bold tracking-wide text-black uppercase font-mono">Servings</div>
              </div>
            </div>
            
            {/* Ingredients */}
            <div className="mb-12">
              <h2 className="text-xl font-bold tracking-tight text-black mb-6 uppercase font-mono">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-black"></span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Steps */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black mb-6 uppercase font-mono">Instructions</h2>
              <ol className="space-y-6">
                {(recipe.step_items && recipe.step_items.length ? recipe.step_items.map((item) => item.text) : recipe.steps).map((_, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <span className="text-lg font-bold text-black min-w-[2rem] mt-1 font-mono">
                      {index + 1}.
                    </span>
                    <div className="space-y-3">
                      <p className="text-gray-700 leading-relaxed">{recipe.step_items && recipe.step_items[index] ? recipe.step_items[index].text : recipe.steps[index]}</p>
                      {recipe.step_items && recipe.step_items[index]?.image_url && (
                        <img
                          src={recipe.step_items[index]?.image_url as string}
                          alt={`Step ${index + 1}`}
                          className="w-full max-w-md border border-black"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}