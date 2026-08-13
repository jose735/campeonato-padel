import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Tournament } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import { usePagination } from '@/hooks/usePagination';

interface TournamentListProps {
  tournaments: Tournament[];
  onDelete?: (id: number) => void;
  pageSize?: number;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function TournamentList({
  tournaments,
  onDelete,
  pageSize = 10,
}: TournamentListProps) {
  const [search, setSearch] = useState('');

  const filteredTournaments = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return tournaments;

    return tournaments.filter((tournament) =>
      normalize(tournament.description).includes(term)
    );
  }, [tournaments, search]);

  const { page, setPage, totalPages, pageItems, totalItems } = usePagination(
    filteredTournaments,
    pageSize
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar por descripción..."
        className="mb-4 max-w-sm"
      />

      {pageItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
          No se encontraron torneos{search ? ` para "${search}"` : ''}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageItems.map((tournament) => (
            <li
              key={tournament.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3"
            >
              <div>
                <p className="font-medium text-neutral-800">{tournament.description}</p>
                <p className="text-sm text-neutral-500">
                  Creado: {new Date(tournament.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              {onDelete && (
                <Button variant="danger" icon={Trash2} onClick={() => onDelete(tournament.id)}>
                  Eliminar
                </Button>
              )}
            </li>
          ))}
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