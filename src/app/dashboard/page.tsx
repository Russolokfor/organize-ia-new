import KpiCard from "@/components/ui/KpiCard";
import AreaSparkline from "@/components/ui/AreaSparkline";

export default function DashboardPage() {
  // Exemplo: troque pelos seus dados reais
  const spark = [0, 0, 0, 0, 1, 0];

  return (
    <div className="grid gap-4">
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Ativas" value={15} subtitle="Ainda não finalizadas" />
        <KpiCard title="Hoje" value={2} subtitle="Prazo hoje ou fixadas" />
        <KpiCard title="Atrasadas" value={0} subtitle="Vencidas e abertas" />
        <KpiCard title="Taxa 7d" value="21%" subtitle="Concluídas / Criadas" />
      </div>

      {/* Execução */}
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted2">
              Execução
            </div>
            <div className="mt-1 text-lg sm:text-xl font-semibold text-zinc-100">
              Concluídas por dia
            </div>
            <div className="mt-1 text-sm text-muted">
              Últimos 14 dias • total: 4
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn">Ver desempenho</button>
            <button className="btn btn-primary">Nova tarefa</button>
          </div>
        </div>

        <div className="mt-4">
          <AreaSparkline values={spark} heightClass="h-48 sm:h-56 lg:h-64" />
          <div className="mt-2 text-xs text-muted2">
            Começo: 2026-02-19 • Hoje: 2026-03-04
          </div>
        </div>
      </div>
    </div>
  );
}