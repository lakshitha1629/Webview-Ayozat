import React, {useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator, View, Text} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('https://www.ayozat.com');
  const [allUrlsTried, setAllUrlsTried] = useState(false);
  const urlsToTry = ['https://www.ayozat.com', 'https://ayozat.com'];
  const artworkImage = require('./assets/images/ayozat.png');
  const playIcon = require('./assets/images/play_icon.png');

  useEffect(() => {
    SplashScreen.hide();
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      playIcon: playIcon,
      pauseIcon: playIcon,
      icon: playIcon, // The notification icon
    });
    
  };
  
  const playTrack = async (url: string) => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'trackId',
      url: url,
      title: 'Ayozat Music',
      artist: 'Ayozat',
      artwork: artworkImage 
    });
    TrackPlayer.play();
  };

  const handlePlayback = (data: any) => {
    if (data.isPlaying) {
      console.log('data.isPlaying',data.isPlaying);
      playTrack(data.url);
    } else {
      TrackPlayer.pause();
    }
  };

  const handleLoadingError = () => {
    const failedUrlIndex = urlsToTry.indexOf(currentUrl);
    if (failedUrlIndex < urlsToTry.length - 1) {
      setCurrentUrl(urlsToTry[failedUrlIndex + 1]);
    } else {
      setAllUrlsTried(true);
    }
  };

  if (allUrlsTried) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18, textAlign: 'center'}}>
          Sorry, the page is unavailable.
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#131313'}}>
      <WebView
        source={{uri: currentUrl}}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#f30543" />
          </View>
        )}
        onError={handleLoadingError}
        onHttpError={handleLoadingError}
        onMessage={event => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'audioURL') {
              console.log({url: message.url, isPlaying: true});
              handlePlayback({url: message.url, isPlaying: true}); // For demonstration. You'll need to adjust this based on your WebView's messages.
            }
          } catch (e) {
            console.error('Failed to parse message from WebView:', e);
          }
        }}
        injectedJavaScript={`
            window.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                const audioElement = document.querySelector('audio');
              
                if (data.action === 'play' && audioElement) {
                  audioElement.play();
                } else if (data.action === 'pause' && audioElement) {
                  audioElement.pause();
                }
              } catch (error) {
                console.error('Failed to handle message:', error);
              }
            });

            setTimeout(() => {
              const audioElement = document.querySelector('audio');
              if (audioElement && audioElement.src) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'audioURL',
                  url: audioElement.src
                }));
              }
            }, 1000);
          true;
        `}
        userAgent="Chrome/58.0.3029.110"
        containerStyle={{backgroundColor: '#131313'}}
        style={{marginTop: 5}}
        originWhitelist={['https://*']}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        incognito={true}
      />
    </View>
  );
}
