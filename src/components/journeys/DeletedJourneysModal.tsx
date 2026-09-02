import { useEffect, useMemo, useState } from "react";
import { X, Calendar, Loader2, ArrowRightLeft, Trash2 } from "lucide-react";
import type { Journey, Tournament } from "@/types";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import ReassignJourneyModal from "@/components/journeys/ReassignJourneyModal";
import { getDeletedJourneys } from "@/services/journeyService";
import { hardDeleteCompleteJourney } from "@/services/journeyDeletionService";

interface DeletedJourneysModalProps {
  /** Torneos normales (sin el especial de eliminadas). */
  tournaments: Tournament[];
  onClose: () => void;
  /** Se llama tras restaurar o eliminar definitivamente, para refrescar listados padre. */
  onChanged?: () => Promise<void> | void;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function DeletedJourneysModal({
  tournaments,
  onClose,
  onChanged,
}: DeletedJourneysModalProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  // true de inicio: el effect solo actualiza tras la respuesta async (sin setState síncrono)
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reassignJourney, setReassignJourney] = useState<Journey | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getDeletedJourneys()
      .then((data) => {
        if (!cancelled) setJourneys(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setJourneys([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return journeys;
    return journeys.filter((j) => {
      const haystack = normalize(
        `${j.journeyDate} ${j.fieldsQuantity} ${j.scoreLimit}`,
      );
      return haystack.includes(term);
    });
  }, [journeys, search]);

  const handleHardDelete = async (journey: Journey) => {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la jornada del ${journey.journeyDate}?\n\nSe borrarán la jornada, sus partidos y sus participantes. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setDeletingId(journey.id);
    try {
      await hardDeleteCompleteJourney(journey.id);
      setJourneys((prev) => prev.filter((j) => j.id !== journey.id));
      await onChanged?.();
    } catch (err) {
      console.error(err);
      window.alert("No se pudo eliminar la jornada. Intentá de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReassignSuccess = async () => {
    // Quitar de la lista local (ya salió del torneo de eliminadas)
    if (reassignJourney) {
      setJourneys((prev) => prev.filter((j) => j.id !== reassignJourney.id));
    }
    await onChanged?.();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-neutral-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-800">
                Jornadas eliminadas
              </h3>
              <p className="mt-0.5 text-sm text-neutral-500">
                Podés restaurarlas a un torneo o eliminarlas de forma definitiva.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="border-b border-neutral-100 px-5 py-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por fecha..."
              className="max-w-full"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                {search
                  ? "No se encontraron jornadas eliminadas con ese filtro."
                  : "No hay jornadas eliminadas."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map((journey) => {
                  const isDeleting = deletingId === journey.id;
                  const busy = deletingId !== null;
                  const sortLabel =
                    journey.journeyMatchSort != null
                      ? ` · #${journey.journeyMatchSort}`
                      : "";

                  return (
                    <li
                      key={journey.id}
                      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-800">
                          {journey.journeyDate}
                          {sortLabel}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                          <Calendar size={14} className="shrink-0" />
                          <span className="truncate">
                            {journey.fieldsQuantity} canchas · {journey.scoreLimit}{" "}
                            pts
                          </span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="secondary"
                          icon={ArrowRightLeft}
                          onClick={() => setReassignJourney(journey)}
                          disabled={busy}
                          className="px-3"
                        >
                          Reasignar
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleHardDelete(journey)}
                          disabled={busy}
                          title="Eliminar definitivamente"
                          aria-label="Eliminar definitivamente"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger-600 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {reassignJourney && (
        <ReassignJourneyModal
          journey={reassignJourney}
          tournaments={tournaments}
          onClose={() => setReassignJourney(null)}
          onSuccess={handleReassignSuccess}
        />
      )}
    </>
  );
}
