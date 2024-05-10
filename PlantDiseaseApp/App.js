import React, { createContext, useContext, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Switch, ScrollView, ActivityIndicator, Appearance, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker'; 
// theme management
const ThemeContext = createContext();

// Hook to use theme
function useTheme() {
  return useContext(ThemeContext);
}

// Theme Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');
  const [isThemeAutomatic, setThemeAutomatic] = useState(true);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isThemeAutomatic) {
        setTheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, [isThemeAutomatic]);

  const toggleThemeManually = (value) => {
    setThemeAutomatic(false);
    setTheme(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleThemeManually, setThemeAutomatic }}>
      {children}
    </ThemeContext.Provider>
  );
}
//News Screen
function NewsScreen() {
  const { theme } = useTheme();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://eventregistry.org/api/v1/article/getArticles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "action": "getArticles",
            "keyword": "agriculture",
            "articlesPage": 1,
            "articlesCount": 100,
            "articlesSortBy": "date",
            "articlesSortByAsc": false,
            "articlesArticleBodyLen": -1,
            "resultType": "articles",
            "dataType": [
              "news"
            ],
            "apiKey": "81fb3bc0-5d69-4b3b-b4a2-6f4cdd0dad7b"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news articles');
        }

        const json = await response.json();
        setData(json.articles.results || []);
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleViewMore = (url) => {
    // Navigate to the ArticleScreen with the article URL 
    navigation.navigate('Article', { articleUrl: url });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: theme === 'light' ? '#fff' : '#333' }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        data.map((article, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleViewMore(article.url)}
            style={{
              marginBottom: 20,
              backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
              borderRadius: 8,
              padding: 16,
            }}>
            <Image
              source={{ uri: article.image }}
              style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 8 }}
            />
            <Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: 'bold', marginBottom: 8 }}>{article.title}</Text>
            <Text style={{ color: theme === 'light' ? '#333' : '#ccc', marginBottom: 8 }}>{article.description}</Text>
            <Button title="View More" onPress={() => handleViewMore(article.url)} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

// Diagnostics Screen
function DiagnosticsScreen() {
  const handleTakePicture = () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        Alert.alert('User cancelled camera picker');
      } else if (response.errorCode) {
        Alert.alert('Camera Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log('Photo taken: ', source);
      }
    });
  };

  const handleUploadFromGallery = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        Alert.alert('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log('Photo selected: ', source);
      }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Take Picture" onPress={handleTakePicture} />
      <Button title="Upload from Gallery" onPress={handleUploadFromGallery} />
    </View>
  );
}

// Home Screen
function HomeScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'light' ? '#fff' : '#333' }}>
      <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>App is currently in development.</Text>
      <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Not all functions may work.</Text>
      <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Data model has not been implemented into this project so far.</Text>
    </View>
  );
}

// Settings Screen
function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const [isLocationShared, setLocationShared] = useState(false);
  const [isVisualAidEnabled, setVisualAidEnabled] = useState(false);
  const [language, setLanguage] = useState('English');

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleLocationSharing = () => setLocationShared(previousState => !previousState);
  const toggleVisualAid = () => setVisualAidEnabled(previousState => !previousState);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}>Toggle Theme</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={theme === 'light' ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}>Language</Text>
        <Picker
          selectedValue={'English'} // Assuming language state or prop
          style={styles.picker}
          onValueChange={(itemValue) => {/* setLanguage logic here */}}
          itemStyle={{ color: theme === 'light' ? '#000' : '#fff' }}
        >
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Spanish" value="Spanish" />
          <Picker.Item label="French" value="French" />
        </Picker>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  section: {
    marginBottom: 30
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  picker: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  }
});

// Landing Screen
function LandingScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Continue as Guest" onPress={() => navigation.navigate('Main')} />
      <Button title="View Data Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
    </View>
  );
}

// Privacy Policy Screen
function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'light' ? '#fff' : '#333' }}>
      <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Data Privacy Policy Content Goes Here.</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} /> }}
      />
            <Tab.Screen
        name="Diagnostic"
        component={DiagnosticsScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="newspaper" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

function ArticleScreen({ route }) {
  const { articleUrl } = route.params;

  return <WebView source={{ uri: articleUrl }} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
          <Stack.Screen name="Article" component={ArticleScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}