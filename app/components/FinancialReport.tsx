'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FinancialReport() {
  const [inadimplentes, setInadimplentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDados() {
      const agora = new Date()
      // Pega o intervalo do mês atual
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
      const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const { data: jogadores, error } = await supabase
        .from('players')
        .select(`
          id,
          name,
          transactions (
            id,
            amount,
            date,
            category,
            type
          )
        `)
        .eq('transactions.category', 'monthly_fee')
        .eq('transactions.type', 'income')
        .gte('transactions.date', inicioMes)
        .lte('transactions.date', fimMes)

      if (!error && jogadores) {
        // Filtra quem não tem nenhuma transação 'monthly_fee' registrada no mês
        const lista = jogadores.filter((j: any) => j.transactions.length === 0)
        setInadimplentes(lista)
      }
      setLoading(false)
    }

    fetchDados()
  }, [])

  if (loading) return <p className="mt-4 text-gray-500 text-sm">Carregando financeiro...</p>

  return (
    <div className="mt-8 space-y-4">
      {/* Card de Resumo */}
      <div className={`p-4 rounded-xl border ${inadimplentes.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <h3 className={`text-lg font-bold ${inadimplentes.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
          {inadimplentes.length > 0 
            ? `Pendências: ${inadimplentes.length} jogadores` 
            : 'Mensalidades em dia! ✅'}
        </h3>
        <p className="text-xs text-gray-500">Mês de referência: Abril/2026</p>
      </div>

      {/* Tabela de Jogadores Pendentes */}
      {inadimplentes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {inadimplentes.map((player) => (
              <li key={player.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition">
                <span className="text-gray-800 font-medium">{player.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded uppercase">
                    Pendente
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}