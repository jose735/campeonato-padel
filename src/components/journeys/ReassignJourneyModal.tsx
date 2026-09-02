import { useState } from "react";
import { X, Loader2, ArrowRightLeft } from "lucide-react";
import type { Journey, Tournament } from "@/types";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import { DELETED_TOURNAMENT_ID, isDeletedTournamentId } from "@/lib/constants";
import { reassignJourneyTournament } from "@/services/journeyService";
import { softDeleteCompleteJourney } from "@/services/journeyDeletionService";

interface ReassignJourneyModalProps {
  journey: Journey;
  /** Torneos normales (sin el especial de eliminadas). */
  tournaments: Tournament[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

const DELETED_TOURNAMENT_LABEL = "Jornadas eliminadas";

export default function ReassignJourneyModal({
  journey,
  tournaments,
  onClose,
  onSuccess,
}: ReassignJourneyModalProps) {
  const isFromDeleted = isDeletedTournamentId(journey.tournamentId);

  const currentTournamentName = isFromDeleted
    ? DELETED_TOURNAMENT_LABEL
    : (tournaments.find((t) => t.id === journey.tournamentId)?.description ??
      "Torneo desconocido");

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | "">(
    isFromDeleted ? "" : journey.tournamentId,
  );
  const [isReassigning, setIsReassigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Desde una jornada activa: otros torneos + opción de enviar a eliminadas.
  // Desde eliminadas: solo torneos normales (restaurar).
  const selectableTournaments = isFromDeleted
    ? tournaments
    : tournaments.filter((t) => t.id !== journey.tournamentId);

  const handleReassign = async () => {
    if (selectedTournamentId === "") {
      setError("Seleccioná un torneo.");
      return;
    }

    if (selectedTournamentId === journey.tournamentId) {
      setError("Seleccioná un torneo distinto al actual.");
      return;
    }

    const goingToDeleted = isDeletedTournamentId(selectedTournamentId);

    const targetName = goingToDeleted
      ? DELETED_TOURNAMENT_LABEL
      : (tournaments.find((t) => t.id === selectedTournamentId)?.description ??
        "el torneo seleccionado");

    const confirmed = window.confirm(
      goingToDeleted
        ? `¿Enviar la jornada del ${journey.journeyDate} a "${DELETED_TOURNAMENT_LABEL}"?\n\nDejará de mostrarse en el listado de jornadas. Podrás restaurarla o eliminarla definitivamente desde "Jornadas eliminadas".`
        : isFromDeleted
          ? `¿Restaurar la jornada del ${journey.journeyDate} al torneo "${targetName}"?\n\nVolverá a aparecer en el listado de jornadas asociada a ese torneo.`
          : `¿Reasignar la jornada del ${journey.journeyDate} al torneo "${targetName}"?\n\nLos jugadores y partidos de esta jornada quedarán asociados al nuevo torneo.`,
    );
    if (!confirmed) return;

    setIsReassigning(true);
    setError(null);
    try {
      if (goingToDeleted) {
        await softDeleteCompleteJourney(journey.id);
      } else {
        await reassignJourneyTournament(journey.id, selectedTournamentId);
      }
      await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        goingToDeleted
          ? "No se pudo enviar la jornada a eliminadas. Intentá de nuevo."
          : "No se pudo reasignar la jornada. Intentá de nuevo.",
      );
    } finally {
      setIsReassigning(false);
    }
  };

  const busy = isReassigning;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-800">
              {isFromDeleted ? "Restaurar jornada" : "Reasignar jornada"}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {currentTournamentName} · {journey.journeyDate}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="text-sm text-neutral-600">
            {isFromDeleted
              ? "Elegí el torneo al que querés devolver esta jornada. Los jugadores y partidos se mantienen."
              : "Cambiá el torneo al que pertenece esta jornada, o enviala a Jornadas eliminadas. Los jugadores y partidos se mantienen."}
          </p>

          <SelectField
            label={isFromDeleted ? "Torneo de destino" : "Nuevo torneo"}
            value={selectedTournamentId}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Number(e.target.value);
              setSelectedTournamentId(value);
              setError(null);
            }}
            disabled={busy}
          >
            {!isFromDeleted && (
              <option value={journey.tournamentId}>
                {currentTournamentName} (actual)
              </option>
            )}
            {isFromDeleted && (
              <option value="" disabled>
                Seleccioná un torneo
              </option>
            )}
            {selectableTournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.description}
              </option>
            ))}
            {!isFromDeleted && (
              <option value={DELETED_TOURNAMENT_ID}>
                {DELETED_TOURNAMENT_LABEL}
              </option>
            )}
          </SelectField>

          {selectableTournaments.length === 0 && isFromDeleted && (
            <p className="text-sm text-neutral-500">
              No hay torneos disponibles para restaurar la jornada.
            </p>
          )}

          {error && <p className="text-sm text-danger-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            icon={isReassigning ? Loader2 : ArrowRightLeft}
            onClick={handleReassign}
            disabled={
              busy ||
              selectedTournamentId === "" ||
              selectedTournamentId === journey.tournamentId ||
              (isFromDeleted && selectableTournaments.length === 0)
            }
            className={isReassigning ? "[&_svg]:animate-spin" : ""}
          >
            {isReassigning
              ? isFromDeleted
                ? "Restaurando..."
                : "Reasignando..."
              : isFromDeleted
                ? "Restaurar"
                : "Reasignar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
