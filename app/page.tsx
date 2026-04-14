'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
// 1. IMPORTAÇÕES DE DATA (O que vai resolver a maioria dos erros)
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 2. LISTA COMPLETA DE ÍCONES (Adicionei os que estavam faltando)
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  Lock,
  XCircle,
  Loader2,
  LogIn,
  User as UserIcon,
  Edit,       // Faltava este
  Trash2,     // Faltava este
  MapPin,     // Faltava este
  ExternalLink, // Faltava este
  MessageCircle, // Faltava este
  Copy,       // Faltava este
  Save,       // Faltava este
  CheckCircle2, // Faltava este
  History     // Faltava este (veja a nota abaixo)
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ModeToggle } from "./components/ModeToggle";

// --- Types ---

type Player = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  isMonthly: boolean;
  monthlyFee: number;
  lastPaymentDate?: string;
  phone?: string;
};

type Attendance = {
  id: string;
  date: string;
  playerIds: string[]; // IDs of players who were present
  absentIds: string[]; // IDs of players who were absent
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'monthly_fee' | 'field_rent' | 'equipment' | 'other';
  playerId?: string | null;
};

type GroupInfo = {
  name: string;
  location: string;
  time: string;
  fieldCost: number;
};

// --- Initial Data ---

const INITIAL_GROUP: GroupInfo = {
  name: "Pelada dos Amigos",
  location: "Arena Central",
  time: "Quarta-feira, 20:00",
  fieldCost: 200,
};

// --- Components ---

