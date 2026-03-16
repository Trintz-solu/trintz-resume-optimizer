import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = "/api";

interface User {
    id: number;
    name: string;
    email: string;
    plan: "free" | "pro" | "enterprise";
    usage_count: number;
    created_at: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<any>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async (tok: string) => {
        try {
            const res = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${tok}` },
            });
            if (!res.ok) throw new Error("Invalid token");
            const data = await res.json();
            setUser(data);
        } catch {
            // Token invalid — clear everything
            localStorage.removeItem("auth_token");
            setToken(null);
            setUser(null);
        }
    }, []);

    // On mount, hydrate user from stored token
    useEffect(() => {
        if (token) {
            fetchMe(token).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token, fetchMe]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Login failed");
        }
        const { access_token } = await res.json();
        localStorage.setItem("auth_token", access_token);
        setToken(access_token);
        await fetchMe(access_token);
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Registration failed");
        }

        return data;
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (token) await fetchMe(token);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
