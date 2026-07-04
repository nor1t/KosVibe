import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { theme } from '../theme';
import type { BusinessAccount, BusinessPlaceClaim, PlaceRequest } from '../repositories/types';

type AdminApprovalScreenProps = { navigation: NavigationProp<ParamListBase> };
type TabKey = 'businesses' | 'claims' | 'placeRequests';

export function AdminApprovalScreen({ navigation }: AdminApprovalScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('placeRequests');
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessAccount[]>([]);
  const [pendingClaims, setPendingClaims] = useState<BusinessPlaceClaim[]>([]);
  const [pendingPlaceReqs, setPendingPlaceReqs] = useState<PlaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const nav = navigation as NavigationProp<ParamListBase & Record<string, object | undefined>>;

  const load = useCallback(async () => {
    setLoading(true);
    const [biz, claims, reqs] = await Promise.all([
      businessRepository.getAdminPendingBusinesses(),
      businessRepository.getAdminPendingClaims(),
      businessRepository.getAdminPendingPlaceRequests(),
    ]);
    setPendingBusinesses(biz);
    setPendingClaims(claims);
    setPendingPlaceReqs(reqs);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleApproveBusiness = async (id: string) => {
    setSubmitting(id);
    try { await businessRepository.approveBusiness(id); setPendingBusinesses(p => p.filter(b => b.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };

  const handleRejectBusiness = (id: string) => {
    Alert.alert('Reject Business', 'Provide a reason for rejection:', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => rejectBusiness(id, 'Rejected by admin') }]);
  };
  const rejectBusiness = async (id: string, notes: string) => {
    setSubmitting(id);
    try { await businessRepository.rejectBusiness(id, notes); setPendingBusinesses(p => p.filter(b => b.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };

  const handleApproveClaim = async (id: string) => {
    setSubmitting(id);
    try { await businessRepository.approveClaim(id); setPendingClaims(p => p.filter(c => c.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };
  const handleRejectClaim = (id: string) => {
    Alert.alert('Reject Claim', 'Provide a reason for rejection:', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => rejectClaim(id, 'Rejected by admin') }]);
  };
  const rejectClaim = async (id: string, notes: string) => {
    setSubmitting(id);
    try { await businessRepository.rejectClaim(id, notes); setPendingClaims(p => p.filter(c => c.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };

  const handleApprovePlaceReq = async (id: string) => {
    setSubmitting(id);
    try { await businessRepository.approvePlaceRequest(id); setPendingPlaceReqs(p => p.filter(r => r.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };
  const handleRejectPlaceReq = (id: string) => {
    Alert.alert('Reject Request', 'Provide a reason for rejection:', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => rejectPlaceReq(id, 'Rejected by admin') }]);
  };
  const rejectPlaceReq = async (id: string, notes: string) => {
    setSubmitting(id);
    try { await businessRepository.rejectPlaceRequest(id, notes); setPendingPlaceReqs(p => p.filter(r => r.id !== id)); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(null); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={40} color={theme.colors.primary} />
        <Text style={styles.title}>Admin Approvals</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, activeTab === 'placeRequests' && styles.tabActive]} onPress={() => setActiveTab('placeRequests')}>
          <Text style={[styles.tabText, activeTab === 'placeRequests' && styles.tabTextActive]}>Requests ({pendingPlaceReqs.length})</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'claims' && styles.tabActive]} onPress={() => setActiveTab('claims')}>
          <Text style={[styles.tabText, activeTab === 'claims' && styles.tabTextActive]}>Claims ({pendingClaims.length})</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'businesses' && styles.tabActive]} onPress={() => setActiveTab('businesses')}>
          <Text style={[styles.tabText, activeTab === 'businesses' && styles.tabTextActive]}>Biz ({pendingBusinesses.length})</Text>
        </Pressable>
      </View>

      {activeTab === 'placeRequests' && (
        <View style={styles.list}>
          {pendingPlaceReqs.length === 0 ? <View style={styles.emptyList}><Ionicons name="checkmark-circle-outline" size={40} color="#42D98C" /><Text style={styles.emptyText}>All place requests reviewed.</Text></View> :
            pendingPlaceReqs.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardHeader}><Ionicons name="restaurant-outline" size={22} color={theme.colors.primary} /><Text style={styles.cardName}>{r.name}</Text></View>
                {r.description ? <Text style={styles.cardDescription}>{r.description}</Text> : null}
                <View style={styles.cardMeta}>
                  {r.cuisine && <View style={styles.metaItem}><Ionicons name="restaurant-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{r.cuisine}</Text></View>}
                  {r.address && <View style={styles.metaItem}><Ionicons name="location-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{r.address}{r.city ? `, ${r.city}` : ''}</Text></View>}
                  {r.phone && <View style={styles.metaItem}><Ionicons name="call-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{r.phone}</Text></View>}
                  {r.website && <View style={styles.metaItem}><Ionicons name="globe-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{r.website}</Text></View>}
                  <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{new Date(r.createdAt).toLocaleDateString()}</Text></View>
                </View>
                <View style={styles.claimActions}>
                  <Pressable style={[styles.approveButton, styles.claimApproveButton]} onPress={() => handleApprovePlaceReq(r.id)} disabled={submitting === r.id}>
                    {submitting === r.id ? <ActivityIndicator size="small" color={theme.colors.surface} /> : <><Ionicons name="checkmark-outline" size={16} color={theme.colors.surface} /><Text style={styles.approveButtonText}>Approve</Text></>}
                  </Pressable>
                  <Pressable style={styles.rejectButton} onPress={() => handleRejectPlaceReq(r.id)} disabled={submitting === r.id}>
                    <Ionicons name="close-outline" size={16} color={theme.colors.surface} /><Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))
          }
        </View>
      )}

      {activeTab === 'businesses' && (
        <View style={styles.list}>
          {pendingBusinesses.length === 0 ? <View style={styles.emptyList}><Ionicons name="checkmark-circle-outline" size={40} color="#42D98C" /><Text style={styles.emptyText}>All businesses reviewed.</Text></View> :
            pendingBusinesses.map(b => (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardHeader}><Ionicons name="business-outline" size={22} color={theme.colors.primary} /><Text style={styles.cardName}>{b.name}</Text></View>
                {b.description ? <Text style={styles.cardDescription}>{b.description}</Text> : null}
                <View style={styles.cardMeta}>
                  {b.email && <View style={styles.metaItem}><Ionicons name="mail-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{b.email}</Text></View>}
                  {b.phone && <View style={styles.metaItem}><Ionicons name="call-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{b.phone}</Text></View>}
                  <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{new Date(b.createdAt).toLocaleDateString()}</Text></View>
                </View>
                <View style={styles.claimActions}>
                  <Pressable style={[styles.approveButton, styles.claimApproveButton]} onPress={() => handleApproveBusiness(b.id)} disabled={submitting === b.id}>
                    {submitting === b.id ? <ActivityIndicator size="small" color={theme.colors.surface} /> : <><Ionicons name="checkmark-outline" size={16} color={theme.colors.surface} /><Text style={styles.approveButtonText}>Approve</Text></>}
                  </Pressable>
                  <Pressable style={styles.rejectButton} onPress={() => handleRejectBusiness(b.id)} disabled={submitting === b.id}>
                    <Ionicons name="close-outline" size={16} color={theme.colors.surface} /><Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))
          }
        </View>
      )}

      {activeTab === 'claims' && (
        <View style={styles.list}>
          {pendingClaims.length === 0 ? <View style={styles.emptyList}><Ionicons name="checkmark-circle-outline" size={40} color="#42D98C" /><Text style={styles.emptyText}>All claims reviewed.</Text></View> :
            pendingClaims.map(c => (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardHeader}><Ionicons name="link-outline" size={22} color={theme.colors.primary} /><Text style={styles.cardName}>Place Claim</Text></View>
                {c.claimMessage ? <Text style={styles.cardDescription}>&ldquo;{c.claimMessage}&rdquo;</Text> : null}
                <View style={styles.cardMeta}><View style={styles.metaItem}><Ionicons name="time-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.metaText}>{new Date(c.createdAt).toLocaleDateString()}</Text></View></View>
                <View style={styles.claimActions}>
                  <Pressable style={[styles.approveButton, styles.claimApproveButton]} onPress={() => handleApproveClaim(c.id)} disabled={submitting === c.id}>
                    {submitting === c.id ? <ActivityIndicator size="small" color={theme.colors.surface} /> : <><Ionicons name="checkmark-outline" size={16} color={theme.colors.surface} /><Text style={styles.approveButtonText}>Approve</Text></>}
                  </Pressable>
                  <Pressable style={styles.rejectButton} onPress={() => handleRejectClaim(c.id)} disabled={submitting === c.id}>
                    <Ionicons name="close-outline" size={16} color={theme.colors.surface} /><Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))
          }
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 16, paddingTop: PAGE_TOP_PADDING, paddingBottom: PAGE_BOTTOM_PADDING },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  header: { marginTop: 25, alignItems: 'center', gap: 8 },
  title: { color: theme.colors.heading, fontSize: 26, fontWeight: '900' },
  tabRow: { flexDirection: 'row', marginTop: 24, gap: 6 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,31,61,0.2)' },
  tabText: { color: theme.colors.mutedText, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: theme.colors.surface },
  list: { marginTop: 20, gap: 12 },
  card: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardName: { color: theme.colors.heading, fontSize: 17, fontWeight: '800', flex: 1 },
  cardDescription: { color: '#E2E6F4', fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  cardMeta: { gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: theme.colors.mutedText, fontSize: 12 },
  claimActions: { flexDirection: 'row', gap: 10 },
  approveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#42D98C' },
  approveButtonText: { color: theme.colors.surface, fontSize: 13, fontWeight: '700' },
  claimApproveButton: { flex: 1 },
  rejectButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, backgroundColor: 'rgba(255,31,61,0.6)' },
  rejectButtonText: { color: theme.colors.surface, fontSize: 13, fontWeight: '700' },
  emptyList: { padding: 40, alignItems: 'center', gap: 10 },
  emptyText: { color: theme.colors.mutedText, fontSize: 15 },
});