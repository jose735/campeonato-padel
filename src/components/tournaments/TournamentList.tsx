import { useMemo, useState } from 'react';
import { Trash2, Pencil, X } from 'lucide-react';
import type { Tournament } from '@/types';
import type { CreateTournamentFormData } from '@/schemas/general-schemas';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import { usePagination } from '@/hooks/usePagination';
import TournamentForm from '@/components/tournaments/TournamentForm';

interface TournamentListProps {
  tournaments: Tournament[];
  currentTournamentId?: number | null;
  onDelete?: (id: number) => void;
  onUpdate?: (id: number, input: CreateTournamentFormData) => Promise<void>;
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
  currentTournamentId = null,
  onDelete,
  onUpdate,
  pageSize = 10,
}: TournamentListProps) {
  const [search, setSearch] = useState('');
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

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

  const handleUpdate = async (input: CreateTournamentFormData) => {
    if (!editingTournament || !onUpdate) return;
    await onUpdate(editingTournament.id, input);
    setEditingTournament(null);
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
          {pageItems.map((tournament) => {
            const isCurrent = currentTournamentId === tournament.id;
            return (
              <li
                key={tournament.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                  isCurrent
                    ? 'border-primary-300 bg-primary-50/70'
                    : 'border-neutral-200 bg-neutral-50/60'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-800">
                      {tournament.description}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        Actual
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">
                    Creado:{' '}
                    {new Date(tournament.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                {(onUpdate || onDelete) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {onUpdate && (
                      <Button
                        variant="secondary"
                        icon={Pencil}
                        onClick={() => setEditingTournament(tournament)}
                      >
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onDelete(tournament.id)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
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

      {editingTournament && onUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setEditingTournament(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-800">
                  Editar torneo
                </h3>
                <p className="mt-0.5 text-sm text-neutral-500">
                  Cambiá el nombre del torneo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTournament(null)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">
              <TournamentForm
                key={editingTournament.id}
                defaultValues={{ description: editingTournament.description }}
                submitLabel="Guardar cambios"
                onCancel={() => setEditingTournament(null)}
                onSubmit={handleUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
