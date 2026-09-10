import { GlassView } from 'expo-glass-effect';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.brand}><Text style={styles.eyebrow}>FINANZZI</Text><Text style={styles.title}>Seu dinheiro, no controle.</Text><Text style={styles.subtitle}>Entre para acessar sua vida financeira.</Text></View>
        <GlassView style={styles.card} glassEffectStyle="regular">
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Seu e-mail" placeholderTextColor="#8E8E93" style={styles.input} />
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Sua senha" placeholderTextColor="#8E8E93" style={styles.input} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={signIn} disabled={busy || !email || !password} style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.98 }] }]}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </Pressable>
        </GlassView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F5F5F7'},center:{flex:1,justifyContent:'center',padding:24},brand:{marginBottom:28},eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2,color:'#F97316'},title:{fontSize:34,fontWeight:'700',letterSpacing:-1.3,color:'#111113',marginTop:8},subtitle:{fontSize:16,color:'#6E6E73',marginTop:8},card:{padding:18,borderRadius:28,gap:12},input:{height:54,borderRadius:17,backgroundColor:'rgba(118,118,128,.12)',paddingHorizontal:16,fontSize:16,color:'#111113'},button:{height:54,borderRadius:27,backgroundColor:'#F97316',alignItems:'center',justifyContent:'center',marginTop:4},buttonText:{color:'#fff',fontSize:16,fontWeight:'700'},error:{color:'#C0392B',fontSize:13,lineHeight:18}}
