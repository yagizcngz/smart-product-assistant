import { useState, useRef } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity,
  Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, SafeAreaView,
} from 'react-native';
import MessageBubble from '../components/MessageBubble';
import ProductCard from '../components/ProductCard';
import TypingIndicator from '../components/TypingIndicator';
import { sendMessage } from '../api/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '0', role: 'ai', content: 'Merhaba! 👋 Hangi ürünü arıyorsunuz? Size en uygun seçenekleri önereyim.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const flatListRef = useRef(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setIsLoading(true);
    setProducts([]);

    try {
      const data = await sendMessage(text);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: data.ai_response,
      }]);
      setProducts(data.recommended_products || []);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: 'Bir hata oluştu, lütfen tekrar deneyin.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🤖 Ürün Asistanı</Text>
          <Text style={styles.headerSub}>Gemini AI destekli</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        {products.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.productsSectionTitle}>Önerilen ürünler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Bir şey sorun..."
            placeholderTextColor="#B4B2A9"
            multiline
            onSubmitEditing={handleSend}
            onKeyPress={(e) => {
              // Eğer Web'deysek, klavyeden 'Enter'a basıldıysa VE 'Shift' tuşuna basılı değilse
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault(); // Varsayılan davranışı (alt satıra geçmeyi) iptal et
                handleSend();       // Mesajı gönder
              } 
            }}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E4E2D9',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#2C2C2A' },
  headerSub: { fontSize: 12, color: '#888780', marginTop: 2 },
  messageList: { padding: 16, paddingBottom: 8 },
  productsSection: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#E4E2D9',
    backgroundColor: '#F9F8F4',
  },
  productsSectionTitle: { fontSize: 12, color: '#888780', marginBottom: 8, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: '#E4E2D9',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1, minHeight: 42, maxHeight: 100,
    borderWidth: 1, borderColor: '#D3D1C7',
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 15, color: '#2C2C2A',
    backgroundColor: '#F9F8F4',
  },
  sendBtn: {
    backgroundColor: '#534AB7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 11,
  },
  sendBtnDisabled: { backgroundColor: '#B4B2A9' },
  sendBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});