import { Trash2 } from 'lucide-react';
import type { Tournament } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface TournamentListProps {
  tournaments: Tournament[];
  onDelete?: (id: number) => void;
  pageSize?: number;
}

export default function TournamentList({
  tournaments,
  onDelete,
  pageSize = 10,
}: TournamentListProps) {
  const { page, setPage, totalPages, pageItems, totalItems } =
    usePagination(tournaments, pageSize);

  return (
    <div>
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
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => onDelete(tournament.id)}
              >
                Eliminar
              </Button>
            )}
          </li>
        ))}
      </ul>

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