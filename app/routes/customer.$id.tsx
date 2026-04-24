import React, { useState } from 'react';
import { json, redirect } from 'react-router';
import { Link } from 'react-router';
import type { Route } from './+types/customer.$id';
import { 
  ArrowLeft, Sparkles, MessageSquare, Mail, Flame, Activity, Dumbbell, 
  Smile, Frown, Meh, Moon, Droplets, Utensils, Award, CheckCircle2, Droplet 
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Textarea, Input } from '~/components/ui';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// Mock user data with detailed stats
const MOCK_CUSTOMERS = {
  'u1': { id: 'u1', companyId: 'comp1', name: 'Tarik S.', role: 'Premium User', joined: '2025-01-15', status: 'Active', weight: '78kg', height: '182cm', age: 29 },
  'u2': { id: 'u2', companyId: 'comp1', name: 'Amina M.', role: 'Standard', joined: '2025-03-22', status: 'Active', weight: '65kg', height: '168cm', age: 26 },
  'u3': { id: 'u3', companyId: 'comp3', name: 'John Doe', role: 'Premium User', joined: '2024-11-10', status: 'Inactive', weight: '90kg', height: '175cm', age: 40 },
};

const USER_ACTIVITY_DATA = {
  running: [
    { day: 'Mon', calories: 320, km: 4.2 },
    { day: 'Tue', calories: 450, km: 6.1 },
    { day: 'Wed', calories: 150, km: 2.0 },
    { day: 'Thu', calories: 500, km: 7.0 },
    { day: 'Fri', calories: 0, km: 0 },
    { day: 'Sat', calories: 600, km: 8.5 },
    { day: 'Sun', calories: 410, km: 5.5 },
  ],
  mood: [
    { day: 'Mon', state: 'good', icon: Smile, color: 'text-[#4DAB46]', bg: 'bg-[#4DAB46]/10' },
    { day: 'Tue', state: 'good', icon: Smile, color: 'text-[#4DAB46]', bg: 'bg-[#4DAB46]/10' },
    { day: 'Wed', state: 'neutral', icon: Meh, color: 'text-[#FFB900]', bg: 'bg-[#FFB900]/10' },
    { day: 'Thu', state: 'good', icon: Smile, color: 'text-[#4DAB46]', bg: 'bg-[#4DAB46]/10' },
    { day: 'Fri', state: 'bad', icon: Frown, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
    { day: 'Sat', state: 'good', icon: Smile, color: 'text-[#4DAB46]', bg: 'bg-[#4DAB46]/10' },
    { day: 'Sun', state: 'good', icon: Smile, color: 'text-[#4DAB46]', bg: 'bg-[#4DAB46]/10' },
  ],
  diet: {
    planName: 'High Protein / Low Carb',
    macros: { protein: { current: 140, target: 160 }, carbs: { current: 80, target: 100 }, fats: { current: 55, target: 70 } },
    meals: [
      { time: '08:00', name: 'Avocado Toast & Eggs', type: 'Breakfast', cals: 450 },
      { time: '13:30', name: 'Grilled Chicken Salad', type: 'Lunch', cals: 620 },
      { time: '19:00', name: 'Baked Salmon & Asparagus', type: 'Dinner', cals: 580 }
    ]
  },
  exercises: [
    { date: 'Today, 07:00', name: 'Morning HIIT', duration: '45 min', intensity: 'High' },
    { date: 'Yesterday, 18:00', name: 'Core Stability', duration: '30 min', intensity: 'Medium' },
    { date: 'Apr 20, 06:30', name: 'Endurance Run', duration: '60 min', intensity: 'High' },
  ]
};

const WATER_DATA = [
  { day: 'Mon', intake: 2.1, target: 2.5 },
  { day: 'Tue', intake: 2.4, target: 2.5 },
  { day: 'Wed', intake: 1.8, target: 2.5 },
  { day: 'Thu', intake: 2.6, target: 2.5 },
  { day: 'Fri', intake: 2.5, target: 2.5 },
  { day: 'Sat', intake: 3.0, target: 2.5 },
  { day: 'Sun', intake: 2.8, target: 2.5 },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const isAuthenticated = role !== null;
  
  if (!isAuthenticated) {
    return redirect("/login");
  }

  const customer = MOCK_CUSTOMERS[params.id as keyof typeof MOCK_CUSTOMERS];
  
  if (!customer) {
    throw new Response("Customer not found", { status: 404 });
  }

  const userData = {
    user: { 
      name: role === 'super_admin' ? "Super Admin" : role === 'country_admin' ? "Country Admin" : "Company Admin", 
      role 
    },
    customer,
    stats: USER_ACTIVITY_DATA
  };

  return json({ userData });
}

export default function CustomerDetailPage({ loaderData }: Route.ComponentProps) {
  const { userData } = loaderData;
  const { customer: u, stats } = userData;

  const [adminNotes, setAdminNotes] = useState('');
  const [aiInsights, setAiInsights] = useState('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [isDraftingMessage, setIsDraftingMessage] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusPoints, setBonusPoints] = useState(0);

  // Generate mock AI insights
  const generateInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => {
      setAiInsights(`${u.name} shows excellent consistency in their fitness routine with strong cardiovascular performance this week. Their mood trend indicates overall positive well-being despite one challenging day mid-week.

Based on their current activity levels and the administrative context provided, I recommend incorporating more recovery-focused activities on lower-intensity days to prevent burnout and maintain their impressive momentum.`);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  // Generate mock draft message
  const generateDraftMessage = () => {
    setIsDraftingMessage(true);
    setTimeout(() => {
      setDraftMessage(`Hi ${u.name}! I noticed you've been crushing your fitness goals this week - amazing work on that 8.5km run! I also see you had a tough day on Friday, and that's completely normal. Keep up the great momentum, you're doing fantastic! 💪`);
      setIsDraftingMessage(false);
    }, 1500);
  };

  const maxCals = Math.max(...stats.running.map(r => r.calories));

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans">
      <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-12 p-8">
        <Link 
          to={`/customers?role=${userData.user.role}`}
          className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
        >
          <ArrowLeft size={18} />
          Back to {userData.user.role === 'company_admin' ? 'My Users' : 'All Users'}
        </Link>

        {/* Hero Profile Banner */}
        <div className="bg-[#1B173A] rounded-[32px] p-8 text-white shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 border border-[#38383A]">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#5850DE]/40 to-transparent"></div>
          
          <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] flex items-center justify-center text-4xl font-extrabold shadow-[0_0_40px_rgba(88,80,222,0.5)] border-4 border-[#1B173A]">
            {u.name.charAt(0)}
          </div>
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h2 className="text-4xl font-extrabold">{u.name}</h2>
              <Badge variant="secondary">Active Status</Badge>
            </div>
            <p className="text-[#8E8E93] font-medium mb-6 text-lg">{u.role} • Joined {u.joined}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <div><p className="text-[10px] text-[#8E8E93] uppercase font-bold">Weight</p><p className="font-bold text-xl">{u.weight}</p></div>
              <div><p className="text-[10px] text-[#8E8E93] uppercase font-bold">Height</p><p className="font-bold text-xl">{u.height}</p></div>
              <div><p className="text-[10px] text-[#8E8E93] uppercase font-bold">Age</p><p className="font-bold text-xl">{u.age} yrs</p></div>
              <div><p className="text-[10px] text-[#8E8E93] uppercase font-bold">Health Score</p><p className="font-bold text-xl text-[#248FEC]">94/100</p></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Insights Card */}
            <Card className="p-8 bg-gradient-to-br from-[#F8F9FB] to-white border-[#E8E6FC]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  AI Health Analysis
                </h3>
              </div>

              {/* Admin Context Note Section */}
              <div className="mb-6 bg-white p-4 rounded-xl border border-[#E0E1E6] shadow-sm">
                <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare size={14} /> Admin Context & Notes on Feelings
                </label>
                <Textarea 
                  placeholder="E.g., User mentioned they are feeling extremely stressed at work lately..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mb-3"
                />
                {!aiInsights && !isGeneratingInsights && (
                  <Button variant="primary" onClick={generateInsights} className="w-full">
                    <Sparkles size={16} className="mr-2" /> Generate Personalized AI Insights
                  </Button>
                )}
              </div>

              {isGeneratingInsights ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-8 h-8 border-4 border-[#E0E1E6] border-t-[#5850DE] rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-[#8E8E93] animate-pulse">Analyzing health metrics...</p>
                </div>
              ) : aiInsights ? (
                <div className="bg-white p-6 rounded-2xl border border-[#E0E1E6] shadow-sm mt-4">
                  <p className="text-[#1B173A] leading-relaxed whitespace-pre-wrap">{aiInsights}</p>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setAiInsights('')}>
                    Reset Analysis
                  </Button>
                </div>
              ) : null}
            </Card>

            {/* Smart Check-in Message */}
            <Card className="p-8">
              <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                  <Mail size={20} />
                </div>
                Smart Check-in Message
              </h3>
              <p className="text-sm text-[#60646C] mb-4">Draft a personalized check-in message based on {u.name}'s recent health data.</p>
              
              {isDraftingMessage ? (
                <div className="flex items-center justify-center py-6 gap-3 text-[#5850DE] font-bold text-sm">
                  <div className="w-6 h-6 border-4 border-[#E0E1E6] border-t-[#5850DE] rounded-full animate-spin"></div>
                  Drafting encouraging message...
                </div>
              ) : draftMessage ? (
                <div className="space-y-4">
                  <Textarea 
                    value={draftMessage} 
                    onChange={(e) => setDraftMessage(e.target.value)} 
                    className="min-h-[140px] text-sm leading-relaxed" 
                  />
                  <div className="flex gap-3">
                    <Button variant="primary" className="flex-1">
                      <Mail size={16} className="mr-2"/> Send Email
                    </Button>
                    <Button variant="outline" onClick={() => setDraftMessage('')}>Discard</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={generateDraftMessage} className="w-full">
                  <Sparkles size={16} className="mr-2 text-[#5850DE]" /> Generate Draft
                </Button>
              )}
            </Card>

            {/* Running & Calories Chart */}
            <Card className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4E5] text-[#FFB900] flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  Activity & Burn
                </h3>
              </div>

              {/* Custom Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-2 border-b border-[#E0E1E6] pb-4 mb-4">
                {stats.running.map((day, idx) => {
                  const heightPercentage = day.calories === 0 ? 0 : Math.max(10, (day.calories / maxCals) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-[#1B173A] text-white px-2 py-1 rounded-md absolute -translate-y-8 pointer-events-none">
                        {day.calories} kcal
                      </span>
                      <div className="w-full max-w-[40px] bg-[#F0F0F3] rounded-t-lg relative flex items-end justify-center overflow-hidden transition-all group-hover:bg-[#E0E1E6]" style={{ height: '100%' }}>
                        <div 
                          className="w-full bg-gradient-to-t from-[#5850DE] to-[#248FEC] rounded-t-lg transition-all duration-1000 ease-out shadow-[0_-5px_15px_rgba(88,80,222,0.2)]" 
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-[#8E8E93] group-hover:text-[#1B173A] transition-colors">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Exercise Logs */}
            <Card className="p-8">
              <h3 className="text-xl font-extrabold text-[#1B173A] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                  <Dumbbell size={20} />
                </div>
                Recent Workouts
              </h3>
              <div className="space-y-4">
                {stats.exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#E0E1E6] rounded-2xl hover:border-[#5850DE] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F8F9FB] flex items-center justify-center text-[#1B173A] group-hover:bg-[#5850DE] group-hover:text-white transition-colors">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B173A] text-lg">{ex.name}</h4>
                        <p className="text-sm font-medium text-[#8E8E93]">{ex.date} • {ex.duration}</p>
                      </div>
                    </div>
                    <Badge variant={ex.intensity === 'High' ? 'destructive' : 'secondary'}>
                      {ex.intensity}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Mood Tracker */}
            <Card className="p-6">
              <h3 className="text-lg font-extrabold text-[#1B173A] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E5F6E4] text-[#4DAB46] flex items-center justify-center">
                  <Smile size={16} />
                </div>
                Mood & Wellness
              </h3>
              <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-3">Last 7 Days</p>
              <div className="flex justify-between items-center bg-[#F8F9FB] p-3 rounded-2xl border border-[#E0E1E6]">
                {stats.mood.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.bg} ${m.color}`} title={m.state}>
                      <m.icon size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[9px] font-bold text-[#8E8E93] uppercase">{m.day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="border border-[#E0E1E6] rounded-2xl p-4 text-center">
                  <Moon className="text-[#5850DE] mx-auto mb-2" size={24} />
                  <p className="text-xl font-extrabold text-[#1B173A]">7.2<span className="text-sm">h</span></p>
                  <p className="text-[10px] font-bold text-[#8E8E93] uppercase">Avg Sleep</p>
                </div>
                <div className="border border-[#E0E1E6] rounded-2xl p-4 text-center">
                  <Droplets className="text-[#248FEC] mx-auto mb-2" size={24} />
                  <p className="text-xl font-extrabold text-[#1B173A]">2.4<span className="text-sm">L</span></p>
                  <p className="text-[10px] font-bold text-[#8E8E93] uppercase">Avg Hydration</p>
                </div>
              </div>
            </Card>

            {/* Water Tracker */}
            <Card className="border-t-4 border-t-[#248FEC]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="text-[#248FEC]" fill="currentColor" size={18} />
                  Hydration Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WATER_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E1E6" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93' }} dy={10} />
                      <YAxis hide />
                      <RechartsTooltip cursor={{fill: '#F8F9FB'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="intake" name="Intake (L)" radius={[4, 4, 0, 0]}>
                        {WATER_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.intake >= entry.target ? '#248FEC' : '#93C5FD'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Diet Plan */}
            <Card className="p-6 border-t-4 border-t-[#4DAB46]">
              <h3 className="text-lg font-extrabold text-[#1B173A] mb-2 flex items-center gap-2">
                <Utensils className="text-[#4DAB46]" size={18} />
                Diet Plan
              </h3>
              <p className="font-bold text-[#5850DE] mb-6">{stats.diet.planName}</p>

              {/* Macros */}
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Protein', key: 'protein', color: 'bg-[#5850DE]' },
                  { label: 'Carbs', key: 'carbs', color: 'bg-[#248FEC]' },
                  { label: 'Fats', key: 'fats', color: 'bg-[#FFB900]' },
                ].map(macro => {
                  const data = stats.diet.macros[macro.key as keyof typeof stats.diet.macros];
                  const pct = Math.min(100, (data.current / data.target) * 100);
                  return (
                    <div key={macro.key}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-[#1B173A]">{macro.label}</span>
                        <span className="text-[#8E8E93]">{data.current}g / {data.target}g</span>
                      </div>
                      <div className="w-full h-2 bg-[#F0F0F3] rounded-full overflow-hidden">
                        <div className={`h-full ${macro.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meals List */}
              <div className="bg-[#F8F9FB] rounded-2xl p-4 space-y-3 border border-[#E0E1E6]">
                <div className="flex items-center justify-between border-b border-[#E0E1E6] pb-2">
                  <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">Today's Meals</p>
                </div>
                
                {stats.diet.meals.map((meal, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#E0E1E6] shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-[#1B173A]">{meal.name}</p>
                      <p className="text-[10px] font-bold text-[#8E8E93]">{meal.type} • {meal.time}</p>
                    </div>
                    <span className="text-xs font-bold text-[#5850DE] bg-[#F8F9FB] px-2 py-1 rounded-md border border-[#E0E1E6]">{meal.cals} kcal</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Monthly Bonus System */}
            <Card className="p-6 border-t-4 border-t-[#FFB900]">
              <h3 className="text-lg font-extrabold text-[#1B173A] mb-2 flex items-center gap-2">
                <Award className="text-[#FFB900]" size={18} />
                Monthly Bonus Rewards
              </h3>
              <p className="text-xs text-[#60646C] mb-4 font-medium">Reward this user with wellness points for their consistency this month.</p>
              
              <div className="bg-[#FFF4E5] p-4 rounded-2xl border border-[#FFE4B5] flex justify-between items-center mb-4">
                <span className="font-bold text-[#1B173A] text-sm">Current Points:</span>
                <span className="text-2xl font-extrabold text-[#FFB900]">{bonusPoints}</span>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="Points" 
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className="w-24 focus-visible:ring-[#FFB900]" 
                />
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#E0E1E6] hover:border-[#FFB900] hover:text-[#FFB900] transition-colors shadow-sm" 
                  onClick={() => {
                    const val = parseInt(bonusAmount) || 0;
                    if(val > 0) {
                      setBonusPoints(prev => prev + val);
                      setBonusAmount('');
                    }
                  }}
                >
                  Award Bonus
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}