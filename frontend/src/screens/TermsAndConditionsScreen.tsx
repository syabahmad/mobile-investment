import { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface Plan {
  id: string;
  name: string;
  dailyProfit: string;
  description: string;
  color: string;
}

type TermsRoute = RouteProp<{ TermsCondition: { selectedPlan: string } }, 'TermsCondition'>;

const TERMS_CONTENT = `
INVESTMENT PLAN TERMS & CONDITIONS

1. ACKNOWLEDGMENT
You acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions before proceeding with your investment plan selection.

2. INVESTMENT DISCLAIMER
- All investments carry risk. Past performance does not guarantee future results.
- The stated daily profit percentages are estimates and subject to market conditions.
- You assume full responsibility for your investment decision.

3. ACCOUNT RESPONSIBILITY
- You are responsible for maintaining the confidentiality of your account credentials.
- All transactions made through your account are your responsibility.
- You agree to notify us immediately of any unauthorized account activity.

4. WITHDRAWAL POLICY
- Withdrawal requests will be processed within 2-5 business days.
- Minimum withdrawal amount applies as per plan terms.
- Withdrawal charges, if any, will be clearly communicated.

5. LIMITATION OF LIABILITY
In no event shall the company be liable for any direct, indirect, incidental, special, consequential, or punitive damages.

6. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use implies acceptance of modified terms.

7. GOVERNING LAW
These terms are governed by applicable laws and regulations.

8. CONTACT & SUPPORT
For support, contact: support@investmentapp.com

By clicking "I Agree", you confirm that you have read and accepted all terms and conditions.
`;

export default function TermsAndConditionsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<TermsRoute>();
  const selectedPlanName = useMemo(() => route.params?.selectedPlan, [route.params]);
  const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onConfirm: () => {} });

  const handleAgree = useCallback(async () => {
    if (!selectedPlanName) {
      setErrorModal({ visible: true, title: 'Error', message: 'Plan information is missing' });
      return;
    }

    try {
      // Here you would ideally call the backend to save the plan selection
      // For now, we'll just navigate to dashboard
      setSuccessModal({ visible: true, title: 'Plan Selected!', message: `You've selected ${selectedPlanName}. Welcome to your investment journey!` });

      // Navigate to Dashboard after a short delay
      setTimeout(() => {
        setSuccessModal({ visible: false, title: '', message: '' });
        // Use replace to prevent going back to terms
        navigation.replace('Dashboard');
      }, 1500);
    } catch (error) {
      setErrorModal({ visible: true, title: 'Error', message: 'Failed to complete plan selection. Please try again.' });
    }
  }, [selectedPlanName, navigation]);

  const handleDecline = useCallback(() => {
    setConfirmModal({
      visible: true,
      title: 'Decline Terms?',
      message: 'You must agree to the terms to proceed with this investment plan.',
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, visible: false });
        navigation.goBack();
      },
    });
  }, [navigation]);

  if (!selectedPlanName) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plan information not found</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Plan Info */}
      <View style={[styles.planBanner, { backgroundColor: `#00A86B20` }]}>
        <Text style={[styles.planNameInBanner, { color: '#00A86B' }]}>{selectedPlanName}</Text>
        <Text style={styles.planDescInBanner}>Investment terms for this plan</Text>
      </View>

      {/* Terms Content */}
      <ScrollView style={styles.termsScroll} contentContainerStyle={styles.termsContent}>
        <Text style={styles.termsTitle}>Terms & Conditions</Text>
        <Text style={styles.termsText}>{TERMS_CONTENT}</Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </Pressable>
        <Pressable style={styles.agreeButton} onPress={handleAgree}>
          <Text style={styles.agreeButtonText}>I Agree</Text>
        </Pressable>
      </View>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        buttonText="Continue"
        onClose={() => setSuccessModal({ ...successModal, visible: false })}
      />

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
      />

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Go Back"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  planBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  planNameInBanner: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescInBanner: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  termsScroll: {
    flex: 1,
  },
  termsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  declineButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  agreeButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  agreeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
