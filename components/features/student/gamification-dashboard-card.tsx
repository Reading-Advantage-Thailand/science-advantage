'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Loader2,
  ArrowRight,
  Star,
  Trophy,
  Crown,
  Compass,
  FlaskConical,
  Languages,
  CalendarCheck,
  ScrollText,
  Zap,
  Footprints,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges';

type RecentBadge = {
  badgeType: string;
  unlockedAt: string;
};

type GamificationProfile = {
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  xpProgress: {
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
  };
  recentBadges: RecentBadge[];
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  Trophy,
  Crown,
  Compass,
  FlaskConical,
  Languages,
  Flame,
  CalendarCheck,
  ScrollText,
  Zap,
  Star,
};

type GamificationDashboardCardProps = {
  studentId: string;
};

export function GamificationDashboardCard({
  studentId,
}: GamificationDashboardCardProps) {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/students/${studentId}/gamification-profile`
        );

        if (!response.ok) {
          setError(true);
          setIsLoading(false);
          return;
        }

        const data: GamificationProfile = await response.json();
        setProfile(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching gamification profile:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Complete lessons to start earning XP and badges!
        </p>
        <Link href="/student/profile">
          <Button variant="outline" className="w-full">
            View Learning Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* XP and Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Experience
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {profile.levelName}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{profile.xp} XP</span>
            <span className="text-xs text-muted-foreground">
              Level {profile.level}
            </span>
          </div>
          <Progress value={profile.xpProgress.progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {profile.xpProgress.currentLevelXp} / {profile.xpProgress.nextLevelXp} XP
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <p className="text-sm font-medium">
            {profile.streak} Day{profile.streak !== 1 ? 's' : ''} Streak
          </p>
          <p className="text-xs text-muted-foreground">
            {profile.streak === 0
              ? 'Complete a lesson today to start your streak!'
              : profile.streak < 7
                ? `${7 - profile.streak} more day${7 - profile.streak !== 1 ? 's' : ''} to Streak Warrior`
                : profile.streak < 30
                  ? `${30 - profile.streak} more day${30 - profile.streak !== 1 ? 's' : ''} to Dedicated Learner`
                  : 'Amazing dedication!'}
          </p>
        </div>
      </div>

      {/* Recent Badges */}
      {profile.recentBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Recent Badges
          </p>
          <div className="flex gap-3">
            {profile.recentBadges.map((achievement) => {
              const badgeDef = BADGE_DEFINITIONS.find(
                (b) => b.id === achievement.badgeType
              );
              if (!badgeDef) return null;

              const IconComponent =
                ICON_MAP[badgeDef.icon] || Star;

              return (
                <div
                  key={achievement.badgeType}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {badgeDef.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to full profile */}
      <Link href="/student/profile">
        <Button variant="outline" className="w-full group">
          View Detailed Profile
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}
