"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    password: string | null;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if password exists in localStorage
        const savedPassword = localStorage.getItem("dashboard_password");
        if (savedPassword) {
            setPassword(savedPassword);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (inputPassword: string): Promise<boolean> => {
        try {
            // Try to make a request with the password to verify it
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: inputPassword }),
            });

            if (res.ok) {
                setPassword(inputPassword);
                setIsAuthenticated(true);
                localStorage.setItem("dashboard_password", inputPassword);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Auth error:", error);
            return false;
        }
    };

    const logout = () => {
        setPassword(null);
        setIsAuthenticated(false);
        localStorage.removeItem("dashboard_password");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, password, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
