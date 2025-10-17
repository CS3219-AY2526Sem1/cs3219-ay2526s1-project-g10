"use client"

import { Header } from "../../components/navBar/navBar"
import { useState } from "react";

export default function MatchPage() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<string | null>(null);

  const handleStartMatching = async () =>  { 
    setIsMatching(true);
    setMatchResult(null);

    try {
      const response = await fetch ("http://localhost:3003/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: "userA", 
          difficulty: "easy",
          topic: "math",
        }), // Replace with actual user ID
      });

      const data = await response.json();
      if (data.matchFound) {
        const matchedUser = data.matchedWith.userId || "Unknown User";
        setMatchResult(`Matched with user: ${matchedUser}`);
      } else {
        setMatchResult("No match found after 1 minute. Please try again later.");
      }
    } catch (error) {
      console.error("Error during matching:", error);
      setMatchResult("An error occurred. Please try again.");
    } 

    setIsMatching(false);
  }; 

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Find Your Match</h1>
          <p className="text-muted-foreground">Connect with peers for collaborative coding practice.</p>

          {!isMatching && !matchResult && (
            <button onClick={handleStartMatching}               className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
              Start Matching
            </button>
          )}

          {isMatching && (
            <div className="mt-6">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-lg font-medium text-foreground">
                  Matching in progress...
                </p>
                </div>
            </div>
          )}

          {matchResult && (
            <div className="mt-6 text-lg font-medium text-foreground">
              {matchResult}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
