import { useMemo, useState } from 'react';
import { Users, Eye, Calendar } from 'lucide-react';
import type { Journey, Tournament } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { usePagination } from '@/hooks/usePagination';

interface JourneyListProps {
  journeys: Journey[];
  tournaments: Tournament[];
  journeyIdsWithMatches: number[];
  onManagePlayers: (journeyId: number) => void;
  onViewMatches: (journeyId: number) => void;
  pageSize?: number;
}

type StatusFilter = 'all' | 'open' | 'finished';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function JourneyList({
  journeys,
  tournaments,
  journeyIdsWithMatches,
  onManagePlayers,
  onViewMatches,
  pageSize = 10,
}: JourneyListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const getTournamentName = (tournamentId: number) =>
    tournaments.find((t) => t.id === tournamentId)?.description ?? 'Torneo desconocido';

  const filteredJourneys = useMemo(() => {
    const term = normalize(search.trim());

    return journeys.filter((journey) => {
      const isFinished = journey.status === 'finished';

      if (statusFilter === 'open' && isFinished) return false;
      if (statusFilter === 'finished' && !isFinished) return false;

      if (!term) return true;

      const haystack = normalize(`${getTournamentName(journey.tournamentId)} ${journey.journeyDate}`);
      return haystack.includes(term);
    });
  }, [journeys, tournaments, search, statusFilter]);

  const { page, setPage, totalPages, pageItems, totalItems } = usePagination(
    filteredJourneys,
    pageSize
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por torneo o fecha..."
          className="max-w-sm"
        />
        <SegmentedControl
          value={statusFilter}
          onChange={handleStatusChange}
          options={[
            { label: 'Todas', value: 'all' },
            { label: 'Abiertas', value: 'open' },
            { label: 'Finalizadas', value: 'finished' },
          ]}
        />
      </div>

      {pageItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
          No se encontraron jornadas con esos filtros.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageItems.map((journey) => {
            const hasMatches = journeyIdsWithMatches.includes(journey.id);
            const isFinished = journey.status === 'finished';

            return (
              <li
                key={journey.id}
                className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-800">
                      {getTournamentName(journey.tournamentId)}
                    </p>
                    {isFinished && (
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Finalizada
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                    <Calendar size={14} />
                    {journey.journeyDate} · {journey.fieldsQuantity} cancha(s) · hasta{' '}
                    {journey.scoreLimit} pts
                  </p>
                </div>

                {hasMatches ? (
                  <Button
                    variant="secondary"
                    icon={Eye}
                    onClick={() => onViewMatches(journey.id)}
                    className="self-start sm:self-auto"
                  >
                    Ver partidos
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    icon={Users}
                    onClick={() => onManagePlayers(journey.id)}
                    className="self-start sm:self-auto"
                  >
                    Agregar jugadores
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}