import React from "react";
import { HttpLabConfig } from "../../lib/http/labs";

export const LabSelector = ({ 
    labs, 
    activeLab, 
    onSelect 
}: { 
    labs: HttpLabConfig[]; 
    activeLab: string; 
    onSelect: (id: string) => void;
}) => {
    
    // Group by category
    const categories = labs.reduce((acc, lab) => {
        if (!acc[lab.category]) acc[lab.category] = [];
        acc[lab.category].push(lab);
        return acc;
    }, {} as Record<string, HttpLabConfig[]>);

    return (
        <div className="w-64 border-r border-neutral-800 h-full bg-neutral-950 flex flex-col overflow-y-auto">
            <div className="p-6 pb-4 border-b border-neutral-800">
                <h1 className="text-xl font-bold text-white mb-1">HTTP LAB</h1>
                <p className="text-xs text-neutral-500">Learn how HTTP requests travel through a backend.</p>
            </div>
            
            <div className="p-4 flex-1">
                {Object.entries(categories).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        <h3 className="text-[10px] font-bold text-neutral-500 tracking-widest mb-3 px-2">
                            {category}
                        </h3>
                        <div className="space-y-1">
                            {items.map(lab => (
                                <button
                                    key={lab.id}
                                    onClick={() => onSelect(lab.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                        activeLab === lab.id 
                                            ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20" 
                                            : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 border border-transparent"
                                    }`}
                                >
                                    {lab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
