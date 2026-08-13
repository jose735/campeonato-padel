import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournament-store';
import { useJourneyStore } from '@/store/journey-store';
import { useJourneyMatchStore } from '@/store/journey-match-store';
import JourneyForm from '@/components/journeys/JourneyForm';
import JourneyList from '@/components/journeys/JourneyList';
import PlayerSelectionModal from '@/components/journeys/PlayerSelectionModal';

export default function JourneysPage() {
  const navigate = useNavigate();
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { journeys, isLoading, fetchJourneys, createJourney } = useJourneyStore();
  const { journeyIdsWithMatches, fetchJourneyIdsWithMatches } = useJourneyMatchStore();
  const [activeJourneyId, setActiveJourneyId] = useState<number | null>(null);

  useEffect(() => {
    fetchTournaments();
    fetchJourneys();
    fetchJourneyIdsWithMatches();
  }, [fetchTournaments, fetchJourneys, fetchJourneyIdsWithMatches]);

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Jornadas</h2>
        <JourneyForm tournaments={tournaments} onSubmit={createJourney} />
      </div>

      <div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">Listado</h3>
        {isLoading ? (
          <p className="text-neutral-500">Cargando...</p>
        ) : (
          <JourneyList
            journeys={journeys}
            tournaments={tournaments}
            journeyIdsWithMatches={journeyIdsWithMatches}
            onManagePlayers={setActiveJourneyId}
            onViewMatches={(id) => navigate(`/jornadas/${id}`)}
          />
        )}
      </div>

      {activeJourneyId !== null && (
        <PlayerSelectionModal
          key={activeJourneyId}
          journeyId={activeJourneyId}
          onClose={() => setActiveJourneyId(null)}
          onSuccess={() => {
            fetchJourneyIdsWithMatches();
          }}
        />
      )}
    </div>
  );
}