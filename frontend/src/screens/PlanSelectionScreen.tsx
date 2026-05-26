import { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InfoModal from '../components/InfoModal';

interface Plan {
  id: string;
  name: string;
  dailyProfit: string;
  description: string;
  features: string[];
  color: string;
}

const DUMMY_PLANS: Plan[] = [
  {
    id: 'plan-a',
    name: 'Plan A',
    dailyProfit: '2% Daily',
    description: 'Ideal for conservative investors seeking steady returns',
    features: ['Low risk investment', 'Consistent daily earnings', 'Flexible withdrawal'],
    color: '#3B82F6',
  },
  {
    id: 'plan-b',
    name: 'Plan B',
    dailyProfit: '3.5% Daily',
    description: 'Balanced growth strategy with moderate returns',
    features: ['Balanced risk profile', 'Higher daily returns', 'Priority support'],
    color: '#8B5CF6',
  },
  {
    id: 'plan-c',
    name: 'Plan C',
    dailyProfit: '5% Daily',
    description: 'High-growth plan for experienced investors',
    features: ['Higher returns', 'Premium benefits', 'Dedicated account manager'],
    color: '#EC4899',
  },
];

export default function PlanSelectionScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', message: '' });

  const handlePlanSelect = useCallback((planId: string) => {
    setSelectedPlan(planId);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedPlan) {
      setInfoModal({ visible: true, title: 'Select a Plan', message: 'Please select an investment plan to proceed.' });
      return;
    }

    const selected = DUMMY_PLANS.find((p) => p.id === selectedPlan);
    if (selected) {
      // @ts-ignore
      navigation.navigate('TermsCondition', { selectedPlan: selected.name });
    }
  }, [selectedPlan, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Investment Plan</Text>
          <Text style={styles.subtitle}>Choose a plan that aligns with your investment objectives</Text>
        </View>

        {/* Plans Container */}
        <View style={styles.plansContainer}>
          {DUMMY_PLANS.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
              ]}
              onPress={() => handlePlanSelect(plan.id)}
            >
              {/* Plan Header */}
              <View style={styles.planHeader}>
                <View style={styles.planTitleSection}>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <View style={[styles.profitBadge, { borderColor: plan.color }]}>
                  <Text style={[styles.profitText, { color: plan.color }]}>{plan.dailyProfit}</Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Selection Indicator */}
              {selectedPlan === plan.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Information Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Investment Security</Text>
          <Text style={styles.infoText}>
            All investments are processed through secure banking channels. Your funds and personal information are encrypted and protected.
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.actionButton, !selectedPlan && styles.actionButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedPlan}
          >
            <Text style={styles.actionButtonText}>Review Terms & Proceed</Text>
          </Pressable>
        </View>
      </ScrollView>

      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ ...infoModal, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 20,
  },
  plansContainer: {
    marginBottom: 24,
    gap: 14,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },
  profitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  profitText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featuresList: {
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    borderRadius: 50,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
