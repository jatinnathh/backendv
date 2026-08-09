import React from "react";
import { Play } from "lucide-react";

export const SendButton = ({ 
    loading, 
    onClick, 
    method 
}: { 
    loading: boolean; 
    onClick: () => void; 
    method: string;
}) => {
    
    const getMethodColor = (m: string) => {
        switch(m) {
            case "GET": return "bg-blue-600 hover:bg-blue-500 text-white";
            case "POST": return "bg-green-600 hover:bg-green-500 text-white";
            case "PUT": return "bg-amber-600 hover:bg-amber-500 text-white";
            case "PATCH": return "bg-yellow-600 hover:bg-yellow-500 text-white";
            case "DELETE": return "bg-red-600 hover:bg-red-500 text-white";
            default: return "bg-neutral-600 hover:bg-neutral-500 text-white";
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`${getMethodColor(method)} w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>SEND REQUEST</span>
                </>
            )}
        </button>
    );
};
