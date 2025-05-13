import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload } from 'lucide-react-native';
import { getRecraftToken } from '../utils/storage';
import { RECRAFT_API_TOKEN } from '../constants/config';
import { useLocalSearchParams } from 'expo-router';

export default function Assessment() {
  const { type, prompt: initialPrompt } = useLocalSearchParams<{ type: string; prompt: string }>();
  const [image, setImage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: '',
    height: '',
    depth: '',
  });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt || 'Transform this space into a vertical garden. Include modern planters, proper lighting, and efficient irrigation systems.');

  useEffect(() => {
    async function initToken() {
      const storedToken = await getRecraftToken();
      setApiToken(storedToken || RECRAFT_API_TOKEN);
    }
    initToken();
  }, []);

  const preferences = [
    'Edible plants',
    'Decorative only',
    'Low maintenance',
    'Organic'
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setTransformedImageUrl(null);
      setError(null);
    }
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const analyzeSpace = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    if (!apiToken) {
      setError('API token not available');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('image', blob, 'image.png');
      } else {
        const localUri = image;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/png';

        formData.append('image', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }

      const preferencesText = selectedPreferences.length > 0 
        ? `with ${selectedPreferences.join(', ').toLowerCase()}` 
        : '';
      
      const finalPrompt = type === 'urban'
        ? `${prompt} ${preferencesText}`
        : prompt;

      formData.append('prompt', finalPrompt);
      formData.append('strength', '0.7');
      formData.append('style', 'realistic_image');
      formData.append('n', '1');
      formData.append('response_format', 'url');

      const apiResponse = await fetch('https://external.api.recraft.ai/v1/images/imageToImage', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        let errorMessage: string;
        const contentType = apiResponse.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const errorData = await apiResponse.json();
          errorMessage = errorData.message || `API request failed with status ${apiResponse.status}`;
        } else {
          const errorText = await apiResponse.text();
          errorMessage = errorText || `API request failed with status ${apiResponse.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await apiResponse.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        setTransformedImageUrl(data.data[0].url);
        setError(null);
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Error analyzing space:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze space. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Space Assessment</Text>
        <Text style={styles.subtitle}>Let's analyze your growing space</Text>
      </View>

      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
          {transformedImageUrl ? (
            <Image 
              source={{ uri: transformedImageUrl }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <Upload size={32} color="#6B7280" />
              <Text style={styles.uploadText}>Upload space photo</Text>
              <Text style={styles.uploadSubtext}>Tap to choose a photo</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dimensionsContainer}>
          <Text style={styles.sectionTitle}>Space Dimensions</Text>
          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Width (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dimensions.width}
                onChangeText={(text) => setDimensions({ ...dimensions, width: text })}
              />
            </View>
            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dimensions.height}
                onChangeText={(text) => setDimensions({ ...dimensions, height: text })}
              />
            </View>
            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Depth (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dimensions.depth}
                onChangeText={(text) => setDimensions({ ...dimensions, depth: text })}
              />
            </View>
          </View>
        </View>

        {type === 'urban' && (
          <View style={styles.preferencesContainer}>
            <Text style={styles.sectionTitle}>Growing Preferences</Text>
            {preferences.map((preference) => (
              <TouchableOpacity 
                key={preference}
                style={[
                  styles.preferenceItem,
                  selectedPreferences.includes(preference) && styles.preferenceItemSelected
                ]}
                onPress={() => togglePreference(preference)}
              >
                <Text style={[
                  styles.preferenceText,
                  selectedPreferences.includes(preference) && styles.preferenceTextSelected
                ]}>
                  {preference}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.promptContainer}>
          <Text style={styles.sectionTitle}>Prompt</Text>
          <TextInput
            style={styles.promptInput}
            multiline
            numberOfLines={4}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Enter your assessment prompt..."
          />
        </View>

        <TouchableOpacity 
          style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={analyzeSpace}
          disabled={isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze My Space'}
          </Text>
        </TouchableOpacity>

        {transformedImageUrl && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <Text style={styles.recommendationText}>
              Based on your space analysis, we recommend:
            </Text>
            <View style={styles.recommendationList}>
              <Text style={styles.recommendationItem}>• Install vertical planters</Text>
              <Text style={styles.recommendationItem}>• Use LED grow lights</Text>
              <Text style={styles.recommendationItem}>• Set up irrigation system</Text>
              <Text style={styles.recommendationItem}>• Monitor humidity levels</Text>
            </View>
          </View>
        )}
      </View>
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
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  uploadArea: {
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
  },
  uploadSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dimensionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  dimensionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dimensionInput: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preferencesContainer: {
    marginBottom: 24,
  },
  preferenceItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preferenceItemSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  preferenceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#374151',
  },
  preferenceTextSelected: {
    color: '#047857',
    fontFamily: 'Inter_600SemiBold',
  },
  promptContainer: {
    marginBottom: 24,
  },
  promptInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#34D399',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  analyzeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  recommendationsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  recommendationList: {
    gap: 8,
  },
  recommendationItem: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});