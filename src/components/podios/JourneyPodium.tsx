import type { StandingRow } from "@/lib/standings";
import type { Player } from "@/types";
import PlayerAvatar from "@/components/players/PlayerAvatar";

type PodiumPlace = 1 | 2 | 3;

interface JourneyPodiumProps {
  journeyDate: string;
  /** Posición de jornada en el torneo (opcional, p. ej. "Jornada 3") */
  label?: string;
  top3: StandingRow[];
  playersById: Map<number, Player>;
}

const placeStyles: Record<
  PodiumPlace,
  {
    block: string;
    badge: string;
    ring: string;
    height: string;
    medal: string;
  }
> = {
  1: {
    block: "bg-gradient-to-t from-amber-400 to-amber-300",
    badge: "bg-amber-500 text-white",
    ring: "ring-amber-400",
    height: "h-14 sm:h-20",
    medal: "🥇",
  },
  2: {
    block: "bg-gradient-to-t from-neutral-400 to-neutral-300",
    badge: "bg-neutral-500 text-white",
    ring: "ring-neutral-400",
    height: "h-10 sm:h-14",
    medal: "🥈",
  },
  3: {
    block: "bg-gradient-to-t from-orange-600 to-orange-400",
    badge: "bg-orange-600 text-white",
    ring: "ring-orange-400",
    height: "h-7 sm:h-10",
    medal: "🥉",
  },
};

function PodiumSlot({
  place,
  row,
  player,
}: {
  place: PodiumPlace;
  row: StandingRow | undefined;
  player: Player | undefined;
}) {
  const style = placeStyles[place];

  if (!row) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-end">
        <div className="mb-1 flex h-11 flex-col items-center justify-end sm:h-14">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-300 sm:h-10 sm:w-10">
            —
          </div>
        </div>
        <div
          className={`flex w-full max-w-[6rem] items-start justify-center rounded-t-md sm:max-w-[7rem] ${style.block} ${style.height} opacity-40`}
        >
          <span className="mt-1 text-sm font-bold text-white/80">{place}</span>
        </div>
      </div>
    );
  }

  const avatarPlayer: Pick<
    Player,
    "firstName" | "lastName" | "displayName" | "photoUrl"
  > = player ?? {
    firstName: row.playerName.split(" ")[0] ?? "?",
    lastName: row.playerName.split(" ").slice(1).join(" ") || "?",
    displayName: row.playerName,
    photoUrl: undefined,
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-end">
      <div className="mb-1 flex w-full flex-col items-center px-0.5">
        <div
          className={`relative mb-1 rounded-full ring-1.5 ring-2 ${style.ring} ring-offset-1`}
        >
          <PlayerAvatar
            player={avatarPlayer}
            size="sm"
            enablePreview={Boolean(avatarPlayer.photoUrl)}
            className="sm:!h-10 sm:!w-10 sm:!text-sm"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shadow sm:h-4.5 sm:w-4.5 ${style.badge}`}
            aria-label={`Puesto ${place}`}
          >
            {place}
          </span>
        </div>
        <p className="w-full truncate text-center text-[11px] font-semibold leading-tight text-neutral-800 sm:text-xs">
          {row.playerName}
        </p>
        <p className="mt-0.5 text-[10px] tabular-nums text-neutral-500 sm:text-[11px]">
          {row.points} pts
          {row.difference !== 0 && (
            <span
              className={
                row.difference > 0 ? " text-success-600" : " text-danger-600"
              }
            >
              {" "}
              · {row.difference > 0 ? "+" : ""}
              {row.difference}
            </span>
          )}
        </p>
      </div>

      <div
        className={`flex w-full max-w-[6rem] flex-col items-center rounded-t-md sm:max-w-[7rem] ${style.block} ${style.height}`}
      >
        <span className="mt-0.5 text-xs sm:mt-1 sm:text-sm" aria-hidden>
          {style.medal}
        </span>
        <span className="text-[11px] font-bold text-white drop-shadow-sm sm:text-xs">
          {place}º
        </span>
      </div>
    </div>
  );
}

/**
 * Podio estilo olímpico compacto: 2º (izq) · 1º (centro, más alto) · 3º (der).
 */
export default function JourneyPodium({
  journeyDate,
  label,
  top3,
  playersById,
}: JourneyPodiumProps) {
  const slot1 = top3[0];
  const slot2 = top3[1];
  const slot3 = top3[2];

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-baseline justify-between gap-2 border-b border-neutral-100 px-3 py-2 sm:px-4 sm:py-2.5">
        <h3 className="text-xs font-semibold text-neutral-800 sm:text-sm">
          {label ?? `Jornada · ${journeyDate}`}
        </h3>
        {label && (
          <p className="shrink-0 text-[11px] text-neutral-500 sm:text-xs">
            {journeyDate}
          </p>
        )}
      </div>

      <div className="flex items-end justify-center gap-0.5 px-1.5 pb-0 pt-3 sm:gap-2 sm:px-3 sm:pt-4">
        <PodiumSlot
          place={2}
          row={slot2}
          player={slot2 ? playersById.get(slot2.playerId) : undefined}
        />
        <PodiumSlot
          place={1}
          row={slot1}
          player={slot1 ? playersById.get(slot1.playerId) : undefined}
        />
        <PodiumSlot
          place={3}
          row={slot3}
          player={slot3 ? playersById.get(slot3.playerId) : undefined}
        />
      </div>
      <div className="h-1.5 bg-neutral-200 sm:h-2" />
    </div>
  );
}
