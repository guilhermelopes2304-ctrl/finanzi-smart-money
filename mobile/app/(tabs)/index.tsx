import { GlassCard } from '@/components/GlassCard';
import { supabase } from '@/lib/supabase';
import { useNativeAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const orange = '#F97316';
type Tx = { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string };

auto function Home() {
  const { session } = useNativeAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      const [profileResult, txResult] = await Promise.all([
        supabase.from('profiles').select('current_balance').eq('id', session.user.id).maybeSingle(),
        supabase.from('transactions').select('id,description,amount,type,date').eq('user_id', session.user.id).order('date', { ascending: false }).limit(20),
      ]);
      if (!active) return;
      if (profileResult.data?.current_balance != null) setBalance(Number(profileResult.data.current_balance));
      if (txResult.data) setTransactions(txResult.data as Tx[]);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  const month = new Date().toISOString().slice(0, 7);
  const monthly = useMemo(() => {
    const items = transactions.filter((tx) => tx.date.startsWith(month));
    return {
      income: items.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0),
      expense: items.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0),
    };
  }, [transactions, month]);

  const quickAdd = async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
  const format = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const firstName = session?.user.user_metadata?.name?.split(' ')[0] ?? 'Gui';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>FINANZZI</Text><Text style={styles.title}>Olá, {firstName}.</Text></View>
          <GlassCard style={styles.avatar}><Text style={styles.avatarText}>{firstName[0]?.toUpperCase() ?? 'G'}</Text></GlassCard>
        </View>

        <GlassCard style={styles.balance}>
          <Text style={styles.label}>Saldo disponível</Text>
          {loading ? <ActivityIndicator color={orange} style={{ alignSelf: 'flex-start', marginVertical: 16 }} /> : <Text style={styles.amount}>{format(balance)}</Text>}
          <View style={styles.balanceRow}><View><Text style={styles.muted}>Entradas</Text><Text style={styles.green}>{format(monthly.income)}</Text></View><View><Text style={styles.muted}>Saídas</Text><Text style={styles.red}>{format(monthly.expense)}</Text></View></View>
        </GlassCard>

        <Pressable onPress={quickAdd} style={styles.quickWrap}>
          <GlassCard interactive style={styles.quick}><View style={styles.plus}><Ionicons name="add" size={25} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.quickTitle}>Registrar gasto</Text><Text style={styles.quickSub}>Diga o que você comprou</Text></View><Ionicons name="arrow-forward" size={20} color="#8E8E93" /></GlassCard>
        </Pressable>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Movimentações</Text><Text style={styles.link}>Ver tudo</Text></View>
        <GlassCard style={styles.list}>
          {loading ? <ActivityIndicator color={orange} style={{ paddingVertical: 24 }} /> : transactions.slice(0, 5).map((tx) => {
            const positive = tx.type === 'income';
            return <View key={tx.id} style={styles.transaction}>
              <View style={styles.icon}><Ionicons name={positive ? 'arrow-down' : 'cart'} size={19} color={orange} /></View>
              <View style={{ flex: 1 }}><Text style={styles.name} numberOfLines={1}>{tx.description || 'Lançamento'}</Text><Text style={styles.muted}>{new Date(`${tx.date}T12:00:00`).toLocaleDateString('pt-BR')}</Text></View>
              <Text style={[styles.value, positive && styles.green]}>{positive ? '+' : '−'} {format(Number(tx.amount))}</Text>
            </View>;
          })}
          {!loading && transactions.length === 0 ? <Text style={styles.empty}>Ainda não há lançamentos.</Text> : null}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F5F5F7'}, content:{padding:20,paddingBottom:120,gap:18}, header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8}, eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2,color:orange}, title:{fontSize:34,fontWeight:'700',letterSpacing:-1.2,color:'#111113',marginTop:2}, avatar:{width:46,height:46,alignItems:'center',justifyContent:'center',borderRadius:23},avatarText:{fontSize:17,fontWeight:'700',color:'#111113'},balance:{padding:24,minHeight:185,justifyContent:'space-between'},label:{fontSize:15,color:'#6E6E73'},amount:{fontSize:42,fontWeight:'700',letterSpacing:-1.8,color:'#111113',marginVertical:6},balanceRow:{flexDirection:'row',gap:48},muted:{fontSize:13,color:'#8E8E93'},green:{color:'#249A5A',fontWeight:'700'},red:{color:'#D94A4A',fontWeight:'700'},quickWrap:{marginTop:0},quick:{padding:17,flexDirection:'row',alignItems:'center',gap:14},plus:{width:46,height:46,borderRadius:23,backgroundColor:orange,alignItems:'center',justifyContent:'center'},quickTitle:{fontSize:16,fontWeight:'700',color:'#111113'},quickSub:{fontSize:13,color:'#8E8E93',marginTop:2},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:21,fontWeight:'700',color:'#111113'},link:{fontSize:14,fontWeight:'600',color:orange},list:{paddingHorizontal:17},transaction:{minHeight:72,flexDirection:'row',alignItems:'center',gap:13,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(60,60,67,.16)'},icon:{width:40,height:40,borderRadius:20,backgroundColor:'rgba(249,115,22,.12)',alignItems:'center',justifyContent:'center'},name:{fontSize:15,fontWeight:'600',color:'#111113'},value:{fontSize:14,fontWeight:'700',color:'#111113'},empty:{paddingVertical:28,textAlign:'center',color:'#8E8E93',fontSize:14}});
