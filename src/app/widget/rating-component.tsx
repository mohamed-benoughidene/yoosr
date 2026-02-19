"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingComponentProps {
    onSubmit: (rating: number, feedback: string) => Promise<void>
    primaryColor: string
}

export function RatingComponent({ onSubmit, primaryColor }: RatingComponentProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedback, setFeedback] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return

        setLoading(true)
        try {
            await onSubmit(rating, feedback)
            setSubmitted(true)
        } catch (error) {
            console.error("Failed to submit rating", error)
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="font-medium text-gray-900">Thank you!</h3>
                <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border p-4 shadow-sm w-full max-w-sm mx-auto mt-2">
            <h3 className="text-sm font-medium text-center mb-3 text-gray-700">How would you rate our support?</h3>

            <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="transition-transform hover:scale-110 focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`w-8 h-8 ${(hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
            </div>

            {rating > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Any additional feedback? (Optional)"
                        className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 resize-none h-20"
                        style={{ borderColor: primaryColor }}

                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-2 px-4 rounded-md text-white text-sm font-medium transition-colors disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                </div>
            )}
        </div>
    )
}
