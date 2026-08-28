import React, { useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const ENGINE_URL = 'https://example.pages.dev';

export default function App() {
  const webViewRef = useRef(null);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('Qwen engine is not connected yet.');
  const [engineReady, setEngineReady] = useState(false);

  const injectedJavaScript = useMemo(
    () => `
      window.__QWEN_MOBILE_BRIDGE__ = true;
      true;
    `,
    []
  );

  const sendMessage = () => {
    const text = message.trim();
    if (!text || !engineReady) return;

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'chat',
        message: text,
      })
    );
    setMessage('');
    setReply('Thinking…');
  };

  const onWebMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ready') {
        setEngineReady(true);
        setReply('Qwen engine connected.');
        return;
      }

      if (data.type === 'reply') {
        setReply(data.text || '');
        return;
      }

      if (data.type === 'status') {
        setReply(data.text || '');
      }
    } catch {
      setReply(event.nativeEvent.data || '');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Qwen Mobile Chat</Text>
          <Text style={styles.subtitle}>
            {engineReady ? 'Local AI engine ready' : 'Waiting for AI engine'}
          </Text>
        </View>
        <View style={[styles.dot, engineReady && styles.dotReady]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Assistant</Text>
        <Text style={styles.reply}>{reply}</Text>
      </View>

      <View style={styles.composer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={engineReady ? 'Message Qwen…' : 'Engine not connected yet'}
          placeholderTextColor="#6f7890"
          editable={engineReady}
          multiline
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.send, !engineReady && styles.sendDisabled]}
          onPress={sendMessage}
          disabled={!engineReady}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: ENGINE_URL }}
        onMessage={onWebMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        style={styles.hiddenWebView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242b3a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#f7f8fb',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8d96aa',
    fontSize: 13,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#596174',
  },
  dotReady: {
    backgroundColor: '#71df9a',
  },
  card: {
    flex: 1,
    margin: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#111725',
    borderWidth: 1,
    borderColor: '#242b3a',
  },
  label: {
    color: '#7f8aa3',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  reply: {
    color: '#eef1f7',
    fontSize: 16,
    lineHeight: 24,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#293246',
    backgroundColor: '#111725',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  send: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8edf8',
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendText: {
    color: '#0b0f17',
    fontWeight: '700',
  },
  hiddenWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -100,
    top: -100,
  },
});