const SidebarItem = ({
  icon: Icon,
  label,
  id,
  activeTab,
  setActiveTab,
  setIsSidebarOpen
}: {
  icon: any,
  label: string,
  id: 'dashboard' | 'players' | 'games' | 'finance' | 'group',
  activeTab: string,
  setActiveTab: (id: any) => void,
  setIsSidebarOpen: (open: boolean) => void
}) => (
  <button
    onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
      ? 'bg-black text-white shadow-lg shadow-black/10'
      : 'text-gray-500 hover:bg-gray-100'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const AuthScreen = ({ onLogin }: { onLogin: (session: Session) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) onLogin(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          onLogin(data.session);
        } else {
          setError('Verifique seu e-mail para confirmar o cadastro.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-black/20">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PeladaPro</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão inteligente para sua pelada</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-start gap-3"
            >
              <XCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserIcon size={20} />}
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function PeladaPro() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'games' | 'finance' | 'group'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State with Supabase persistence
  const [group, setGroup] = useState<GroupInfo & { inviteCode?: string }>(INITIAL_GROUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'placeholder'>('placeholder');

  // Modal States
  const [modalType, setModalType] = useState<'player' | 'attendance' | 'transaction' | 'group' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [novoTelefone, setNovoTelefone] = useState('');

  const mensalistas = players.filter(p => p.isMonthly === true && p.status === 'active');
  const avulsos = players.filter(p => p.isMonthly === false && p.status === 'active');
  const isAdmin = userRole === 'admin';
  const isPlayer = userRole === 'member';

  const handleWhatsAppClick = (phone: string, name: string) => {
    if (!phone) {
      alert("Este jogador não tem um número de WhatsApp cadastrado.");
      return;
    }
    // Remove tudo que não é número
    const cleanPhone = phone.replace(/\D/g, "");

    // Mensagem padrão de cobrança
    const message = `Fala ${name}! Beleza? ⚽ Passando pra lembrar da pendência da pelada. Quando puder, fortalece o Pix da galera! Valeu! 👊`;

    // Monta o link (adicionando o 55 do Brasil automaticamente)
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  // Load from Supabase on mount
  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        // Fetch User's Group Membership
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!memberData) {
          setGroupId(null);
          setUserRole(null);
          setIsLoaded(true);
          return;
        }

        setGroupId(memberData.group_id);
        setUserRole(memberData.role as 'admin' | 'member');

        // Check if using placeholder
        const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (isPlaceholder) {
          setSupabaseStatus('placeholder');
        } else {
          setSupabaseStatus('connected');
        }

        // Fetch Group Settings
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', memberData.group_id)
          .single();

        if (groupData) {
          setGroup({
            name: groupData.name,
            location: groupData.location,
            time: groupData.time,
            fieldCost: Number(groupData.field_cost) || 0,
            inviteCode: groupData.invite_code
          });
        }

        // Fetch Players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('group_id', memberData.group_id)
          .order('name');

        if (playersData) {
          setPlayers(playersData.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status as 'active' | 'inactive',
            isMonthly: p.is_monthly,
            monthlyFee: Number(p.monthly_fee) || 0
          })));
        }

        // Fetch Attendances
        const { data: attendancesData, error: attendancesError } = await supabase
          .from('attendances')
          .select('*')
          .eq('group_id', memberData.group_id)
          .order('date', { ascending: false });

        if (attendancesData) {
          setAttendances(attendancesData.map(a => ({
            id: a.id,
            date: a.date,
            playerIds: a.player_ids,
            absentIds: a.absent_ids
          })));
        }

        // Fetch Transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('group_id', memberData.group_id)
          .order('date', { ascending: false });

        if (transactionsData) {
          setTransactions(transactionsData.map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: Number(t.amount) || 0,
            type: t.type as 'income' | 'expense',
            category: t.category as any,
            playerId: t.player_id
          })));
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Error fetching data:', err);
        setSupabaseStatus('error');
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [session]);


  // Lógica para calcular o Top 3 Frequência
  const topPlayers = useMemo(() => {
    if (players.length === 0 || attendances.length === 0) return [];

    const stats = players.map(player => {
      const appearanceCount = attendances.filter(a =>
        a.playerIds.includes(player.id)
      ).length;
      return { ...player, appearances: appearanceCount };
    });

    return stats
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 3);
  }, [players, attendances]);


  // Delay chart rendering to ensure parent dimensions are stable
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsChartReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // --- Calculations ---

  const cashBalance = useMemo(() => {
    return transactions.reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );
  }, [transactions]);

  const paidPlayerIds = useMemo(() => {
    const now = new Date();
    const currentMonthStr = format(now, 'yyyy-MM');
    return new Set(
      transactions
        .filter(t => {
          if (t.category !== 'monthly_fee' || !t.playerId || !t.date) return false;
          try {
            const tDate = typeof t.date === 'string'
              ? (t.date.includes('T') ? parseISO(t.date) : new Date(t.date + 'T00:00:00'))
              : new Date(t.date);
            return format(tDate, 'yyyy-MM') === currentMonthStr;
          } catch (e) {
            return false;
          }
        })
        .map(t => String(t.playerId))
    );
  }, [transactions]);

  const monthlyStats = useMemo(() => {
    const activePlayers = players.filter(p => p.status === 'active' && p.isMonthly);
    const paidCount = activePlayers.filter(p => paidPlayerIds.has(String(p.id))).length;

    return {
      total: activePlayers.length,
      paid: paidCount,
      pending: Math.max(0, activePlayers.length - paidCount)
    };
  }, [players, paidPlayerIds]);

  const monthlyFinanceStats = useMemo(() => {
    const now = new Date();
    const currentMonthStr = format(now, 'yyyy-MM');

    // 1. Calcula o que REALMENTE entrou e saiu (o que está no banco)
    const totals = transactions.reduce((acc, t) => {
      try {
        const tDate = typeof t.date === 'string'
          ? (t.date.includes('T') ? parseISO(t.date) : new Date(t.date + 'T00:00:00'))
          : new Date(t.date);

        if (format(tDate, 'yyyy-MM') === currentMonthStr) {
          if (t.type === 'income') acc.income += t.amount;
          else acc.expense += t.amount;
        }
      } catch (e) { }
      return acc;
    }, { income: 0, expense: 0 });

    // 2. Calcula quanto os AVULSOS devem (Baseado nas presenças do mês)
    const dividaAvulsos = attendances.reduce((total, game) => {
      try {
        const gameDate = typeof game.date === 'string' ? parseISO(game.date) : new Date(game.date);

        // Só conta jogos deste mês
        if (format(gameDate, 'yyyy-MM') === currentMonthStr) {
          // Filtra quem estava no jogo e é avulso
          const avulsosPresentes = game.playerIds.filter(id =>
            avulsos.some(a => String(a.id) === String(id))
          );

          // Soma o valor da diária de cada um
          const somaJogo = avulsosPresentes.reduce((sub, id) => {
            const player = avulsos.find(p => String(p.id) === String(id));
            return sub + (player?.monthlyFee || 0);
          }, 0);

          return total + somaJogo;
        }
      } catch (e) { }
      return total;
    }, 0);


    const expectativaMensalistas = mensalistas.reduce((acc, p) => acc + (p.monthlyFee || 0), 0);

    return {
      ...totals,
      dividaAvulsos,
      saldoPendente: expectativaMensalistas + dividaAvulsos - totals.income
    };
  }, [transactions, attendances, avulsos, mensalistas]);

  const chartData = useMemo(() => {
    // Last 6 months of balance
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return format(d, 'MMM', { locale: ptBR });
    });

    // Use a deterministic calculation for mock data to satisfy purity rules
    return months.map((month, i) => ({
      name: month,
      balance: 100 + (i * 50) + (i % 2 === 0 ? 30 : 0) // Deterministic mock data
    }));
  }, []);

  // --- Handlers ---

  const createGroup = async (name: string) => {
    if (!name.trim() || !session?.user?.id) {
      alert('Você precisa estar logado para criar um grupo.');
      return;
    }

    try {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteCode = `PELADA-${randomPart}`;

      console.log('Tentando criar grupo:', { name, inviteCode, userId: session.user.id });

      const { data: groups, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: name.trim(),
          invite_code: inviteCode,
          created_by: session.user.id,
          location: 'Quadra Municipal',
          time: 'Sábado, 16h',
          field_cost: 150.00
        }])
        .select();

      if (groupError) {
        console.error('Erro Supabase (Groups):', groupError);
        throw new Error(`Erro ao criar grupo: ${groupError.message} (${groupError.details || 'sem detalhes'})`);
      }

      const groupData = groups?.[0];

      if (groupData) {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert([{
            group_id: groupData.id,
            user_id: session.user.id,
            role: 'admin'
          }]);

        if (memberError) {
          console.error('Erro Supabase (Members):', memberError);
          throw new Error(`Erro ao entrar no grupo como admin: ${memberError.message}`);
        }

        setGroupId(groupData.id);
        setUserRole('admin');
        setGroup({
          name: groupData.name,
          location: groupData.location || '',
          time: groupData.time || '',
          fieldCost: Number(groupData.field_cost) || 0,
          inviteCode: groupData.invite_code
        });
      } else {
        throw new Error('Grupo criado, mas não foi possível recuperar os dados. Tente atualizar a página.');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      alert(error.message || 'Ocorreu um erro inesperado ao criar o grupo.');
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!inviteCode.trim() || !session?.user?.id) {
      alert('Você precisa estar logado para entrar em um grupo.');
      return;
    }

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (groupError || !groupData) {
        alert('Código de convite inválido ou grupo não encontrado.');
        return;
      }

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupData.id,
          user_id: session.user.id,
          role: 'member'
        }]);

      if (memberError) {
        if (memberError.code === '23505') {
          // Já é membro, apenas carrega o grupo
          setGroupId(groupData.id);
          setUserRole('member');
          setGroup({
            name: groupData.name,
            location: groupData.location || '',
            time: groupData.time || '',
            fieldCost: Number(groupData.field_cost) || 0,
            inviteCode: groupData.invite_code
          });
          return;
        } else {
          console.error('Erro Supabase (Join):', memberError);
          throw new Error(`Erro ao entrar no grupo: ${memberError.message}`);
        }
      }

      setGroupId(groupData.id);
      setUserRole('member');
      setGroup({
        name: groupData.name,
        location: groupData.location || '',
        time: groupData.time || '',
        fieldCost: Number(groupData.field_cost) || 0,
        inviteCode: groupData.invite_code
      });
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      alert(error.message || 'Erro ao entrar no grupo. Tente novamente.');
    }
  };

  const updateGroupSettings = async (updates: Partial<GroupInfo>) => {
    if (userRole !== 'admin') return;
    const newGroup = { ...group, ...updates };
    setGroup(newGroup);

    await supabase
      .from('groups')
      .update({
        name: newGroup.name,
        location: newGroup.location,
        time: newGroup.time,
        field_cost: newGroup.fieldCost
      })
      .eq('id', groupId);
  };

  const addPlayer = async (name: string, isMonthly: boolean, fee: number, phone: string) => {
    if (userRole !== 'admin') return;

    const { data, error } = await supabase
      .from('players')
      .insert([{
        group_id: groupId,
        name,
        is_monthly: isMonthly,
        monthly_fee: fee,
        phone, // <--- Aqui o telefone é enviado para a coluna 'phone' do seu banco
        status: 'active'
      }])
      .select()
      .single();

    if (data) {
      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        status: data.status as 'active' | 'inactive',
        isMonthly: data.is_monthly,
        monthlyFee: Number(data.monthly_fee) || 0,
        phone: data.phone // <--- Garante que o telefone apareça na lista sem precisar recarregar
      };
      setPlayers(prev => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)));

      // Limpa o estado do telefone para o próximo cadastro
      setNovoTelefone('');
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    if (userRole !== 'admin') return;
    setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));

    const supabaseUpdates: any = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.isMonthly !== undefined) supabaseUpdates.is_monthly = updates.isMonthly;
    if (updates.monthlyFee !== undefined) supabaseUpdates.monthly_fee = updates.monthlyFee;

    await supabase
      .from('players')
      .update(supabaseUpdates)
      .eq('id', id);
  };

  const togglePlayerStatus = async (id: string) => {
    if (userRole !== 'admin') return;
    const player = players.find(p => p.id === id);
    if (!player) return;

    const newStatus = player.status === 'active' ? 'inactive' : 'active';
    updatePlayer(id, { status: newStatus });
  };

  const deletePlayer = async (id: string) => {
    if (userRole !== 'admin') return;
    if (confirm(`Deseja realmente excluir o jogador?`)) {
      setPlayers(players.filter(p => p.id !== id));
      await supabase.from('players').delete().eq('id', id);
    }
  };

  const recordAttendance = async (date: string, presentIds: string[], absentIds: string[]) => {
    if (userRole !== 'admin') return;
    const { data, error } = await supabase
      .from('attendances')
      .insert([{
        group_id: groupId,
        date,
        player_ids: presentIds,
        absent_ids: absentIds
      }])
      .select()
      .single();

    if (data) {
      const newAttendance: Attendance = {
        id: data.id,
        date: data.date,
        playerIds: data.player_ids,
        absentIds: data.absent_ids
      };
      setAttendances(prev => [newAttendance, ...prev]);
    }
  };

  const updateAttendance = async (id: string, updates: Partial<Attendance>) => {
    if (userRole !== 'admin') return;
    setAttendances(attendances.map(a => a.id === id ? { ...a, ...updates } : a));

    const supabaseUpdates: any = {};
    if (updates.date !== undefined) supabaseUpdates.date = updates.date;
    if (updates.playerIds !== undefined) supabaseUpdates.player_ids = updates.playerIds;
    if (updates.absentIds !== undefined) supabaseUpdates.absent_ids = updates.absentIds;

    await supabase
      .from('attendances')
      .update(supabaseUpdates)
      .eq('id', id);
  };

  const deleteAttendance = async (id: string) => {
    if (userRole !== 'admin') return;
    if (confirm(`Deseja realmente excluir este registro de presença?`)) {
      setAttendances(attendances.filter(a => a.id !== id));
      await supabase.from('attendances').delete().eq('id', id);
    }
  };

  const addTransaction = async (description: string, amount: number, type: 'income' | 'expense', category: Transaction['category'], playerId?: string | null) => {
    if (userRole !== 'admin') return;
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        group_id: groupId,
        description,
        amount,
        type,
        category,
        player_id: playerId,
        date: format(new Date(), 'yyyy-MM-dd')
      }])
      .select()
      .single();

    if (data) {
      const newTransaction: Transaction = {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: Number(data.amount) || 0,
        type: data.type as 'income' | 'expense',
        category: data.category as any,
        playerId: data.player_id
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (userRole !== 'admin') return;
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));

    const supabaseUpdates: any = {};
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.amount !== undefined) supabaseUpdates.amount = updates.amount;
    if (updates.type !== undefined) supabaseUpdates.type = updates.type;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.playerId !== undefined) supabaseUpdates.player_id = updates.playerId;
    else if ('playerId' in updates) supabaseUpdates.player_id = null;

    await supabase
      .from('transactions')
      .update(supabaseUpdates)
      .eq('id', id);
  };

  const deleteTransaction = async (id: string) => {
    if (userRole !== 'admin') return;
    setTransactions(transactions.filter(t => t.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
    setDeletingId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onLogin={setSession} />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 text-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
              <TrendingUp size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Bem-vindo!</h1>
              <p className="text-slate-400 text-sm">Crie ou entre em uma pelada</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Criar Novo Grupo</label>
              <div className="flex gap-2">
                <input
                  id="create-group-input"
                  type="text"
                  placeholder="Nome da Pelada"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createGroup(e.currentTarget.value);
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('create-group-input') as HTMLInputElement;
                    if (input.value) createGroup(input.value);
                  }}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                >
                  Criar
                </button>
              </div>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-300">
                <span className="bg-white px-4">Ou</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Entrar com Código</label>
              <div className="flex gap-2">
                <input
                  id="join-group-input"
                  type="text"
                  placeholder="Ex: AB12CD"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') joinGroup(e.currentTarget.value);
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('join-group-input') as HTMLInputElement;
                    if (input.value) joinGroup(input.value);
                  }}
                  className="px-6 py-3 bg-white border-2 border-black text-black rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>


          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 mt-8 text-gray-400 hover:text-red-500 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex font-sans text-gray-900">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                <TrendingUp size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">PeladaPro</h1>
            </div>

            <div className="px-2 mb-4">
              <ModeToggle />
            </div>

            <div className="flex items-center gap-2 px-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${supabaseStatus === 'connected' ? 'bg-green-500' :
                supabaseStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                {supabaseStatus === 'connected' ? 'Supabase Online' :
                  supabaseStatus === 'error' ? 'Erro de Conexão' : 'Usando Placeholders'}
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {/* Abas que TODO MUNDO vê */}
            <SidebarItem icon={PieChart} label="Dashboard" id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={Users} label="Jogadores" id="players" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={Calendar} label="Jogos" id="games" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Abas que SÓ O ADMIN vê */}
            {isAdmin && (
              <>
                <SidebarItem icon={DollarSign} label="Financeiro" id="finance" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem icon={Settings} label="Configurações" id="group" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 mt-4"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Grupo Atual</p>
              <p className="font-bold text-sm truncate">{group.name}</p>
              <div className="mt-1 mb-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${userRole === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {userRole === 'admin' ? 'Administrador' : 'Membro'}
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span className="truncate">{group.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-white border border-gray-100 px-2 py-1 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    Maps <ExternalLink size={8} />
                  </a>
                  <a
                    href={`https://waze.com/ul?q=${encodeURIComponent(group.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-white border border-gray-100 px-2 py-1 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    Waze <ExternalLink size={8} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold capitalize">{activeTab === 'dashboard' ? 'Visão Geral' : activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-gray-400 font-medium">Saldo em Caixa</span>
              <span className={`text-sm font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-black border-2 border-white shadow-sm overflow-hidden relative flex items-center justify-center text-white text-[10px] font-bold">
              {session.user.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={DollarSign}
                    label="Saldo Total"
                    value={`R$ ${cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    trend="+12%"
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    icon={Users}
                    label="Mensalistas"
                    value={monthlyStats.total.toString()}
                    subValue={`${monthlyStats.paid} pagos`}
                    color="bg-purple-50 text-purple-600"
                  />
                  <StatCard
                    icon={Calendar}
                    label="Próximo Jogo"
                    value={group.time.split(',')[0]}
                    subValue={group.time.split(',')[1]}
                    color="bg-orange-50 text-orange-600"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Local: {group.location}</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-[10px] bg-gray-50 py-2 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          Google Maps <ExternalLink size={10} />
                        </a>
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent(group.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-[10px] bg-gray-50 py-2 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          Waze <ExternalLink size={10} />
                        </a>
                      </div>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            const gameDate = group.time.split(',')[0];
                            const gameTime = group.time.split(',')[1]?.trim() || group.time;
                            const message = `⚽ *Convite Pelada Pro*\n*Grupo:* ${group.name}\n*Data:* ${gameDate}\n*Hora:* ${gameTime}\n*Local:* ${group.location}\n\nConfirme sua presença no app: ${window.location.origin}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="w-full mt-2 text-[10px] bg-green-500 text-white py-2 rounded-lg font-bold text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                          Convidar pelo WhatsApp <MessageCircle size={10} />
                        </button>
                      )}
                    </div>
                  </StatCard>
                  <StatCard
                    icon={TrendingUp}
                    label="Presença Média"
                    value="85%"
                    trend="+5%"
                    color="bg-green-50 text-green-600"
                  />
                </div>

                {/* CÓDIGO DO RANKING  */}

                <section className="bg-[#161B22] p-6 rounded-3xl border border-[#30363D] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-50">Ranking de Frequência</h2>
                      <p className="text-sm text-slate-400">Jogadores mais presentes nas partidas</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0E14] border border-[#30363D]"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'
                            }`}>
                            {index + 1}º
                          </span>
                          <div>
                            <p className="font-bold text-slate-100">{player.name}</p>
                            <p className="text-xs text-slate-400">{player.appearances} partidas</p>
                          </div>
                        </div>
                        {index === 0 && <span className="text-xl">👑</span>}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Charts & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg">Evolução do Caixa</h3>
                      <select className="text-sm bg-gray-50 border-none rounded-lg px-3 py-1 font-medium outline-none">
                        <option>Últimos 6 meses</option>
                      </select>
                    </div>
                    <div className="h-[300px] w-full min-w-0 relative">
                      {isChartReady && (
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <Tooltip
                              cursor={{ fill: '#F9FAFB' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="balance" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                    <h3 className="font-bold text-lg mb-6">Últimas Atividades</h3>
                    <div className="space-y-6">
                      {transactions.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {t.type === 'income' ? <Plus size={18} /> : <ChevronRight size={18} className="rotate-90" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{t.description}</p>
                            <p className="text-xs text-gray-400">{format(new Date(t.date), "dd 'de' MMM", { locale: ptBR })}</p>
                          </div>
                          <div className="ml-auto text-sm font-bold">
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount}
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="text-center py-10">
                          <History className="mx-auto text-gray-200 mb-2" size={40} />
                          <p className="text-sm text-gray-400">Nenhuma atividade recente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'players' && (
              <motion.div
                key="players"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pb-24"
              >
                {/* --- SEÇÃO MENSALISTAS --- */}
                <section>
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-bold text-slate-100">Mensalistas ({mensalistas.length})</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mensalistas.map(player => (
                      <div key={player.id} className="bg-[#161B22] p-5 rounded-3xl border border-[#30363D] shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{player.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-blue-600">R$ {player.monthlyFee}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${paidPlayerIds.has(String(player.id)) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {paidPlayerIds.has(String(player.id)) ? 'Em Dia' : 'Pendente'}
                              </span>
                            </div>
                          </div>

                          {!paidPlayerIds.has(String(player.id)) && (
                            <button
                              onClick={() => handleWhatsAppClick(player.phone || '', player.name)}
                              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center border border-green-100"
                              title="Cobrar via WhatsApp"
                            >
                              <span className="text-xs font-bold uppercase px-1">Cobrar</span>
                            </button>
                          )}

                        </div>

                        {/* PROTEÇÃO AQUI: Só mostra o botão de editar se for admin */}
                        {userRole === 'admin' && (
                          <button onClick={() => { setEditingItem(player); setModalType('player'); }} className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                            <Edit size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* --- SEÇÃO AVULSOS --- */}
                <section className="mt-8">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      Avulsos ({avulsos.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {avulsos.map(player => (
                      <div key={player.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center opacity-90">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{player.name}</p>
                            <p className="text-xs font-semibold text-orange-600 uppercase">
                              R$ {player.monthlyFee} p/ jogo
                            </p>
                          </div>
                        </div>

                        {/* PROTEÇÃO AQUI TAMBÉM: Só mostra editar para admin */}
                        {userRole === 'admin' && (
                          <button onClick={() => { setEditingItem(player); setModalType('player'); }} className="p-2 text-gray-300 hover:text-orange-600 transition-colors">
                            <Edit size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Botão Novo Jogador flutuante para Admin */}
                {userRole === 'admin' && (
                  <button
                    onClick={() => { setEditingItem(null); setModalType('player'); }}
                    className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 font-bold hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Plus size={20} />
                    Novo Jogador
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Jogos & Presença</h3>
                    <p className="text-gray-500">Controle quem compareceu a cada partida</p>
                  </div>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setModalType('attendance');
                      }}
                      className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Novo Jogo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attendances.map((att) => {
                    // 1. Criamos a lógica da data aqui em cima
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);

                    const dataPelada = parseISO(att.date);
                    dataPelada.setHours(0, 0, 0, 0);

                    const isFinalizado = dataPelada < hoje;

                    // 2. Agora damos o 'return' do desenho do card
                    return (
                      <div key={att.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar size={16} />
                            <span className="text-sm font-bold">
                              {format(parseISO(att.date), "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                          </div>

                          {/* Aqui é onde a mágica acontece: */}
                          {isFinalizado ? (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-bold text-gray-500 uppercase">
                              Finalizado
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 px-2 py-1 rounded-lg font-bold text-green-600 uppercase">
                              Agendado
                            </span>
                          )}
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Presentes</span>
                            <span className="font-bold text-green-600">{att.playerIds.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Faltas</span>
                            <span className="font-bold text-red-600">{att.absentIds.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                          {userRole === 'admin' ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingItem(att);
                                  setModalType('attendance');
                                }}
                                className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteAttendance(att.id)}
                                className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                              >
                                Excluir
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Apenas leitura</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {attendances.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                      <Calendar className="mx-auto text-gray-200 mb-2" size={48} />
                      <p className="text-gray-400">Nenhum jogo registrado ainda.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Financeiro</h3>
                    <p className="text-gray-500">Controle de entradas, saídas e mensalidades</p>
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setModalType('transaction');
                        }}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                      >
                        <Plus size={18} /> Nova Transação
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h4 className="font-bold">Transações Recentes</h4>
                        <button className="text-sm text-gray-400 font-bold hover:text-black">Ver Tudo</button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {transactions.map((t) => (
                          <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {t.category === 'monthly_fee' ? <Users size={20} /> :
                                  t.category === 'field_rent' ? <MapPin size={20} /> :
                                    <DollarSign size={20} />}
                              </div>
                              <div>
                                <p className="font-bold">{t.description}</p>
                                <p className="text-xs text-gray-400">{format(new Date(t.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              {userRole === 'admin' && (
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => {
                                      setEditingItem(t);
                                      setModalType('transaction');
                                    }}
                                    className="p-1 text-gray-300 hover:text-black transition-colors"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  {deletingId === t.id ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-bold"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => setDeletingId(null)}
                                        className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeletingId(t.id)}
                                      className="p-1 text-gray-300 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {transactions.length === 0 && (
                          <div className="p-12 text-center text-gray-400">
                            Nenhuma transação registrada.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-black text-white rounded-3xl p-8 shadow-xl">
                      <p className="text-gray-400 text-sm font-medium mb-1">Saldo Atual</p>
                      <h4 className="text-3xl font-bold mb-6">R$ {cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Entradas (Mês)</span>
                          <span className="font-bold text-green-400">+ R$ {monthlyFinanceStats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Saídas (Mês)</span>
                          <span className="font-bold text-red-400">- R$ {monthlyFinanceStats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                      <h4 className="font-bold mb-6">Status Mensalidades</h4>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-gray-600">Pagos</span>
                          </div>
                          <span className="font-bold">{monthlyStats.paid}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm font-medium text-gray-600">Pendentes</span>
                          </div>
                          <span className="font-bold">{monthlyStats.pending}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-50">
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-black h-full transition-all duration-500"
                              style={{ width: `${(monthlyStats.paid / (monthlyStats.total || 1)) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 text-right font-bold uppercase tracking-wider">
                            {Math.round((monthlyStats.paid / (monthlyStats.total || 1)) * 100)}% Arrecadado
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'group' && (
              <motion.div
                key="group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold">Configurações do Grupo</h3>
                  <p className="text-gray-500">Ajuste as informações básicas da sua pelada</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 space-y-8">
                  {userRole === 'admin' ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nome do Grupo</label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateGroupSettings({ name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Localização</label>
                        <input
                          type="text"
                          value={group.location}
                          onChange={(e) => updateGroupSettings({ location: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
                        />
                        {group.location && (
                          <div className="flex items-center gap-4 mt-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                            >
                              <MapPin size={12} /> Testar Google Maps
                            </a>
                            <a
                              href={`https://waze.com/ul?q=${encodeURIComponent(group.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                            >
                              <MapPin size={12} /> Testar Waze
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Horário</label>
                        <input
                          type="text"
                          value={group.time}
                          onChange={(e) => updateGroupSettings({ time: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Custo da Quadra (R$)</label>
                        <input
                          type="number"
                          value={isNaN(group.fieldCost) ? '' : group.fieldCost}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateGroupSettings({ fieldCost: isNaN(val) ? 0 : val });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl text-yellow-700 text-sm">
                        Apenas administradores podem alterar as configurações do grupo.
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome do Grupo</p>
                          <p className="font-bold">{group.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Custo da Quadra</p>
                          <p className="font-bold">R$ {group.fieldCost.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Localização</p>
                          <p className="font-bold">{group.location}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Horário</p>
                          <p className="font-bold">{group.time}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-gray-100">
                    <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Código de Convite</p>
                        <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-mono font-bold tracking-tighter">
                            {group.inviteCode || '...'}
                          </h3>
                          <button
                            onClick={() => {
                              if (group.inviteCode) {
                                navigator.clipboard.writeText(group.inviteCode);
                                alert('Código copiado!');
                              }
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                        <p className="text-xs opacity-60 mt-2">Compartilhe este código para que outros jogadores possam entrar no grupo.</p>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                        <Users size={120} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
                  <h3 className="text-xl font-bold">
                    {editingItem ? 'Editar' : 'Novo'} {
                      modalType === 'player' ? 'Jogador' :
                        modalType === 'attendance' ? 'Jogo' :
                          'Transação'
                    }
                  </h3>
                  <button onClick={() => setModalType(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                  {modalType === 'player' && (
                    <PlayerForm
                      initialData={editingItem}
                      onSubmit={(data) => {
                        if (editingItem) updatePlayer(editingItem.id, data);
                        else addPlayer(data.name, data.isMonthly, data.monthlyFee, novoTelefone);
                        setModalType(null);
                      }}
                    />
                  )}

                  {modalType === 'attendance' && (
                    <AttendanceForm
                      players={players}
                      initialData={editingItem}
                      onSubmit={(data) => {
                        if (editingItem) updateAttendance(editingItem.id, data);
                        else recordAttendance(data.date, data.playerIds, data.absentIds);
                        setModalType(null);
                      }}
                    />
                  )}

                  {modalType === 'transaction' && (
                    <TransactionForm
                      players={players}
                      initialData={editingItem}
                      onSubmit={(data) => {
                        if (editingItem) updateTransaction(editingItem.id, data);
                        else addTransaction(data.description, data.amount, data.type, data.category, data.playerId);
                        setModalType(null);
                      }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Forms ---
function PlayerForm({ initialData, onSubmit }: { initialData?: Player, onSubmit: (data: any) => void }) {
  const [name, setName] = useState(initialData?.name || '');
  const [isMonthly, setIsMonthly] = useState(initialData?.isMonthly ?? true);
  const [fee, setFee] = useState(initialData?.monthlyFee || 50);
  const [novoTelefone, setNovoTelefone] = useState(initialData?.phone || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, isMonthly, monthlyFee: fee, phone: novoTelefone });
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsMonthly(true)}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${isMonthly ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
        >
          Mensalista
        </button>
        <button
          type="button"
          onClick={() => setIsMonthly(false)}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${!isMonthly ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
        >
          Avulso
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor (R$)</label>
        <input
          type="number"
          value={isNaN(fee) ? '' : fee}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setFee(isNaN(val) ? 0 : val);
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
          required
        />
      </div>

      {/* --- NOVO CAMPO DE WHATSAPP --- */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp</label>
        <input
          type="text"
          placeholder="(00) 00000-0000"
          value={novoTelefone}
          onChange={(e) => setNovoTelefone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
        />
      </div>

      <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
        <Save size={20} />
        Salvar Jogador
      </button>
    </form>
  );
}

function AttendanceForm({ players, initialData, onSubmit }: { players: Player[], initialData?: Attendance, onSubmit: (data: any) => void }) {
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [presentIds, setPresentIds] = useState<string[]>(initialData?.playerIds || []);
  const [absentIds, setAbsentIds] = useState<string[]>(initialData?.absentIds || []);

  const togglePlayer = (id: string) => {
    if (presentIds.includes(id)) {
      setPresentIds(presentIds.filter(pid => pid !== id));
      setAbsentIds([...absentIds, id]);
    } else if (absentIds.includes(id)) {
      setAbsentIds(absentIds.filter(pid => pid !== id));
    } else {
      setPresentIds([...presentIds, id]);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ date, playerIds: presentIds, absentIds }); }} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data do Jogo</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chamada</label>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {players.filter(p => p.status === 'active').map(player => (
            <div
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${presentIds.includes(player.id) ? 'bg-green-50 border-green-200' :
                absentIds.includes(player.id) ? 'bg-red-50 border-red-200' :
                  'border-gray-100'
                }`}
            >
              <span className="font-bold text-sm">{player.name}</span>
              <div className="flex items-center gap-2">
                {presentIds.includes(player.id) && <CheckCircle2 size={18} className="text-green-600" />}
                {absentIds.includes(player.id) && <XCircle size={18} className="text-red-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
        <Save size={20} />
        Salvar Presença
      </button>
    </form>
  );
}

function TransactionForm({ players, initialData, onSubmit }: { players: Player[], initialData?: Transaction, onSubmit: (data: any) => void }) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'income');
  const [category, setCategory] = useState<Transaction['category']>(initialData?.category || 'other');
  const [playerId, setPlayerId] = useState(initialData?.playerId || '');

  const handlePlayerChange = (id: string) => {
    setPlayerId(id);
    if (category === 'monthly_fee' && id) {
      const player = players.find(p => String(p.id) === String(id));
      if (player) {
        setDescription(`Mensalidade - ${player.name}`);
        setAmount(player.monthlyFee);
        setType('income');
      }
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        description,
        amount,
        type,
        category,
        playerId: category === 'monthly_fee' ? (playerId || null) : null
      });
    }} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</label>
        <select
          value={category}
          onChange={(e) => {
            const newCat = e.target.value as any;
            setCategory(newCat);
            if (newCat === 'monthly_fee' && playerId) {
              handlePlayerChange(playerId);
            }
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
        >
          <option value="monthly_fee">Mensalidade</option>
          <option value="field_rent">Aluguel Quadra</option>
          <option value="equipment">Equipamento</option>
          <option value="other">Outros</option>
        </select>
      </div>

      {category === 'monthly_fee' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jogador</label>
          <select
            value={playerId}
            onChange={(e) => handlePlayerChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
            required
          >
            <option value="">Selecione o jogador</option>
            {players.filter(p => p.isMonthly).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</label>
        <input
          autoFocus
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
          required
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${type === 'income' ? 'bg-green-600 text-white border-green-600' : 'border-gray-100 text-gray-400'}`}
        >
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${type === 'expense' ? 'bg-red-600 text-white border-red-600' : 'border-gray-100 text-gray-400'}`}
        >
          Saída
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor (R$)</label>
        <input
          type="number"
          value={isNaN(amount) ? '' : amount}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setAmount(isNaN(val) ? 0 : val);
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors font-bold"
          required
        />
      </div>
      <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
        <Save size={20} />
        Salvar Transação
      </button>
    </form>
  );
}

// --- Subcomponents ---

function StatCard({ icon: Icon, label, value, subValue, trend, color, children }: {
  icon: any,
  label: string,
  value: string,
  subValue?: string,
  trend?: string,
  color: string,
  children?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
      <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      {children && <div className="mt-4 pt-4 border-t border-gray-50">{children}</div>}
    </div>
  );
}
