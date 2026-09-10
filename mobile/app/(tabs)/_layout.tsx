import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';
const ORANGE='#D95F18';const MUTED='#8E8E96';
function TabBarBackground(){if(Platform.OS==='ios'&&isGlassEffectAPIAvailable())return <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular"/>;return <View style={[StyleSheet.absoluteFill,styles.fallback]/>}
export default function TabsLayout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:ORANGE,tabBarInactiveTintColor:MUTED,tabBarStyle:{position:'absolute',left:12,right:12,bottom:10,height:70,borderTopWidth:0,backgroundColor:'transparent',elevation:0,paddingBottom:7,paddingTop:5},tabBarBackground:TabBarBackground,tabBarLabelStyle:{fontSize:11,fontWeight:'700'},tabBarHideOnKeyboard:true,sceneStyle:{backgroundColor:'#0A0A0C'}}><Tabs.Screen name="index" options={{title:'Início',tabBarIcon:({color,size})=><Ionicons name="home" color={color} size={size}/>}}/><Tabs.Screen name="lancamentos" options={{title:'Lançamentos',tabBarIcon:({color,size})=><Ionicons name="list" color={color} size={size}/>}}/><Tabs.Screen name="inteligencia" options={{title:'Inteligência',tabBarIcon:({color,size})=><Ionicons name="sparkles" color={color} size={size}/>}}/></Tabs>}
const styles=StyleSheet.create({fallback:{backgroundColor:'rgba(28,28,31,0.96)',borderRadius:30,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'}});
