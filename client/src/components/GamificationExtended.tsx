import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, Gift, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  points: number;
  weeklyPoints: number;
  streak: number;
}

interface RewardSuggestion {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export function GamificationExtended() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      name: "Alice",
      level: 8,
      points: 5000,
      weeklyPoints: 450,
      streak: 14,
    },
    {
      rank: 2,
      name: "Bob",
      level: 6,
      points: 3500,
      weeklyPoints: 320,
      streak: 10,
    },
    {
      rank: 3,
      name: "Charlie",
      level: 4,
      points: 2000,
      weeklyPoints: 200,
      streak: 5,
    },
  ]);

  const [rewards, setRewards] = useState<RewardSuggestion[]>([
    {
      id: "movie_night",
      name: "Movie Night",
      description: "Choose a movie and watch with family",
      cost: 500,
      icon: "🎬",
    },
    {
      id: "ice_cream",
      name: "Ice Cream Outing",
      description: "Go to favorite ice cream shop",
      cost: 1000,
      icon: "🍦",
    },
    {
      id: "game_time",
      name: "Extra Game Time",
      description: "30 minutes of extra gaming",
      cost: 2000,
      icon: "🎮",
    },
    {
      id: "special_outing",
      name: "Special Outing",
      description: "Choose a special place to visit",
      cost: 3000,
      icon: "🎢",
    },
  ]);

  const [selectedReward, setSelectedReward] = useState<RewardSuggestion | null>(null);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Zap className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* ランキング */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Family Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {entry.rank}
                        </div>
                        <div>
                          <h4 className="font-semibold">{entry.name}</h4>
                          <p className="text-xs text-gray-600">
                            Level {entry.level} • {entry.streak}🔥 streak
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points}</p>
                        <p className="text-xs text-green-600">
                          +{entry.weeklyPoints} this week
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ご褒美 */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReward ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">{selectedReward.icon}</div>
                    <h3 className="text-xl font-semibold">{selectedReward.name}</h3>
                    <p className="text-gray-600 mt-2">{selectedReward.description}</p>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedReward.cost} points
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedReward(null)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500">
                      Redeem
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {rewards.map((reward) => (
                    <button
                      key={reward.id}
                      onClick={() => setSelectedReward(reward)}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="text-3xl mb-2">{reward.icon}</div>
                      <h4 className="font-semibold text-sm">{reward.name}</h4>
                      <p className="text-xs text-yellow-600 font-bold mt-1">
                        {reward.cost} pts
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* アチーブメント */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🌟", name: "First Week", unlocked: true },
                  { icon: "🔥", name: "7-Day Streak", unlocked: true },
                  { icon: "💪", name: "Level 5", unlocked: true },
                  { icon: "🎯", name: "100 Points", unlocked: false },
                  { icon: "🏆", name: "Leaderboard #1", unlocked: false },
                  { icon: "💎", name: "Master", unlocked: false },
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-center transition ${
                      achievement.unlocked
                        ? "bg-yellow-50 border-2 border-yellow-300"
                        : "bg-gray-100 border-2 border-gray-300 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <p className="text-xs font-semibold">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
