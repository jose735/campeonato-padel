import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Player } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import { usePagination } from '@/hooks/usePagination';

interface PlayerListProps {
  players: Player[];
  onEdit?: (player: Player) => void;
  onDelete?: (id: number) => void;
  pageSize?: number;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function PlayerList({
  players,
  onEdit,
  onDelete,
  pageSize = 7,
}: PlayerListProps) {
  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return players;

    return players.filter((player) => {
      const haystack = normalize(
        `${player.firstName} ${player.lastName} ${player.nickname ?? ''}`
      );
      return haystack.includes(term);
    });
  }, [players, search]);

  const { page, setPage, totalPages, pageItems, totalItems } = usePagination(
    filteredPlayers,
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
        placeholder="Buscar por nombre, apellido o apodo..."
        className="mb-4 max-w-sm"
      />

      {pageItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
          No se encontraron jugadores{search ? ` para "${search}"` : ''}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageItems.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3"
            >
              <div>
                <p className="font-medium text-neutral-800">{player.displayName}</p>
                {player.nickname && (
                  <p className="text-sm text-neutral-500">
                    {player.firstName} {player.lastName}
                  </p>
                )}
              </div>

              {(onEdit || onDelete) && (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      icon={Pencil}
                      onClick={() => onEdit(player)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      icon={Trash2}
                      onClick={() => onDelete(player.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
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