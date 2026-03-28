import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'https://cs2-backend-zaelph.onrender.com';

export default function DebugScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: healthData, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  });

  const { data: matchesData, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ['debug-matches'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  });

  const { data: hltvData, isLoading: hltvLoading, error: hltvError, refetch: refetchHltv } = useQuery({
    queryKey: ['debug-hltv'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/matches/sources/hltv`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    enabled: false,
  });

  const { data: pandascoreData, isLoading: pandascoreLoading, error: pandascoreError, refetch: refetchPandascore } = useQuery({
    queryKey: ['debug-pandascore'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/matches/sources/pandascore`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    enabled: false,
  });

  const renderStatus = (loading: boolean, error: any, data: any) => {
    if (loading) {
      return <ActivityIndicator size="small" color="#FFB84D" />;
    }
    if (error) {
      return <XCircle size={20} color="#F44336" />;
    }
    if (data) {
      return <CheckCircle size={20} color="#4CAF50" />;
    }
    return <AlertCircle size={20} color="#888" />;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backend Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Health</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              {renderStatus(healthLoading, healthError, healthData)}
            </View>
            {healthData && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Uptime:</Text>
                  <Text style={styles.value}>
                    {Math.floor(healthData.uptime / 60)}m
                  </Text>
                </View>
                {healthData.apiKeys && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.subsectionTitle}>API Keys:</Text>
                    <View style={styles.row}>
                      <Text style={styles.label}>Browserless:</Text>
                      {healthData.apiKeys.browserless ? (
                        <CheckCircle size={16} color="#4CAF50" />
                      ) : (
                        <XCircle size={16} color="#F44336" />
                      )}
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>ScraperAPI:</Text>
                      {healthData.apiKeys.scraperApi ? (
                        <CheckCircle size={16} color="#4CAF50" />
                      ) : (
                        <XCircle size={16} color="#F44336" />
                      )}
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>PandaScore:</Text>
                      {healthData.apiKeys.pandascore ? (
                        <CheckCircle size={16} color="#4CAF50" />
                      ) : (
                        <XCircle size={16} color="#F44336" />
                      )}
                    </View>
                  </>
                )}
              </>
            )}
            {healthError && (
              <Text style={styles.error}>{String(healthError)}</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => refetchHealth()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matches Endpoint</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              {renderStatus(matchesLoading, matchesError, matchesData)}
            </View>
            {matchesData && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Matches:</Text>
                  <Text style={styles.value}>
                    {matchesData.data?.length || 0}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Cached:</Text>
                  <Text style={styles.value}>
                    {matchesData.cached ? 'Yes' : 'No'}
                  </Text>
                </View>
              </>
            )}
            {matchesError && (
              <Text style={styles.error}>{String(matchesError)}</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => refetchMatches()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HLTV Source</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              {renderStatus(hltvLoading, hltvError, hltvData)}
            </View>
            {hltvData && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Matches:</Text>
                  <Text style={styles.value}>
                    {hltvData.matchesFound || 0}
                  </Text>
                </View>
              </>
            )}
            {hltvError && (
              <Text style={styles.error}>{String(hltvError)}</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => refetchHltv()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Test HLTV</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PandaScore Source</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              {renderStatus(pandascoreLoading, pandascoreError, pandascoreData)}
            </View>
            {pandascoreData && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Matches:</Text>
                  <Text style={styles.value}>
                    {pandascoreData.matchesFound || 0}
                  </Text>
                </View>
              </>
            )}
            {pandascoreError && (
              <Text style={styles.error}>{String(pandascoreError)}</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => refetchPandascore()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Test PandaScore</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend URL</Text>
          <View style={styles.card}>
            <Text style={styles.urlText}>{API_BASE_URL}</Text>
          </View>
        </View>
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
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500' as const,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFB84D',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2A2410',
    borderWidth: 1,
    borderColor: '#FFB84D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFB84D',
  },
  urlText: {
    fontSize: 12,
    color: '#FFB84D',
    fontFamily: 'monospace' as const,
  },
});
