import React from "react";
import { CURRICULUM_CATEGORIES, HTTP_LABS } from "../../../lib/http/labs";

export const CurriculumSidebar = ({ 
    activeLab, 
    onSelect 
}: { 
    activeLab: string; 
    onSelect: (id: string) => void;
}) => {
    return (
        <div className="w-72 border-r border-neutral-800 h-full bg-neutral-950 flex flex-col overflow-y-auto">
            <div className="p-6 pb-4 border-b border-neutral-800">
                <h1 className="text-xl font-bold text-white mb-2">HTTP LAB</h1>
            </div>
            
            <div className="p-4 flex-1">
                {CURRICULUM_CATEGORIES.map((category) => (
                    <div key={category.id} className="mb-6">
                        <h3 className="text-[10px] font-bold text-neutral-500 tracking-widest mb-3 px-2">
                            {category.title}
                        </h3>
                        <div className="space-y-1">
                            {category.labs.map(labId => {
                                const lab = HTTP_LABS.find(l => l.id === labId);
                                if (!lab) return null;
                                
                                const isActive = activeLab === lab.id;
                                return (
                                    <button
                                        key={lab.id}
                                        onClick={() => onSelect(lab.id)}
                                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                            isActive 
                                                ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20" 
                                                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 border border-transparent"
                                        }`}
                                    >
                                        {lab.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
