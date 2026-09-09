import { GlassCard } from '@/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const orange = '#F97316';

export default function Home() {
  const quickAdd = async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>FINANZZI</Text><Text style={styles.title}>Seu dinheiro.</Text></View>
          <GlassCard style={styles.avatar}><Text style={styles.avatarText}>G</Text></GlassCard>
        </View>

        <GlassCard style={styles.balance}>
          <Text style={styles.label}>Saldo disponível</Text>
          <Text style={styles.amount}>R$ 8.234,43</Text>
          <View style={styles.balanceRow}><View><Text style={styles.muted}>Entradas</Text><Text style={styles.green}>R$ 12.480,00</Text></View><View><Text style={styles.muted}>Saídas</Text><Text style={styles.red}>R$ 4.245,57</Text></View></View>
        </GlassCard>

        <Pressable onPress={quickAdd} style={styles.quickWrap}>
          <GlassCard interactive style={styles.quick}><View style={styles.plus}><Ionicons name="add" size={25} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.quickTitle}>Registrar gasto</Text><Text style={styles.quickSub}>Diga o que você comprou</Text></View><Ionicons name="arrow-forward" size={20} color="#8E8E93" /></GlassCard>
        </Pressable>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Este mês</Text><Text style={styles.link}>Ver tudo</Text></View>
        <GlassCard style={styles.list}>
          {[['Supermercado','Hoje','− R$ 182,40','cart'],['Combustível','Ontem','− R$ 120,00','car'],['Pagamento','05 set','+ R$ 4.200,00','arrow-down']].map(([name,date,value,icon]) => <View key={name} style={styles.transaction}><View style={styles.icon}><Ionicons name={icon as any} size={19} color={orange} /></View><View style={{ flex: 1 }}><Text style={styles.name}>{name}</Text><Text style={styles.muted}>{date}</Text></View><Text style={[styles.value, value.startsWith('+') && styles.green]}>{value}</Text></View>)}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F5F5F7'}, content:{padding:20,paddingBottom:120,gap:18}, header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8}, eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:2,color:orange}, title:{fontSize:34,fontWeight:'700',letterSpacing:-1.2,color:'#111113',marginTop:2}, avatar:{width:46,height:46,alignItems:'center',justifyContent:'center',borderRadius:23},avatarText:{fontSize:17,fontWeight:'700',color:'#111113'},balance:{padding:24,minHeight:185,justifyContent:'space-between'},label:{fontSize:15,color:'#6E6E73'},amount:{fontSize:42,fontWeight:'700',letterSpacing:-1.8,color:'#111113',marginVertical:6},balanceRow:{flexDirection:'row',gap:48},muted:{fontSize:13,color:'#8E8E93'},green:{color:'#249A5A',fontWeight:'700'},red:{color:'#D94A4A',fontWeight:'700'},quickWrap:{marginTop:0},quick:{padding:17,flexDirection:'row',alignItems:'center',gap:14},plus:{width:46,height:46,borderRadius:23,backgroundColor:orange,alignItems:'center',justifyContent:'center'},quickTitle:{fontSize:16,fontWeight:'700',color:'#111113'},quickSub:{fontSize:13,color:'#8E8E93',marginTop:2},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:21,fontWeight:'700',color:'#111113'},link:{fontSize:14,fontWeight:'600',color:orange},list:{paddingHorizontal:17},transaction:{minHeight:72,flexDirection:'row',alignItems:'center',gap:13,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(60,60,67,.16)'},icon:{width:40,height:40,borderRadius:20,backgroundColor:'rgba(249,115,22,.12)',alignItems:'center',justifyContent:'center'},name:{fontSize:15,fontWeight:'600',color:'#111113'},value:{fontSize:14,fontWeight:'700',color:'#111113'} });
