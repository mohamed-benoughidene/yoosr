"use client"

import { useState } from "react"

interface PreChatFormProps {
    onSubmit: (data: { name: string, email?: string, phone?: string }) => void
    primaryColor: string
    title?: string
    subtitle?: string
    contactMethod?: "email" | "phone"
}

export function PreChatForm({ onSubmit, primaryColor, title, subtitle, contactMethod = "email" }: PreChatFormProps) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [error, setError] = useState("")

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const validatePhone = (phone: string) => {
        // Allow digits, spaces, plus, dashes, parentheses. Min 7 chars.
        return /^[\d\s\+\-\(\)]{7,}$/.test(phone) && /\d/.test(phone)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("Name is required")
            return
        }

        if (contactMethod === "email") {
            if (!email.trim()) {
                setError("Email is required")
                return
            }
            if (!validateEmail(email)) {
                setError("Please enter a valid email address")
                return
            }
            onSubmit({ name, email })
        } else {
            if (!phone.trim()) {
                setError("Phone number is required")
                return
            }
            if (!validatePhone(phone)) {
                setError("Please enter a valid phone number")
                return
            }
            onSubmit({ name, phone })
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div
                className="px-6 py-8 text-white text-center"
                style={{ backgroundColor: primaryColor }}
            >
                <h1 className="text-xl font-bold mb-2">{title || "Welcome!"}</h1>
                <p className="text-sm opacity-90">{subtitle || "Please fill in your details to start chatting."}</p>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

                    {contactMethod === "email" ? (
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                value={phone}
                                onChange={(e) => {
                                    // Only allow valid phone characters
                                    const val = e.target.value
                                    if (/^[\d\s\+\-\(\)]*$/.test(val)) {
                                        setPhone(val)
                                    }
                                }}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Start Chat
                    </button>
                </form>
            </div>
        </div>
    )
}
