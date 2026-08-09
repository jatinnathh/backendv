import React from "react";
import { HttpLabConfig } from "../../lib/http/labs";

export const LabExplanation = ({ lab }: { lab: HttpLabConfig }) => {
    return (
        <div className="bg-neutral-900/40 border-b border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-white mb-2">{lab.name}</h2>
            <p className="text-neutral-400 mb-6">{lab.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-3 uppercase">Explanation</h3>
                    <div className="prose prose-invert prose-sm max-w-none text-neutral-300">
                        {/* Simple markdown parsing for the explanation */}
                        {lab.explanation.split('\n').map((line, i) => {
                            if (line.startsWith('### ')) return <h4 key={i} className="text-white font-semibold mt-4 mb-2">{line.replace('### ', '')}</h4>;
                            if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                            if (line.trim() === '') return <br key={i} />;
                            // bold parsing
                            const formatted = line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                            return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="mb-2" />;
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-3 uppercase">Try it</h3>
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-200">
                            {lab.tryItSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
