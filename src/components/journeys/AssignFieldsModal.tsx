import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface AssignFieldsModalProps {
  currentFields: number[];
  onClose: () => void;
  onSave: (mapping: Record<number, number>) => Promise<void>;
}

function buildInitialValues(fields: number[]): Record<number, string> {
  const initial: Record<number, string> = {};
  fields.forEach((field) => {
    initial[field] = String(field);
  });
  return initial;
}

export default function AssignFieldsModal({
  currentFields,
  onClose,
  onSave,
}: AssignFieldsModalProps) {
  // Como el componente se monta recién cuando el modal se abre,
  // este estado inicial ya nace con los valores actuales
  // — no hace falta useEffect para sincronizarlo.
  const [values, setValues] = useState<Record<number, string>>(() =>
    buildInitialValues(currentFields),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: number, raw: string) => {
    setValues((prev) => ({ ...prev, [field]: raw }));
  };

  const handleSave = async () => {
    setError(null);

    const mapping: Record<number, number> = {};
    const newValues: number[] = [];

    for (const field of currentFields) {
      const raw = values[field]?.trim();

      if (!raw) {
        setError("Todas las canchas deben tener un número asignado.");
        return;
      }

      const parsed = Number(raw);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        setError("El número de cancha debe ser un entero positivo.");
        return;
      }

      mapping[field] = parsed;
      newValues.push(parsed);
    }

    if (new Set(newValues).size !== newValues.length) {
      setError("No puede repetir el mismo número de cancha.");
      return;
    }

    setIsSaving(true);

    try {
      await onSave(mapping);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar las canchas.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-800">
            Asignar canchas
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-neutral-500">
          Los nuevos números de cancha se aplicarán a todas las rondas de la
          jornada.
        </p>

        <div className="flex flex-col gap-3">
          {currentFields.map((field) => (
            <div
              key={field}
              className="flex items-center justify-between gap-3"
            >
              <label className="text-sm font-medium text-neutral-700">
                Cancha #{field}
              </label>

              <input
                type="number"
                min={1}
                value={values[field] ?? ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-center text-sm font-semibold text-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-xs font-medium text-danger-600">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSaving && <Loader2 size={13} className="animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}