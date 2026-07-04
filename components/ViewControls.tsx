import React from 'react';

interface ViewControlsProps {
    isMaximized?: boolean;
    onToggle?: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ isMaximized, onToggle }) => {
    return (
        <div className="flex space-x-1.5 items-center">
            <button 
                onClick={onToggle}
                className="w-3.5 h-3.5 bg-gray-600 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label={isMaximized ? "Minimizar" : "Maximizar"}
            />
            <div className="w-3.5 h-3.5 bg-gray-600 rounded-full cursor-not-allowed" />
            <div className="w-3.5 h-3.5 bg-gray-600 rounded-full cursor-not-allowed" />
        </div>
    );
};

export default ViewControls;
