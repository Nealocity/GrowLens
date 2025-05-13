import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Camera, Leaf, Building2 } from 'lucide-react-native';
import { useState } from 'react';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<'field' | 'urban' | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <Leaf size={28} color="#047857" />
          </View>
          <Text style={styles.brandName}>GrowLens</Text>
        </View>
        <Text style={styles.subtitle}>Let's grow your indoor garden</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[
            styles.optionCard,
            selectedOption === 'field' && styles.optionCardSelected
          ]}
          onPress={() => setSelectedOption('field')}
        >
          <Leaf 
            size={24} 
            color={selectedOption === 'field' ? '#047857' : '#6B7280'} 
          />
          <Text style={[
            styles.optionTitle,
            selectedOption === 'field' && styles.optionTitleSelected
          ]}>Field</Text>
          <Text style={styles.optionDescription}>
            Open agricultural spaces and farmland
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            selectedOption === 'urban' && styles.optionCardSelected
          ]}
          onPress={() => setSelectedOption('urban')}
        >
          <Building2 
            size={24} 
            color={selectedOption === 'urban' ? '#047857' : '#6B7280'} 
          />
          <Text style={[
            styles.optionTitle,
            selectedOption === 'urban' && styles.optionTitleSelected
          ]}>Urban Space</Text>
          <Text style={styles.optionDescription}>
            Indoor and urban growing environments
          </Text>
        </TouchableOpacity>
      </View>

      {selectedOption === 'field' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Assessment</Text>
          <TouchableOpacity 
            style={styles.assessmentCard}
            onPress={() => router.push({
              pathname: '/(app)/assessment',
              params: { type: 'field' }
            })}
          >
            <View style={styles.cardIcon}>
              <Camera size={24} color="#34D399" />
            </View>
            <Text style={styles.cardTitle}>Analyze Field Space</Text>
            <Text style={styles.cardDescription}>
              Upload photos of your field to get detailed agricultural recommendations
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedOption === 'urban' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growing Preferences</Text>
          <TouchableOpacity 
            style={styles.assessmentCard}
            onPress={() => router.push({
              pathname: '/(app)/assessment',
              params: { type: 'urban' }
            })}
          >
            <View style={styles.cardIcon}>
              <Camera size={24} color="#34D399" />
            </View>
            <Text style={styles.cardTitle}>Start Space Assessment</Text>
            <Text style={styles.cardDescription}>
              Upload a photo of your space and get personalized recommendations
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ECFDF5',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#047857',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  optionsContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  optionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#047857',
  },
  optionDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  assessmentCard: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});