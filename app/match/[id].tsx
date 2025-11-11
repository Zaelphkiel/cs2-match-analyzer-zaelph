import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Target,
  Newspaper,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/constants/api';


export default function MatchDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<'predictions' | 'analysis' | 'news'>('predictions');
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ['match', id],
    queryFn: () => api.getMatchDetails(id as string),
    enabled: !!id,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.analyzeMatch(id as string),
  });

  const analysis = analyzeMutation.data;

  useEffect(() => {
    if (analyzeMutation.isPending) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    }
  }, [analyzeMutation.isPending, progressAnim]);

  useEffect(() => {
    let isMounted = true;
    if (!isLoadingMatch && !match && isMounted) {
      router.replace('/+not-found');
    }
    return () => {
      isMounted = false;
    };
  }, [isLoadingMatch, match, router]);

  if (isLoadingMatch) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFB84D" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  if (!match) {
    return null;
  }

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  const renderPredictions = () => {
    if (!analysis || !analysis.overallPrediction) return null;

    const probability = analysis.overallPrediction.probability ?? 0;
    const confidence = analysis.overallPrediction.confidence ?? 0;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Target size={24} color="#FFB84D" />
            <Text style={styles.predictionTitle}>Match Winner Prediction</Text>
          </View>
          <Text style={styles.winnerName}>{analysis.overallPrediction.winner || 'N/A'}</Text>
          <View style={styles.probabilityContainer}>
            <Text style={styles.probabilityLabel}>Win Probability</Text>
            <Text style={styles.probabilityValue}>
              {probability.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.probabilityBar}>
            <View
              style={[
                styles.probabilityFill,
                { width: `${probability}%` },
              ]}
            />
          </View>
          <View style={styles.predictionMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Maps</Text>
              <Text style={styles.metaValue}>{analysis.overallPrediction.totalMaps ?? 0}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Over 2 Maps</Text>
              <Text style={styles.metaValue}>
                {analysis.overallPrediction.over2Maps ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Confidence</Text>
              <Text style={styles.metaValue}>
                {confidence.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Map-by-Map Predictions</Text>
        {(analysis.mapPredictions || []).map((mapPred, idx) => {
          const mapProb = mapPred.probability ?? 0;
          const overUnderConf = mapPred.overUnder?.confidence ?? 0;
          
          return (
            <View key={idx} style={styles.mapPredictionCard}>
              <View style={styles.mapPredHeader}>
                <Text style={styles.mapName}>{mapPred.mapName || 'Unknown'}</Text>
                <View style={styles.mapWinnerBadge}>
                  <Text style={styles.mapWinnerText}>{mapPred.winner || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.mapPredBody}>
                <View style={styles.mapStatRow}>
                  <Text style={styles.mapStatLabel}>Win Probability</Text>
                  <Text style={styles.mapStatValue}>{mapProb.toFixed(1)}%</Text>
                </View>
                <View style={styles.mapStatRow}>
                  <Text style={styles.mapStatLabel}>Expected Rounds</Text>
                  <Text style={styles.mapStatValue}>{mapPred.totalRounds ?? 0}</Text>
                </View>
                {mapPred.overUnder && (
                  <View style={styles.mapStatRow}>
                    <Text style={styles.mapStatLabel}>Over/Under {mapPred.overUnder.line ?? 0}</Text>
                    <Text style={[
                      styles.mapStatValue,
                      mapPred.overUnder.prediction === 'over' ? styles.overText : styles.underText,
                    ]}>
                      {(mapPred.overUnder.prediction || 'N/A').toUpperCase()} ({overUnderConf.toFixed(1)}%)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAnalysis = () => {
    if (!analysis || !analysis.teamAnalysis) return null;

    const renderTeamAnalysis = (team: typeof match.team1, teamData: typeof analysis.teamAnalysis.team1) => {
      if (!teamData) return null;

      return (
        <View style={styles.teamAnalysisCard}>
          <View style={styles.teamAnalysisHeader}>
            <Image source={{ uri: team.logo }} style={styles.teamLogoLarge} />
            <Text style={styles.teamAnalysisName}>{team.name}</Text>
          </View>

          {teamData.strengths && teamData.strengths.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Strengths</Text>
              {teamData.strengths.map((strength, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {teamData.weaknesses && teamData.weaknesses.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Weaknesses</Text>
              {teamData.weaknesses.map((weakness, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <View style={[styles.bulletDot, styles.bulletDotRed]} />
                  <Text style={styles.bulletText}>{weakness}</Text>
                </View>
              ))}
            </View>
          )}

          {teamData.keyPlayers && teamData.keyPlayers.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Key Players</Text>
              {teamData.keyPlayers.map((player, idx) => (
                <View key={idx} style={styles.playerCard}>
                  <Text style={styles.playerName}>{player.name || 'Unknown'}</Text>
                  <View style={styles.playerStats}>
                    <View style={styles.playerStat}>
                      <Text style={styles.playerStatLabel}>Rating</Text>
                      <Text style={styles.playerStatValue}>{(player.rating ?? 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.playerStat}>
                      <Text style={styles.playerStatLabel}>K/D</Text>
                      <Text style={styles.playerStatValue}>{(player.kd ?? 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.playerStat}>
                      <Text style={styles.playerStatLabel}>Form</Text>
                      <Text style={styles.playerStatValue}>{player.recentPerformance || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {teamData.mapPool && teamData.mapPool.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>Map Pool</Text>
              {teamData.mapPool.map((mapStat, idx) => (
                <View key={idx} style={styles.mapStatCard}>
                  <View style={styles.mapStatHeader}>
                    <Text style={styles.mapStatName}>{mapStat.name || 'Unknown'}</Text>
                    <Text style={styles.mapStatWinRate}>{(mapStat.winRate ?? 0).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.mapStatDetails}>
                    <View style={styles.mapStatDetail}>
                      <Text style={styles.mapStatDetailLabel}>CT: {(mapStat.ctWinRate ?? 0).toFixed(1)}%</Text>
                    </View>
                    <View style={styles.mapStatDetail}>
                      <Text style={styles.mapStatDetailLabel}>T: {(mapStat.tWinRate ?? 0).toFixed(1)}%</Text>
                    </View>
                    <View style={styles.mapStatDetail}>
                      <Text style={styles.mapStatDetailLabel}>Best: {mapStat.bestSide || 'N/A'}</Text>
                    </View>
                    <View style={styles.mapStatDetail}>
                      <Text style={styles.mapStatDetailLabel}>{mapStat.playedCount ?? 0} games</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.sectionContainer}>
        {renderTeamAnalysis(match.team1, analysis.teamAnalysis.team1)}
        {renderTeamAnalysis(match.team2, analysis.teamAnalysis.team2)}

        {analysis.h2h && analysis.h2h.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Head-to-Head History</Text>
            {analysis.h2h.map((h2hMatch, idx) => (
              <View key={idx} style={styles.h2hCard}>
                <View style={styles.h2hHeader}>
                  <Text style={styles.h2hDate}>{new Date(h2hMatch.date).toLocaleDateString()}</Text>
                  <Text style={styles.h2hEvent}>{h2hMatch.event || 'Unknown Event'}</Text>
                </View>
                <View style={styles.h2hBody}>
                  <Text style={styles.h2hWinner}>{h2hMatch.winner || 'N/A'}</Text>
                  <Text style={styles.h2hScore}>{h2hMatch.score || 'N/A'}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  const renderNews = () => {
    if (!analysis || analysis.news.length === 0) {
      return (
        <View style={styles.emptyNews}>
          <Newspaper size={48} color="#333" />
          <Text style={styles.emptyNewsText}>No recent news</Text>
          <Text style={styles.emptyNewsSubtext}>Check back for updates</Text>
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer}>
        {analysis.news.map((newsItem) => (
          <View key={newsItem.id} style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <View style={[
                styles.importanceBadge,
                newsItem.importance === 'high' && styles.importanceHigh,
                newsItem.importance === 'medium' && styles.importanceMedium,
              ]}>
                <Text style={styles.importanceText}>{newsItem.importance}</Text>
              </View>
              <Text style={styles.newsTime}>
                {new Date(newsItem.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.newsTitle}>{newsItem.title}</Text>
            <Text style={styles.newsContent}>{newsItem.content}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchInfoCard}>
          <Text style={styles.eventName}>{match.event}</Text>
          <View style={styles.teamsRow}>
            <View style={styles.teamColumn}>
              <Image source={{ uri: match.team1.logo }} style={styles.teamLogoLarge} />
              <Text style={styles.teamNameLarge}>{match.team1.name}</Text>
              <Text style={styles.rankingTextLarge}>#{match.team1.ranking}</Text>
            </View>

            <View style={styles.vsContainer}>
              {match.status === 'live' && match.currentScore ? (
                <View style={styles.liveScoreContainer}>
                  <Text style={styles.liveScore}>
                    {match.currentScore.team1} - {match.currentScore.team2}
                  </Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDotSmall} />
                    <Text style={styles.liveTextSmall}>LIVE</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
            </View>

            <View style={styles.teamColumn}>
              <Image source={{ uri: match.team2.logo }} style={styles.teamLogoLarge} />
              <Text style={styles.teamNameLarge}>{match.team2.name}</Text>
              <Text style={styles.rankingTextLarge}>#{match.team2.ranking}</Text>
            </View>
          </View>

          {match.status === 'live' && match.mapsPicks && match.mapsPicks.length > 0 && (
            <View style={styles.mapsPicksContainer}>
              <Text style={styles.mapsPicksTitle}>Map Picks</Text>
              {match.mapsPicks.map((pick, idx) => (
                <View key={idx} style={styles.mapPickRow}>
                  <View style={styles.mapPickNumber}>
                    <Text style={styles.mapPickNumberText}>{pick.number}</Text>
                  </View>
                  <Text style={styles.mapPickName}>{pick.map}</Text>
                  <Text style={styles.mapPickedBy}>Picked by {pick.pickedBy}</Text>
                </View>
              ))}
            </View>
          )}

          {match.currentMap && (
            <View style={styles.currentMapContainer}>
              <Text style={styles.currentMapTitle}>Current Map</Text>
              <View style={styles.currentMapDetails}>
                <Text style={styles.currentMapName}>{match.currentMap.name}</Text>
                <Text style={styles.currentMapScore}>
                  {match.currentMap.score.team1} - {match.currentMap.score.team2}
                </Text>
              </View>
            </View>
          )}

          {!analysis && (
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyze}
              disabled={analyzeMutation.isPending}
              activeOpacity={0.7}
            >
              {analyzeMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="#0A0A0A" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#0A0A0A" />
                  <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {analyzeMutation.isPending && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Analyzing teams, players, maps, and strategies...
              </Text>
            </View>
          )}

          {analyzeMutation.isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to analyze match</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleAnalyze}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {analysis && (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'predictions' && styles.tabActive,
                ]}
                onPress={() => setSelectedTab('predictions')}
                activeOpacity={0.7}
              >
                <Target size={16} color={selectedTab === 'predictions' ? '#FFB84D' : '#666'} />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'predictions' && styles.tabTextActive,
                  ]}
                >
                  Predictions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'analysis' && styles.tabActive,
                ]}
                onPress={() => setSelectedTab('analysis')}
                activeOpacity={0.7}
              >
                <BarChart3 size={16} color={selectedTab === 'analysis' ? '#FFB84D' : '#666'} />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'analysis' && styles.tabTextActive,
                  ]}
                >
                  Analysis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'news' && styles.tabActive,
                ]}
                onPress={() => setSelectedTab('news')}
                activeOpacity={0.7}
              >
                <Newspaper size={16} color={selectedTab === 'news' ? '#FFB84D' : '#666'} />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'news' && styles.tabTextActive,
                  ]}
                >
                  News
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTab === 'predictions' && renderPredictions()}
            {selectedTab === 'analysis' && renderAnalysis()}
            {selectedTab === 'news' && renderNews()}
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  matchInfoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  eventName: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  teamColumn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  teamLogoLarge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  teamNameLarge: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  rankingTextLarge: {
    fontSize: 14,
    color: '#FFB84D',
    fontWeight: '600' as const,
  },
  vsContainer: {
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#666',
  },
  liveScoreContainer: {
    alignItems: 'center',
    gap: 8,
  },
  liveScore: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
  },
  liveTextSmall: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FF4444',
    letterSpacing: 1,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB84D',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0A0A0A',
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFB84D',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center' as const,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#2A2410',
    borderWidth: 1,
    borderColor: '#FFB84D',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
  },
  tabTextActive: {
    color: '#FFB84D',
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  predictionCard: {
    backgroundColor: '#1A1510',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB84D',
    gap: 12,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  winnerName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  probabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  probabilityLabel: {
    fontSize: 14,
    color: '#888',
  },
  probabilityValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFB84D',
  },
  probabilityBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: '#FFB84D',
  },
  predictionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#888',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  mapPredictionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  mapPredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  mapWinnerBadge: {
    backgroundColor: '#2A2410',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapWinnerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  mapPredBody: {
    gap: 8,
  },
  mapStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapStatLabel: {
    fontSize: 14,
    color: '#888',
  },
  mapStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  overText: {
    color: '#4CAF50',
  },
  underText: {
    color: '#F44336',
  },
  teamAnalysisCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 20,
  },
  teamAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  teamAnalysisName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  analysisSection: {
    gap: 12,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFB84D',
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 6,
  },
  bulletDotRed: {
    backgroundColor: '#F44336',
  },
  bulletText: {
    fontSize: 14,
    color: '#CCC',
    flex: 1,
    lineHeight: 20,
  },
  playerCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  playerStat: {
    flex: 1,
  },
  playerStatLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  playerStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFB84D',
  },
  mapStatCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 12,
  },
  mapStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapStatName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  mapStatWinRate: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFB84D',
  },
  mapStatDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  mapStatDetail: {
    flex: 1,
  },
  mapStatDetailLabel: {
    fontSize: 11,
    color: '#888',
  },
  h2hCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  h2hHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  h2hDate: {
    fontSize: 12,
    color: '#888',
  },
  h2hEvent: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic' as const,
  },
  h2hBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  h2hWinner: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  h2hScore: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  emptyNews: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyNewsText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
  },
  emptyNewsSubtext: {
    fontSize: 14,
    color: '#444',
  },
  newsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 8,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
  },
  importanceHigh: {
    backgroundColor: '#4A1A1A',
  },
  importanceMedium: {
    backgroundColor: '#3A2A1A',
  },
  importanceText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFB84D',
    textTransform: 'uppercase' as const,
  },
  newsTime: {
    fontSize: 11,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  newsContent: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFB84D',
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600' as const,
  },
  retryButton: {
    backgroundColor: '#FFB84D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0A0A0A',
  },
  mapsPicksContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  mapsPicksTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFB84D',
    marginBottom: 12,
  },
  mapPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  mapPickNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPickNumberText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFB84D',
  },
  mapPickName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  mapPickedBy: {
    fontSize: 12,
    color: '#888',
  },
  currentMapContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  currentMapTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FF4444',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  currentMapDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMapName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  currentMapScore: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFB84D',
  },
});
