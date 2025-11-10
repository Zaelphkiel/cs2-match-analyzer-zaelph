import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Activity, Clock, TrendingUp, Filter, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/constants/api';
import { Match } from '@/types/match';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'live' | 'upcoming'>('live');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data: matches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: api.getMatches,
    refetchInterval: 30000,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  const renderMatch = (match: Match) => {
    const isLive = match.status === 'live';

    return (
      <TouchableOpacity
        key={match.id}
        style={[
          styles.matchCard,
          isLive && styles.matchCardLive,
        ]}
        onPress={() => router.push(`/match/${match.id}`)}
        activeOpacity={0.7}
      >
        {isLive && (
          <View style={styles.liveIndicatorContainer}>
            <Animated.View
              style={[
                styles.livePulse,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}

        <View style={styles.matchHeader}>
          <Text style={styles.eventText}>{match.event}</Text>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{match.format}</Text>
          </View>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamRow}>
            <View style={styles.teamInfo}>
              <Image
                source={{ uri: match.team1.logo }}
                style={styles.teamLogo}
              />
              <View style={styles.teamDetails}>
                <Text style={styles.teamName}>{match.team1.name}</Text>
                <View style={styles.teamStats}>
                  <Text style={styles.rankingText}>#{match.team1.ranking}</Text>
                  <View style={styles.formContainer}>
                    {match.team1.recentForm.map((result, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.formDot,
                          result === 'W'
                            ? styles.formWin
                            : result === 'L'
                            ? styles.formLoss
                            : styles.formDraw,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
            {isLive && match.currentScore && (
              <Text style={styles.scoreText}>{match.currentScore.team1}</Text>
            )}
          </View>

          <View style={styles.teamRow}>
            <View style={styles.teamInfo}>
              <Image
                source={{ uri: match.team2.logo }}
                style={styles.teamLogo}
              />
              <View style={styles.teamDetails}>
                <Text style={styles.teamName}>{match.team2.name}</Text>
                <View style={styles.teamStats}>
                  <Text style={styles.rankingText}>#{match.team2.ranking}</Text>
                  <View style={styles.formContainer}>
                    {match.team2.recentForm.map((result, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.formDot,
                          result === 'W'
                            ? styles.formWin
                            : result === 'L'
                            ? styles.formLoss
                            : styles.formDraw,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
            {isLive && match.currentScore && (
              <Text style={styles.scoreText}>{match.currentScore.team2}</Text>
            )}
          </View>
        </View>

        {isLive && match.currentMap && (
          <View style={styles.currentMapContainer}>
            <Text style={styles.currentMapText}>{match.currentMap.name}</Text>
            <View style={styles.mapScoreContainer}>
              <Text style={styles.mapScore}>
                {match.currentMap.score.team1} - {match.currentMap.score.team2}
              </Text>
            </View>
          </View>
        )}

        {!isLive && (
          <View style={styles.timeContainer}>
            <Clock size={14} color="#FFB84D" />
            <Text style={styles.timeText}>{formatTime(match.startTime)}</Text>
          </View>
        )}

        <View style={styles.mapsContainer}>
          {match.maps?.map((map, idx) => (
            <View key={idx} style={styles.mapBadge}>
              <Text style={styles.mapText}>{map}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>CS2 Analytics</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#FFB84D" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          AI-Powered Match Analysis & Predictions
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'live' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('live')}
          activeOpacity={0.7}
        >
          <Activity
            size={18}
            color={selectedTab === 'live' ? '#FFB84D' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'live' && styles.tabTextActive,
            ]}
          >
            Live ({liveMatches.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'upcoming' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('upcoming')}
          activeOpacity={0.7}
        >
          <TrendingUp
            size={18}
            color={selectedTab === 'upcoming' ? '#FFB84D' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming ({upcomingMatches.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#FFB84D"
          />
        }
      >
        {isLoading && matches.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#FFB84D" />
            <Text style={styles.loadingText}>Loading matches...</Text>
          </View>
        ) : isError ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#F44336" />
            <Text style={styles.emptyText}>Failed to load matches</Text>
            <Text style={styles.emptySubtext}>
              Please check your internet connection
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : selectedTab === 'live' ? (
          liveMatches.length > 0 ? (
            liveMatches.map(renderMatch)
          ) : (
            <View style={styles.emptyState}>
              <Activity size={48} color="#333" />
              <Text style={styles.emptyText}>No live matches</Text>
              <Text style={styles.emptySubtext}>
                Check upcoming matches for scheduled games
              </Text>
            </View>
          )
        ) : upcomingMatches.length > 0 ? (
          upcomingMatches.map(renderMatch)
        ) : (
          <View style={styles.emptyState}>
            <Clock size={48} color="#333" />
            <Text style={styles.emptyText}>No upcoming matches</Text>
            <Text style={styles.emptySubtext}>
              Check back later for scheduled games
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#2A2410',
    borderWidth: 1,
    borderColor: '#FFB84D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  tabTextActive: {
    color: '#FFB84D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  matchCardLive: {
    borderColor: '#FFB84D',
    backgroundColor: '#1A1510',
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  livePulse: {
    position: 'absolute' as const,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    opacity: 0.3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FF4444',
    letterSpacing: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
    flex: 1,
  },
  formatBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  teamsContainer: {
    gap: 16,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  teamLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  teamDetails: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingText: {
    fontSize: 12,
    color: '#FFB84D',
    fontWeight: '600' as const,
  },
  formContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  formDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  formWin: {
    backgroundColor: '#4CAF50',
  },
  formLoss: {
    backgroundColor: '#F44336',
  },
  formDraw: {
    backgroundColor: '#888',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  currentMapContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMapText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  mapScoreContainer: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapScore: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  timeText: {
    fontSize: 13,
    color: '#FFB84D',
    fontWeight: '600' as const,
  },
  mapsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap' as const,
  },
  mapBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center' as const,
    paddingHorizontal: 40,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FFB84D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0A0A0A',
  },
});
