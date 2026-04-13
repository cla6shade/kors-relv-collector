import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Summary {
  stations: number;
  observations: number;
  byOrg: Array<{ organization_cd: string; count: bigint }>;
  latest: Date | null;
  error?: string;
}

async function loadSummary(): Promise<Summary> {
  try {
    const [stations, observations, byOrg, latest] = await Promise.all([
      prisma.station.count(),
      prisma.observation.count(),
      prisma.$queryRaw<Array<{ organization_cd: string; count: bigint }>>`
        SELECT organization_cd, COUNT(*)::bigint AS count
        FROM observation
        GROUP BY organization_cd
        ORDER BY organization_cd
      `,
      prisma.observation.findFirst({
        orderBy: { obs_time: "desc" },
        select: { obs_time: true },
      }),
    ]);
    return {
      stations,
      observations,
      byOrg,
      latest: latest?.obs_time ?? null,
    };
  } catch (err) {
    return {
      stations: 0,
      observations: 0,
      byOrg: [],
      latest: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function Page() {
  const s = await loadSummary();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold mb-6">수집 현황</h1>

      {s.error && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          DB 연결 실패: <code className="font-mono">{s.error}</code>
          <div className="mt-1 text-xs opacity-70">
            <code>.env</code> 의 <code>DATABASE_URL</code> 과 마이그레이션 적용 여부를 확인하세요.
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card label="관측소" value={s.stations} />
        <Card label="관측 레코드" value={s.observations} />
        <Card label="최신 관측" value={s.latest ? s.latest.toISOString() : "—"} />
      </div>

      <h2 className="text-lg font-semibold mb-2">기관별 관측 수</h2>
      <table className="w-full text-sm border border-slate-200 rounded-md overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">organization_cd</th>
            <th className="p-2">count</th>
          </tr>
        </thead>
        <tbody>
          {s.byOrg.length === 0 && (
            <tr>
              <td colSpan={2} className="p-2 text-slate-500">데이터 없음</td>
            </tr>
          )}
          {s.byOrg.map((r) => (
            <tr key={r.organization_cd} className="border-t border-slate-200">
              <td className="p-2 font-mono">{r.organization_cd}</td>
              <td className="p-2">{r.count.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
