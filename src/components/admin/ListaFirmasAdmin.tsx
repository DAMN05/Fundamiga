import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Firma } from '@/types';
import { FirmaService } from '@/services/firmaService';

interface ListaFirmasAdminProps {
  firmas: Record<string, Firma[]>;
  onFirmaEliminada: () => void;
}

export const ListaFirmasAdmin: React.FC<ListaFirmasAdminProps> = ({ 
  firmas, 
  onFirmaEliminada 
}) => {
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleEliminar = async (publicId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la firma de ${nombre}?`)) {
      return;
    }

    setEliminando(publicId);
    try {
      const exito = await FirmaService.eliminarFirma(publicId);
      
      if (exito) {
        alert('✅ Firma eliminada exitosamente');
        onFirmaEliminada();
      } else {
        alert('❌ Error al eliminar la firma');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar la firma');
    } finally {
      setEliminando(null);
    }
  };

  const renderSeccion = (titulo: string, listaFirmas: Firma[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-700">{titulo}</h3>
      {listaFirmas.length === 0 ? (
        <p className="text-gray-500 italic">No hay firmas registradas</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFirmas.map((firma) => (
            <div 
              key={firma.publicId} 
              className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <img 
                src={firma.ruta} 
                alt={firma.nombre} 
                className="h-20 mx-auto mb-3"
              />
              <p className="text-center font-semibold text-gray-800 mb-2">
                {firma.nombre}
              </p>
              <button
                onClick={() => handleEliminar(firma.publicId!, firma.nombre)}
                disabled={eliminando === firma.publicId}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {eliminando === firma.publicId ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Firmas Registradas</h2>
      
      {renderSeccion('Trabajadores', firmas.trabajador || [])}
      {renderSeccion('Supervisores', firmas.supervisor || [])}
      {renderSeccion('Responsables de Conteo', firmas.responsable || [])}
    </div>
  );
};