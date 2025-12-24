import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
}

export default function Button({ children, onClick, type = "button", className }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-4 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition ${className}`}
        >
            {children}
        </button>
    );
}
